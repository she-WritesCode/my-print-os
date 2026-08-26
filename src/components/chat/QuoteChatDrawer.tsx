"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  quoteSummary?: {
    item: string;
    quantity: number;
    size: string;
    totalPrice: number;
    depositRequired: number;
    balanceDue: number;
    orderNumber: string;
  };
}

export function QuoteChatDrawer({
  isOpen,
  onClose,
  prefillServiceId,
  initialPrompt,
}: QuoteChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (initialPrompt) {
        const userMsg: ChatMessage = {
          id: `user-init-${Date.now()}`,
          role: "user",
          content: initialPrompt,
          timestamp: new Date().toISOString(),
        };

        setMessages([userMsg]);
        setIsTyping(true);

        const replyTimer = setTimeout(() => {
          setIsTyping(false);
          const qtyMatch = initialPrompt.match(/\d+/);
          const qty = qtyMatch ? parseInt(qtyMatch[0], 10) : 50;
          const unitRate = qty >= 100 ? 3800 : qty >= 20 ? 4500 : 5000;
          const total = qty * unitRate;
          const deposit = Math.round(total * 0.7);
          const balance = total - deposit;
          const orderNum = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

          const matchedService = PRINT_SERVICES.find((s) => s.id === prefillServiceId);
          const itemName = matchedService ? matchedService.name : "Custom Print Order";

          const quoteMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `Got it! I've calculated your exact price for **${qty} units**. Production begins immediately once your 70% material deposit is confirmed.`,
            timestamp: new Date().toISOString(),
            quoteSummary: {
              item: itemName,
              quantity: qty,
              size: "Standard Full Color / Front Print",
              totalPrice: total,
              depositRequired: deposit,
              balanceDue: balance,
              orderNumber: orderNum,
            },
          };

          setMessages((prev) => [...prev, quoteMsg]);
        }, 800);

        return () => clearTimeout(replyTimer);
      }

      const matchedService = PRINT_SERVICES.find((s) => s.id === prefillServiceId);

      if (matchedService) {
        setMessages([
          {
            id: "welcome-1",
            role: "assistant",
            content: `Hi there! 👋 Let's get your **${matchedService.name}** calculated in seconds.\n\nTell me: **how many units do you need**, and what dimensions or layout?`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages([
          {
            id: "welcome-default",
            role: "assistant",
            content: `Welcome to PrintOS! 🖨️✨ I can calculate instant, mathematically guaranteed print quotes.\n\nTell me what you'd like to print (e.g. *"50 black cotton t-shirts for Friday"* or *"10x4ft outdoor banner"*). No print jargon needed!`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, prefillServiceId, initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const qtyMatch = messageContent.match(/\d+/);
      const qty = qtyMatch ? parseInt(qtyMatch[0], 10) : 50;
      const unitRate = qty >= 100 ? 3800 : qty >= 20 ? 4500 : 5000;
      const total = qty * unitRate;
      const deposit = Math.round(total * 0.7);
      const balance = total - deposit;
      const orderNum = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const quoteMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `Here is your price breakdown for **${qty} units**!`,
        timestamp: new Date().toISOString(),
        quoteSummary: {
          item: prefillServiceId ? PRINT_SERVICES.find((s) => s.id === prefillServiceId)?.name || "Custom Print Order" : "Full-Color Custom T-Shirts",
          quantity: qty,
          size: "Front Print / Full Color",
          totalPrice: total,
          depositRequired: deposit,
          balanceDue: balance,
          orderNumber: orderNum,
        },
      };

      setMessages((prev) => [...prev, quoteMsg]);
    }, 800);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex flex-col p-0 gap-0 sm:max-w-lg bg-[#FAF7F2] dark:bg-[#120A0D] border-l border-[#EADDCF] dark:border-[#2E1C23]">
        {/* Solid Opaque SheetHeader */}
        <SheetHeader className="p-4 sm:p-5 border-b border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116]">
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A4193D] font-mono font-black text-xs text-[#FFDFB9]">
              OS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base font-bold text-[#181113] dark:text-[#FBF6F0]">PrintOS AI Quoting</SheetTitle>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <SheetDescription className="text-xs text-[#6E5F64] dark:text-[#A8949A]">
                Shomolu Floor Live • Plain-Language Quoter
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F2] dark:bg-[#120A0D]">
          {messages.map((msg) => {
            const isUser = msg.role === "user";

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
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-[#A4193D] text-white font-medium rounded-tr-none shadow-xs"
                      : "bg-white dark:bg-[#1C1116] text-[#181113] dark:text-[#FBF6F0] border border-[#EADDCF] dark:border-[#2E1C23] rounded-tl-none shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Interactive In-Chat Quote using shadcn Card & Badge */}
                  {msg.quoteSummary && (
                    <Card className="mt-4 border-[#EADDCF] dark:border-[#331D25] bg-[#FAF7F2] dark:bg-[#160D11] shadow-xs">
                      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between border-b border-[#EADDCF] dark:border-[#2E1C23] space-y-0">
                        <span className="text-xs font-mono font-bold text-[#A4193D] dark:text-[#FFDFB9]">
                          {msg.quoteSummary.orderNumber}
                        </span>
                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Calculated Price
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

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#6E5F64] dark:text-[#A8949A] bg-white dark:bg-[#1C1116] border border-[#EADDCF] dark:border-[#2E1C23] rounded-xl px-3 py-2 w-fit animate-pulse shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#A4193D] animate-spin" />
              <span>Calculating price based on current Shomolu supply rates...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="border-t border-[#EADDCF] dark:border-[#2E1C23] bg-[#F4EDE4] dark:bg-[#160D11] px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          <span className="text-[#6E5F64] dark:text-[#A8949A] text-[11px] shrink-0 font-medium">Quick prompts:</span>
          {["50 pcs, Front Print", "100 pcs, Front & Back", "10x4 ft Outdoor Banner", "100 Business Cards"].map((pill) => (
            <Button
              key={pill}
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage(pill)}
              className="h-7 text-xs rounded-full bg-white dark:bg-[#1C1116] border-[#EADDCF] dark:border-[#2E1C23] text-[#181113] dark:text-[#FBF6F0] hover:border-[#A4193D] hover:text-[#A4193D] shrink-0 cursor-pointer"
            >
              {pill}
            </Button>
          ))}
        </div>

        {/* Solid Opaque Input Bar */}
        <div className="border-t border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116] p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 50 black shirts, front print for Friday..."
              className="flex-1 bg-[#FAF7F2] dark:bg-[#120A0D] border-[#EADDCF] dark:border-[#2E1C23] text-[#181113] dark:text-[#FBF6F0]"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className="h-10 w-10 shrink-0 bg-[#A4193D] hover:bg-[#881230] text-white cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
