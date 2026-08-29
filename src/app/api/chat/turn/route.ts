import { NextRequest, NextResponse } from "next/server";
import { AIAgent, DatabaseAdapter } from "@dyrected/core";
import config from "../../../../../dyrected.config";

export const dynamic = "force-dynamic";

interface TurnRequest {
  conversationId?: string;
  threadId?: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  prefillServiceId?: string;
  customerName?: string;
  customerContact?: string;
  role?: "customer" | "admin" | "owner";
}

/**
 * GET /api/chat/turn?threadId=xyz
 * Loads historical messages for an existing persistent session using Dyrected AIAgent
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json({ error: "threadId is required" }, { status: 400 });
    }

    const agent = new AIAgent({
      db: config.db as DatabaseAdapter,
      config: config as any,
      projectId: "default",
      userId: threadId,
      userName: "Customer",
    });

    const messages = await agent.getMessages(threadId);

    return NextResponse.json({
      threadId,
      messages: (messages || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.createdAt || m.created_at || new Date().toISOString(),
      })),
    });
  } catch (err: any) {
    console.error("❌ Error fetching thread history:", err);
    return NextResponse.json(
      { error: "Failed to load thread history", details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/turn
 * Initiates streaming response with Dyrected AIAgent using deepseek-v4-flash
 */
export async function POST(req: NextRequest) {
  try {
    const body: TurnRequest = await req.json();
    const { messages = [] } = body;
    const threadId = body.threadId || body.conversationId || `thread-${Date.now()}`;
    const userRole = body.role || req.headers.get("x-user-role") || "customer";

    if (!messages.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // 1. Extract customer name if provided
    const allUserText = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(" ");

    const nameMatch = allUserText.match(
      /(?:my name is|i am|i'm|call me|name:?)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i
    );
    const detectedName = nameMatch ? nameMatch[1].trim() : body.customerName || (userRole === "admin" ? "Shop Owner" : "Customer");

    // 2. Initialize Dyrected AIAgent with user context and role
    const agent = new AIAgent({
      db: config.db as DatabaseAdapter,
      config: config as any,
      projectId: "default",
      userId: threadId,
      userName: detectedName,
      userRole: userRole,
    });

    // 3. Ensure thread exists via Dyrected native getOrCreateThread
    await agent.getOrCreateThread(threadId, lastUserMessage.slice(0, 40) || "Print Quote Chat");

    // 4. Stream AI response (Dyrected automatically persists user & assistant turns)
    const encoder = new TextEncoder();
    const generator = agent.streamReply(threadId, lastUserMessage);

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generator) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (streamErr) {
          console.error("⚠️ Stream error in /api/chat/turn:", streamErr);
          try {
            const friendlyError =
              "\n\n⚠️ *I had a momentary connection hiccup with our workshop servers. Please click retry or send your message again!*";
            controller.enqueue(encoder.encode(friendlyError));
            controller.close();
          } catch {
            controller.error(streamErr);
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Thread-Id": threadId,
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err: any) {
    console.error("❌ /api/chat/turn error:", err);
    return NextResponse.json(
      { error: "Internal server error during chat turn", details: err?.message },
      { status: 500 }
    );
  }
}

