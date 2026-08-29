"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Brain,
  ChevronDown,
  ChevronUp,
  Square,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { PRINT_SERVICES } from "@/lib/services";
import { cn } from "@/lib/utils";

interface QuoteChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  prefillServiceId?: string | null;
  initialPrompt?: string | null;
}

interface QuoteSummary {
  item: string;
  quantity: number;
  size: string;
  totalPrice: number;
  depositRequired: number;
  balanceDue: number;
  orderNumber: string;
  serviceId?: string;
}

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  quoteSummary?: QuoteSummary | null;
}

const SESSION_THREAD_KEY = "printos_chat_active_thread";

/**
 * Animated Typing indicator with contextual Nigerian workshop status
 */
function TypingDots({ label = "Consulting workshop pricing rules..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-2 px-3 bg-white dark:bg-[#1C1116] border border-[#EADDCF] dark:border-[#2E1C23] rounded-2xl w-fit shadow-xs animate-in fade-in duration-200">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-[#A4193D] rounded-full animate-bounce" />
        <span className="w-1.5 h-1.5 bg-[#A4193D] rounded-full animate-bounce [animation-delay:0.15s]" />
        <span className="w-1.5 h-1.5 bg-[#A4193D] rounded-full animate-bounce [animation-delay:0.3s]" />
      </div>
      <span className="text-[11px] font-medium text-[#6E5F64] dark:text-[#A8949A] animate-pulse">
        {label}
      </span>
    </div>
  );
}

/**
 * Fixes LLM compressed single-line tables (e.g. `||---|---||` -> `|\n|`)
 * and ensures standard GFM table format with valid header cells and clean linebreaks.
 */
function formatMarkdownForRendering(text: string): string {
  if (!text) return "";

  let formatted = text;

  // 1. Convert empty table headers like `| | |` or `|   |   |` to `| Detail | Info |` so remark-gfm parses them
  formatted = formatted.replace(
    /\|[\s\t]*\|[\s\t]*\|\n\|[-:\s|]+\|/g,
    "| Detail | Info |\n|---|---|"
  );
  formatted = formatted.replace(
    /\|[\s\t]*\|[\s\t]*\|[\s\t]*\|\n\|[-:\s|]+\|/g,
    "| Item | Detail | Info |\n|---|---|---|"
  );

  // 2. Convert glued table cells/rows like `||---|---||` into `|\n|---|---|\n|`
  formatted = formatted.replace(/\|\|\s*\|/g, "|\n|");
  formatted = formatted.replace(/\|\|/g, "|\n|");

  // 3. Ensure table headers and separators are properly separated with newlines
  formatted = formatted.replace(/(\|[-:\s]+\|)\s*\|/g, "$1\n|");

  // 4. Ensure table starts on its own line after headings
  formatted = formatted.replace(/(#{1,6}[^\n]+)\n(\|)/g, "$1\n\n$2");

  return formatted;
}

/**
 * Extracts DeepSeek chain-of-thought `<think>` tags and cleans response text
 */
function parseReasoning(rawText: string) {
  if (!rawText) return { thinking: "", finalResponse: "" };

  const thinkRegex = /<(?:think|thought)>([\s\S]*?)(?:<\/(?:think|thought)>|$)/i;
  const match = rawText.match(thinkRegex);

  let thinking = "";
  let finalResponse = rawText;

  if (match) {
    thinking = (match[1] || "").trim();
    finalResponse = rawText.replace(/<(?:think|thought)>[\s\S]*?(?:<\/(?:think|thought)>|$)/gi, "").trim();
  }

  return {
    thinking,
    finalResponse: formatMarkdownForRendering(finalResponse),
  };
}

/**
 * Collapsible accordion for transparent AI diagnostic & pricing reasoning
 */
function AIReasoningAccordion({
  thinking,
  isStreaming = false,
}: {
  thinking: string;
  isStreaming?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isExpanded = isOpen || isStreaming;

  if (!thinking) return null;

  return (
    <div className="mb-3 rounded-xl border border-[#EADDCF] dark:border-[#331D25] bg-[#FAF7F2]/80 dark:bg-[#160D11]/80 overflow-hidden text-xs transition-all">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-3 py-2 flex items-center justify-between gap-2 text-left hover:bg-[#FFDFB9]/20 transition-colors text-[#6E5F64] dark:text-[#A8949A] cursor-pointer"
      >
        <div className="flex items-center gap-2 font-medium text-[11px]">
          <Brain className={cn("h-3.5 w-3.5 text-[#A4193D] dark:text-[#FFDFB9]", isStreaming && "animate-pulse")} />
          <span>{isStreaming ? "Diagnostic reasoning in progress..." : "View diagnostic thought process"}</span>
        </div>
        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {isExpanded && (
        <div className="px-3 pb-2.5 pt-1 text-[11px] font-mono leading-relaxed text-[#5A4B50] dark:text-[#C5B3B8] border-t border-[#EADDCF]/60 dark:border-[#2E1C23]/60 bg-white/40 dark:bg-black/20 whitespace-pre-wrap">
          {thinking}
        </div>
      )}
    </div>
  );
}

/**
 * Extracts Quote Details from response text when finalized
 */
function extractQuoteSummary(text: string): QuoteSummary | null {
  if (!text) return null;

  const totalMatch = text.match(/(?:total|customer will pay|total price)[:\s*]+(?:₦|NGN)?\s*([\d,]+)/i);
  const depositMatch = text.match(/(?:70% deposit|deposit required|deposit)[:\s*]+(?:₦|NGN)?\s*([\d,]+)/i);
  const balanceMatch = text.match(/(?:balance on delivery|balance due|balance)[:\s*]+(?:₦|NGN)?\s*([\d,]+)/i);

  if (!totalMatch || !depositMatch) return null;

  const parsedTotal = parseInt(totalMatch[1].replace(/,/g, ""), 10);
  const parsedDeposit = parseInt(depositMatch[1].replace(/,/g, ""), 10);
  const parsedBalance = balanceMatch
    ? parseInt(balanceMatch[1].replace(/,/g, ""), 10)
    : parsedTotal - parsedDeposit;

  const itemTitleMatch = text.match(/\*\*(?:📸|👕|🖨️|🏷️|☕|📦)?\s*([^*]+(?:Frame|Banner|Shirt|Polo|Card|Mug|Canvas|Print)[^*]*)\*\*/i);
  const matchedItem = itemTitleMatch ? itemTitleMatch[1].trim() : "Custom Print Order";

  const sizeMatch = text.match(/(\d+\s*(?:×|x)\s*\d+["']?(?:\s*(?:inch|inches|ft|feet|cm))?)/i);
  const specSummary = sizeMatch ? `${sizeMatch[1]} Production Spec` : "Workshop Standard Production";

  const textQtyMatch = text.match(/(?:for|quote for|calculating for)\s+(\d+)\s*(?:pcs|pieces|units|shirts|frames|mugs|banners|cards)?/i);
  const quantity = textQtyMatch ? parseInt(textQtyMatch[1], 10) : 1;

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `ORD-${new Date().getFullYear()}-${randomSuffix}`;

  return {
    item: matchedItem,
    quantity,
    size: specSummary,
    totalPrice: parsedTotal,
    depositRequired: parsedDeposit,
    balanceDue: parsedBalance,
    orderNumber,
  };
}

const DEFAULT_PANEL_WIDTH = 480;
const MIN_PANEL_WIDTH = 360;

export function QuoteChatDrawer({
  isOpen,
  onClose,
  prefillServiceId,
  initialPrompt,
}: QuoteChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    let saved = sessionStorage.getItem(SESSION_THREAD_KEY);
    if (!saved) {
      saved = `thread-${Date.now()}`;
      sessionStorage.setItem(SESSION_THREAD_KEY, saved);
    }
    return saved;
  });
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT_PANEL_WIDTH;
    const saved = localStorage.getItem("printos_chat_panel_width");
    const parsed = saved ? parseInt(saved, 10) : DEFAULT_PANEL_WIDTH;
    return isNaN(parsed) ? DEFAULT_PANEL_WIDTH : Math.max(MIN_PANEL_WIDTH, Math.min(parsed, 1100));
  });
  const [isResizing, setIsResizing] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages or streaming chunks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleResetWidth = useCallback(() => {
    setPanelWidth(DEFAULT_PANEL_WIDTH);
    localStorage.setItem("printos_chat_panel_width", String(DEFAULT_PANEL_WIDTH));
  }, []);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = panelWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const maxWidth = Math.min(window.innerWidth * 0.85, 1100);
      const nextWidth = Math.max(MIN_PANEL_WIDTH, Math.min(startWidth + deltaX, maxWidth));
      setPanelWidth(nextWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setPanelWidth((curr) => {
        localStorage.setItem("printos_chat_panel_width", String(curr));
        return curr;
      });
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [panelWidth]);

  const handleResetChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const newThreadId = `thread-${Date.now()}`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_THREAD_KEY, newThreadId);
    }
    setConversationId(newThreadId);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `Welcome to PrintOS! 🖨️✨ Tell me what you'd like to produce (e.g. *"I want to frame a picture"*, *"50 cotton shirts"*, or *"outdoor flex banner"*).`,
        timestamp: new Date().toISOString(),
      },
    ]);
    setIsStreaming(false);
  }, []);

  const handleStopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  const handleSendMessage = useCallback(async (textToSend?: string, overrideThreadId?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isStreaming) return;

    const threadId = overrideThreadId || conversationId || `thread-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/chat/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          threadId,
          conversationId: threadId,
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          prefillServiceId,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server returned error status ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: accumulatedText,
                  isStreaming: true,
                }
              : msg
          )
        );
      }

      // Stream complete: parse quote summary and finalize message
      const quoteSummary = extractQuoteSummary(accumulatedText);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: accumulatedText,
                isStreaming: false,
                quoteSummary,
              }
            : msg
        )
      );
      setIsStreaming(false);
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === "AbortError" || err.message.includes("abort"))) {
        setIsStreaming(false);
        return;
      }
      console.warn("⚠️ Handled turn error:", err);
      setIsStreaming(false);

      const userFriendlyError =
        "⚠️ **Workshop Connection Delay**\n\nI couldn't complete that calculation right away due to a momentary network delay with our workshop servers.\n\nPlease click **Send** to try again, or chat directly with our team on WhatsApp at **+234 802 000 0000**.";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: msg.content ? `${msg.content}\n\n${userFriendlyError}` : userFriendlyError,
                isStreaming: false,
              }
            : msg
        )
      );
    }
  }, [input, isStreaming, conversationId, messages, prefillServiceId]);

  // Initialize or resume persistent session when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    const threadToUse = conversationId || (typeof window !== "undefined" ? sessionStorage.getItem(SESSION_THREAD_KEY) : null) || `thread-${Date.now()}`;

    const initChat = async () => {
      // 1. If an initial prompt was provided (e.g. from Hero), send it directly
      if (initialPrompt) {
        handleSendMessage(initialPrompt, threadToUse);
        return;
      }

      // 2. Try to restore previous conversation from this session
      try {
        const res = await fetch(`/api/chat/turn?threadId=${threadToUse}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(
              data.messages.map((m: { id: string; role: "assistant" | "user"; content: string; timestamp?: string }) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: m.timestamp || new Date().toISOString(),
                quoteSummary: extractQuoteSummary(m.content),
              }))
            );
            return;
          }
        }
      } catch {
        // Fallback to welcome message
      }

      // 3. Render welcome message
      const matchedService = PRINT_SERVICES.find((s) => s.id === prefillServiceId);
      if (matchedService) {
        setMessages([
          {
            id: "welcome-1",
            role: "assistant",
            content: `Hi there! 👋 Let's get your **${matchedService.name}** calculated in seconds.\n\nTell me: **how many units or pieces do you need**, and what dimensions or design style?`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages([
          {
            id: "welcome-default",
            role: "assistant",
            content: `Welcome to PrintOS! 🖨️✨ I can calculate instant, mathematically guaranteed print quotes.\n\nTell me what you'd like to produce (e.g. *"I want to frame a family portrait"*, *"50 black cotton t-shirts for an event"*, or *"10x4ft outdoor flex banner"*). No print jargon needed!`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    initChat();
  }, [isOpen, prefillServiceId, initialPrompt, handleSendMessage, conversationId]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        style={{ width: `${panelWidth}px`, maxWidth: "100vw" }}
        className={cn(
          "flex flex-col p-0 gap-0 w-full sm:max-w-none bg-[#FAF7F2] dark:bg-[#120A0D] border-l border-[#EADDCF] dark:border-[#2E1C23] shadow-2xl relative",
          isResizing && "select-none transition-none"
        )}
      >
        {/* Desktop Drag-to-Resize Handle on Left Border */}
        <div
          onMouseDown={startResizing}
          onDoubleClick={handleResetWidth}
          title="Drag to resize width, double-click to reset (480px)"
          className={cn(
            "hidden sm:flex absolute top-0 bottom-0 -left-1.5 w-3 cursor-col-resize z-30 group items-center justify-center hover:bg-[#A4193D]/10 transition-colors",
            isResizing && "bg-[#A4193D]/20"
          )}
        >
          <div
            className={cn(
              "w-[2px] h-12 rounded-full bg-[#EADDCF] dark:bg-[#331D25] group-hover:bg-[#A4193D] group-hover:w-[3px] transition-all",
              isResizing && "bg-[#A4193D] w-[3px] h-20"
            )}
          />
        </div>
        {/* Solid Opaque Header */}
        <SheetHeader className="p-4 sm:p-5 border-b border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116]">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A4193D] font-mono font-black text-xs text-[#FFDFB9] shadow-xs">
                OS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base font-bold text-[#181113] dark:text-[#FBF6F0]">
                    PrintOS Operations AI
                  </SheetTitle>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <SheetDescription className="text-xs text-[#6E5F64] dark:text-[#A8949A]">
                  DeepSeek • Shomolu Workshop Quoting Engine
                </SheetDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetChat}
              title="Start a new conversation"
              className="text-xs text-[#6E5F64] dark:text-[#A8949A] hover:text-[#A4193D] cursor-pointer flex items-center gap-1 h-8 px-2 rounded-lg"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          </div>
        </SheetHeader>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F2] dark:bg-[#120A0D]">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const { thinking, finalResponse } = isUser
              ? { thinking: "", finalResponse: msg.content }
              : parseReasoning(msg.content);

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#A4193D] text-[#FFDFB9] font-bold text-xs mt-1 shadow-xs">
                    OS
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-[#A4193D] text-white font-medium rounded-tr-none shadow-xs"
                      : "bg-white dark:bg-[#1C1116] text-[#181113] dark:text-[#FBF6F0] border border-[#EADDCF] dark:border-[#2E1C23] rounded-tl-none shadow-xs"
                  }`}
                >
                  {/* Collapsible Reasoning Accordion */}
                  {!isUser && thinking && (
                    <AIReasoningAccordion
                      thinking={thinking}
                      isStreaming={msg.isStreaming && !finalResponse}
                    />
                  )}

                  {/* Rich Markdown Formatter with Table Support */}
                  <div className="prose prose-stone dark:prose-invert max-w-none text-sm leading-relaxed wrap-break-word">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        strong: ({ children }) => (
                          <strong
                            className={
                              isUser
                                ? "font-bold text-white"
                                : "font-bold text-[#A4193D] dark:text-[#FFDFB9]"
                            }
                          >
                            {children}
                          </strong>
                        ),
                        table: ({ children }) => (
                          <div className="my-3 overflow-x-auto rounded-xl border border-[#EADDCF] dark:border-[#331D25] shadow-xs">
                            <table className="w-full text-xs text-left border-collapse">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-[#F4EDE4] dark:bg-[#23141B] text-[#181113] dark:text-[#FBF6F0] font-bold border-b border-[#EADDCF] dark:border-[#331D25]">
                            {children}
                          </thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody className="divide-y divide-[#EADDCF]/60 dark:divide-[#2E1C23]/60 bg-white/60 dark:bg-[#1C1116]/60">
                            {children}
                          </tbody>
                        ),
                        tr: ({ children }) => (
                          <tr className="hover:bg-[#FFDFB9]/20 transition-colors">{children}</tr>
                        ),
                        th: ({ children }) => (
                          <th className="px-3 py-2 text-xs font-semibold text-[#5C0B20] dark:text-[#FFDFB9] border-r border-[#EADDCF]/40 dark:border-[#331D25]/40 last:border-r-0">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-3 py-2 text-xs text-[#181113] dark:text-[#FBF6F0] border-r border-[#EADDCF]/40 dark:border-[#331D25]/40 last:border-r-0">
                            {children}
                          </td>
                        ),
                        ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="leading-snug">{children}</li>,
                        h1: ({ children }) => <h1 className="text-base font-bold my-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm font-bold my-1.5">{children}</h2>,
                        h3: ({ children }) => (
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A4193D] dark:text-[#FFDFB9] my-1">
                            {children}
                          </h3>
                        ),
                        hr: () => <hr className="my-2.5 border-[#EADDCF] dark:border-[#2E1C23]" />,
                        code: ({ children }) => (
                          <code className="rounded bg-black/5 dark:bg-white/10 px-1 py-0.5 font-mono text-xs">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {finalResponse || (msg.isStreaming && !thinking ? "..." : "")}
                    </ReactMarkdown>
                  </div>

                  {/* Interactive Verified In-Chat Quote Card */}
                  {msg.quoteSummary && (
                    <Card className="mt-4 border-[#EADDCF] dark:border-[#331D25] bg-[#FAF7F2] dark:bg-[#160D11] shadow-xs animate-in zoom-in-95 duration-200">
                      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between border-b border-[#EADDCF] dark:border-[#2E1C23] space-y-0">
                        <span className="text-xs font-mono font-bold text-[#A4193D] dark:text-[#FFDFB9]">
                          {msg.quoteSummary.orderNumber}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Verified Calculation
                        </Badge>
                      </CardHeader>

                      <CardContent className="p-3 space-y-3">
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#6E5F64] dark:text-[#A8949A]">Job:</span>
                            <span className="font-semibold text-[#181113] dark:text-white">
                              {msg.quoteSummary.quantity}x {msg.quoteSummary.item}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6E5F64] dark:text-[#A8949A]">Specs:</span>
                            <span className="font-medium">{msg.quoteSummary.size}</span>
                          </div>
                          <Separator className="bg-[#EADDCF] dark:bg-[#2E1C23]" />
                          <div className="flex justify-between font-bold pt-0.5">
                            <span>Customer will pay:</span>
                            <span className="font-mono text-[#A4193D] dark:text-[#FFDFB9] text-sm">
                              ₦{msg.quoteSummary.totalPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* 70% Deposit & 30% Balance Breakdown */}
                        <div className="rounded-lg bg-[#FFDFB9]/40 dark:bg-[#2E151E] border border-[#EADDCF] dark:border-[#A4193D]/30 p-2.5 text-xs space-y-1">
                          <div className="flex justify-between text-[#5C0B20] dark:text-[#FFDFB9] font-bold">
                            <span>Deposit required (70%):</span>
                            <span>₦{msg.quoteSummary.depositRequired.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[#6E5F64] dark:text-[#A8949A] text-[11px]">
                            <span>Balance on delivery (30%):</span>
                            <span>₦{msg.quoteSummary.balanceDue.toLocaleString()}</span>
                          </div>
                        </div>

                        <a
                          href={`https://wa.me/?text=Hi%2C%20I%20got%20a%20quote%20on%20PrintOS%20for%20${msg.quoteSummary.quantity}%20${encodeURIComponent(msg.quoteSummary.item)}%20(Ref%3A%20${msg.quoteSummary.orderNumber})%20Total%3A%20₦${msg.quoteSummary.totalPrice.toLocaleString()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({ variant: "default" }),
                            "w-full font-bold text-xs bg-[#A4193D] hover:bg-[#881230] text-white shadow-xs cursor-pointer"
                          )}
                        >
                          <span>Lock in Quote & Attach Artwork</span>
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </a>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            );
          })}

          {isStreaming && (
            <TypingDots label="Consulting workshop pricing rules..." />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="border-t border-[#EADDCF] dark:border-[#2E1C23] bg-[#F4EDE4] dark:bg-[#160D11] px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          <span className="text-[#6E5F64] dark:text-[#A8949A] text-[11px] shrink-0 font-medium">Quick prompts:</span>
          {[
            "16x20 inch Wooden Frame",
            "50 cotton shirts, 1-color logo",
            "10x4 ft Outdoor Banner",
            "100 Business Cards",
          ].map((pill) => (
            <Button
              key={pill}
              variant="outline"
              size="sm"
              disabled={isStreaming}
              onClick={() => handleSendMessage(pill)}
              className="h-7 text-xs rounded-full bg-white dark:bg-[#1C1116] border-[#EADDCF] dark:border-[#2E1C23] text-[#181113] dark:text-[#FBF6F0] hover:border-[#A4193D] hover:text-[#A4193D] shrink-0 cursor-pointer disabled:opacity-50"
            >
              {pill}
            </Button>
          ))}
        </div>

        {/* Auto-expanding Multiline Input Bar */}
        <div className="border-t border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116] p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder="Type your message or ask for advice... (Shift+Enter for newline)"
                className="w-full resize-none rounded-xl border border-[#EADDCF] dark:border-[#2E1C23] bg-[#FAF7F2] dark:bg-[#120A0D] px-3.5 py-2.5 text-sm text-[#181113] dark:text-[#FBF6F0] placeholder-[#A8949A] dark:placeholder-[#6E5F64] focus:border-[#A4193D] focus:outline-none scrollbar-none leading-relaxed font-medium"
              />
            </div>

            {isStreaming ? (
              <Button
                type="button"
                size="icon"
                onClick={handleStopStream}
                className="h-10 w-10 shrink-0 bg-[#6E5F64] hover:bg-[#5A4B50] text-white cursor-pointer rounded-xl"
                title="Stop generation"
              >
                <Square className="h-4 w-4 fill-white" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim()}
                className="h-10 w-10 shrink-0 bg-[#A4193D] hover:bg-[#881230] text-white cursor-pointer rounded-xl shadow-xs disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
