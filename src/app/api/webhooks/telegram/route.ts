import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { GoogleGenAI, Type } from "@google/genai";
import { quotePrintJob } from "@/lib/pricingEngine";
import type { Services, Pricing_rules } from "@/dyrected-types";

export const dynamic = "force-dynamic";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:REDACTED_DB_PASSWORD@185.190.143.94:5432/myprintos";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_BOT_SECRET_TOKEN = process.env.TELEGRAM_BOT_SECRET_TOKEN || "";

interface ExtractedSpec {
  customerName?: string;
  customerContact?: string;
  item?: string;
  serviceId?: string;
  serviceCategory?: string;
  quantity?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;
  sizeArea?: string;
  materialName?: string;
  spec?: string;
  isComplete: boolean;
  nextQuestion?: string;
  consultativeSwitchReason?: string;
}

const SYSTEM_INSTRUCTION = `
You are the AI Operations Assistant for PrintOS, serving practical Nigerian print and branding businesses (like Shomolu & Mushin commercial printers in Lagos).

YOUR ROLE:
You chat with customers on Telegram who want custom print jobs (t-shirts, polos, banners, stickers, business cards, flyers, mugs, photo frames).
Customers don't know technical printing terms (like DTF, SAV, GSM, Sublimation). They just want their job done quickly, reliably, and priced honestly.

LANGUAGE & COMMUNICATION RULES (STRICT):
1. Always speak in warm, simple, conversational English.
2. Never force technical jargon on the customer.
3. Ask ONLY 1 or 2 practical diagnostic questions at a time:
   - How many units/pieces do you need?
   - What does your design look like (is it a simple 1-color logo, or colorful graphic/photo)?
   - What dimensions or garment type (e.g. 10x4 ft banner, round neck cotton shirt, polo)?
4. CONSULTATIVE ADVICE:
   - If a customer asks for a custom shirt with 100+ units and a simple 1-color logo, explain that Screen Printing will save them money compared to full-color digital.
   - If they need under 20 shirts or complex photo graphics, recommend Full-Color Custom Shirts.
5. COMPLETION CRITERIA:
   - Mark isComplete: true ONLY when you know: (1) item type, (2) quantity (number), and (3) size/dimension or basic print position.
   - If isComplete: false, formulate nextQuestion to ask the missing detail naturally.
`;

/**
 * Send a message back to Telegram
 */
async function sendTelegramMessage(chatId: number | string, text: string, parseMode: "Markdown" | "HTML" = "Markdown") {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("⚠️ TELEGRAM_BOT_TOKEN is not set. Cannot send message to chat:", chatId);
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("❌ Failed to send Telegram message:", errData);
      
      // Retry once without Markdown formatting in case of unescaped markdown syntax
      if (parseMode === "Markdown") {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: text.replace(/[*_`\[\]()]/g, ""),
          }),
        });
      }
    }
  } catch (err) {
    console.error("❌ Telegram sendMessage error:", err);
  }
}

/**
 * GET Handler - Allows easy webhook health check and status inspection
 */
export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/webhooks/telegram",
    hasBotToken: Boolean(TELEGRAM_BOT_TOKEN),
    hasSecretToken: Boolean(TELEGRAM_BOT_SECRET_TOKEN),
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST Handler - Receives updates from Telegram Bot API
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify Secret Token header if configured
    if (TELEGRAM_BOT_SECRET_TOKEN) {
      const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
      if (secretHeader !== TELEGRAM_BOT_SECRET_TOKEN) {
        console.warn("⚠️ Unauthorized webhook request: Invalid secret token header");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const update = await req.json();

    // Check if update contains a message
    const message = update.message || update.edited_message;
    if (!message || !message.text) {
      // Return 200 OK for other update types (photos, join events, callbacks)
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const customerFirstName = message.from?.first_name || "";
    const customerLastName = message.from?.last_name || "";
    const customerUsername = message.from?.username ? `@${message.from.username}` : "";
    const customerFullName = `${customerFirstName} ${customerLastName}`.trim() || customerUsername || "Telegram Customer";
    const conversationId = `tg-${chatId}`;

    // 2. Handle /start and /help commands
    if (text === "/start" || text === "/help") {
      const welcomeMsg =
        `👋 *Hello ${customerFirstName || "there"}! Welcome to PrintOS.* 🖨️\n\n` +
        `I am your direct assistant for custom printing & branding jobs in Lagos.\n\n` +
        `Tell me what you would like to print! For example:\n` +
        `• *"I need 50 pieces of black round-neck custom t-shirts with chest logo"*\n` +
        `• *"I want a 10x4 ft outdoor flex banner with eyelets"*\n` +
        `• *"How much for 200 branded business cards?"*\n\n` +
        `Type your request below to get an instant price quote!`;

      await sendTelegramMessage(chatId, welcomeMsg);
      return NextResponse.json({ ok: true });
    }

    // 3. Fetch catalog services and pricing rules from DB
    let services: Services[] = [];
    let pricingRules: Pricing_rules[] = [];

    try {
      const sql = postgres(DATABASE_URL, { max: 1, timeout: 4 });
      const [srvRows, ruleRows] = await Promise.all([
        sql`SELECT id, data FROM collection_services WHERE (data->>'isActive')::boolean IS NOT FALSE ORDER BY id ASC`,
        sql`SELECT id, data FROM collection_pricing_rules`,
      ]);
      await sql.end();

      services = srvRows.map((r) => ({ id: r.id, ...(r.data || {}) })) as Services[];
      pricingRules = ruleRows.map((r) => ({ id: r.id, ...(r.data || {}) })) as Pricing_rules[];
    } catch (dbErr) {
      console.warn("⚠️ Could not load DB services for Telegram turn, using fallback:", dbErr);
    }

    // 4. Extract structured spec using Gemini 2.5 Flash
    let extracted: ExtractedSpec = {
      isComplete: false,
      quantity: 50,
      nextQuestion: "How many units do you need printed, and what dimensions or layout?",
    };

    if (GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const catalogContext = services
          .map((s) => `- ${s.name} (ID: ${s.id}, Category: ${s.category}, Engine: ${s.pricingEngine})`)
          .join("\n");

        const prompt = `
PRINT SERVICES CATALOG:
${catalogContext}

CUSTOMER DETAILS:
Name: ${customerFullName}
Contact: ${customerUsername || `Telegram ID: ${chatId}`}

MESSAGE FROM TELEGRAM USER:
"${text}"

Extract the structured print job specifications from this message.
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                customerName: { type: Type.STRING },
                customerContact: { type: Type.STRING },
                item: { type: Type.STRING },
                serviceId: { type: Type.STRING },
                serviceCategory: { type: Type.STRING },
                quantity: { type: Type.INTEGER },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                dimensionUnit: { type: Type.STRING },
                sizeArea: { type: Type.STRING },
                materialName: { type: Type.STRING },
                spec: { type: Type.STRING },
                isComplete: { type: Type.BOOLEAN },
                nextQuestion: { type: Type.STRING },
                consultativeSwitchReason: { type: Type.STRING },
              },
              required: ["isComplete"],
            },
          },
        });

        const resText = response.text;
        if (resText) {
          extracted = JSON.parse(resText);
        }
      } catch (aiErr) {
        console.warn("⚠️ Gemini extraction error in Telegram webhook, using fallback:", aiErr);
        extracted = deterministicTelegramParser(text);
      }
    } else {
      extracted = deterministicTelegramParser(text);
    }

    // 5. Quote if complete or ask follow-up diagnostic question
    if (extracted.isComplete && extracted.quantity && extracted.quantity > 0) {
      const quote = quotePrintJob(
        {
          serviceId: extracted.serviceId,
          item: extracted.item || "Custom Print Order",
          quantity: extracted.quantity,
          width: extracted.width,
          height: extracted.height,
          sizeArea: extracted.sizeArea,
          spec: extracted.spec,
        },
        services,
        pricingRules
      );

      let replyMsg = `✅ *Price Quote Ready!*\n\n`;
      replyMsg += `📦 *Job:* ${quote.quantity}x ${quote.item}\n`;
      replyMsg += `📐 *Spec:* ${quote.specSummary}\n\n`;

      if (extracted.consultativeSwitchReason) {
        replyMsg += `💡 _${extracted.consultativeSwitchReason}_\n\n`;
      }

      replyMsg += `💰 *Customer will pay:* ₦${quote.totalPrice.toLocaleString()}\n`;
      replyMsg += `💳 *70% Material Deposit:* ₦${quote.depositRequired.toLocaleString()}\n`;
      replyMsg += `🤝 *Balance on Delivery:* ₦${quote.balanceDue.toLocaleString()}\n\n`;
      replyMsg += `🔖 *Order Ref:* \`${quote.orderNumber}\`\n\n`;
      replyMsg += `Reply *CONFIRM* to lock in your order, or ask any questions!`;

      // Save to database
      try {
        const sql = postgres(DATABASE_URL, { max: 1, timeout: 4 });

        // Save conversation
        await sql`
          INSERT INTO collection_conversations (id, data, created_at, updated_at)
          VALUES (
            ${conversationId},
            ${sql.json({
              id: conversationId,
              customerName: customerFullName,
              customerContact: customerUsername || `tg:${chatId}`,
              channel: "telegram",
              status: "completed",
              telegramChatId: chatId,
              lastMessage: text,
            })},
            NOW(),
            NOW()
          )
          ON CONFLICT (id) DO UPDATE
          SET data = ${sql.json({
            id: conversationId,
            customerName: customerFullName,
            customerContact: customerUsername || `tg:${chatId}`,
            channel: "telegram",
            status: "completed",
            telegramChatId: chatId,
            lastMessage: text,
          })}, updated_at = NOW()
        `;

        // Save print job
        const printJobId = `job-${quote.orderNumber}`;
        await sql`
          INSERT INTO collection_print_jobs (id, data, created_at, updated_at)
          VALUES (
            ${printJobId},
            ${sql.json({
              id: printJobId,
              item: quote.item,
              quantity: quote.quantity,
              spec: quote.specSummary,
              quotedPrice: quote.totalPrice,
              materialCost: Math.round(quote.totalPrice * 0.6),
              marginPercent: quote.marginPercent,
              marginStatus: quote.marginPercent >= 30 ? "healthy" : "atRisk",
              status: "quoted",
              sourceChannel: "telegram",
              conversation: conversationId,
              telegramChatId: chatId,
            })},
            NOW(),
            NOW()
          )
          ON CONFLICT (id) DO UPDATE
          SET data = ${sql.json({
            id: printJobId,
            item: quote.item,
            quantity: quote.quantity,
            spec: quote.specSummary,
            quotedPrice: quote.totalPrice,
            materialCost: Math.round(quote.totalPrice * 0.6),
            marginPercent: quote.marginPercent,
            marginStatus: quote.marginPercent >= 30 ? "healthy" : "atRisk",
            status: "quoted",
            sourceChannel: "telegram",
            conversation: conversationId,
            telegramChatId: chatId,
          })}, updated_at = NOW()
        `;

        await sql.end();
      } catch (dbSaveErr) {
        console.warn("⚠️ Failed to record Telegram job to DB:", dbSaveErr);
      }

      await sendTelegramMessage(chatId, replyMsg);
    } else {
      const followUp =
        extracted.nextQuestion ||
        "Tell me: **how many units do you need**, and what dimensions or layout?";
      await sendTelegramMessage(chatId, followUp);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Telegram Webhook error:", err);
    // Always return 200 OK to Telegram so it doesn't storm with retries
    return NextResponse.json({ ok: false, error: message }, { status: 200 });
  }
}

/**
 * Fallback parser for Telegram messages
 */
function deterministicTelegramParser(text: string): ExtractedSpec {
  const qtyMatch = text.match(/\b(\d+)\s*(pcs|pieces|units|shirts|cards|copies|stands|frames|mugs|banners)?\b/i);
  const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : undefined;

  const widthHeightMatch = text.match(/(\d+)\s*(?:x|by|\*)\s*(\d+)\s*(ft|feet|in|inch|cm|m)?/i);
  const width = widthHeightMatch ? parseFloat(widthHeightMatch[1]) : undefined;
  const height = widthHeightMatch ? parseFloat(widthHeightMatch[2]) : undefined;

  let serviceId = "srv-dtf-tshirt";
  const lower = text.toLowerCase();

  if (lower.includes("banner") || lower.includes("outdoor")) {
    serviceId = lower.includes("rollup") || lower.includes("stand") ? "srv-rollup-banner" : "srv-flex-banner";
  } else if (lower.includes("card") || lower.includes("business")) {
    serviceId = "srv-business-cards";
  } else if (lower.includes("mug") || lower.includes("cup")) {
    serviceId = "srv-custom-mug";
  } else if (lower.includes("frame") || lower.includes("picture") || lower.includes("canvas")) {
    serviceId = "srv-photo-frame";
  } else if (lower.includes("shirt") || lower.includes("polo") || lower.includes("tshirt")) {
    serviceId = lower.includes("polo") ? "srv-embroidery-polo" : "srv-dtf-tshirt";
  }

  if (qty && qty > 0) {
    return {
      isComplete: true,
      serviceId,
      quantity: qty,
      width,
      height,
      sizeArea: "A4",
      item: "Custom Print Order",
    };
  }

  return {
    isComplete: false,
    serviceId,
    nextQuestion: "How many pieces or units would you like to print, and what size?",
  };
}
