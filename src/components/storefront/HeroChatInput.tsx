"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Paperclip, Shirt, Flag, Image as ImageIcon, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroChatInputProps {
  onOpenChat: (serviceId?: string, initialPrompt?: string) => void;
}

export function HeroChatInput({ onOpenChat }: HeroChatInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onOpenChat(undefined, prompt.trim());
  };

  const handleQuickPrompt = (text: string, serviceId?: string) => {
    onOpenChat(serviceId, text);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 sm:mt-10">
      {/* The Elevated Prompt Box - Adaptive Light & Dark */}
      <div className="relative rounded-3xl border border-[#EADDCF] dark:border-[#331D25] bg-white dark:bg-[#1C1116] p-3 sm:p-4 shadow-xl dark:shadow-2xl transition-all focus-within:border-[#A4193D] focus-within:ring-2 focus-within:ring-[#A4193D]/20">
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Main Input Textarea */}
          <div className="relative flex items-start">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={2}
              placeholder="Ask anything or describe what you want to print... (e.g. 50 black round-neck shirts with front print for Friday in Ikeja)"
              className="w-full resize-none bg-transparent px-2 py-1 text-sm sm:text-base text-[#181113] dark:text-[#FBF6F0] placeholder-[#A8949A] dark:placeholder-[#6E5F64] focus:outline-none scrollbar-none leading-relaxed font-medium"
            />
          </div>

          {/* Bottom Toolbar: Attachments & Submit Button */}
          <div className="mt-3 flex items-center justify-between border-t border-[#F4EDE4] dark:border-[#2E1C23] pt-3">
            {/* Left Tools / Attachments */}
            <div className="flex items-center gap-1.5 text-[#6E5F64] dark:text-[#A8949A] text-xs">
              <button
                type="button"
                onClick={() => onOpenChat(undefined, "I want to upload my design artwork for an instant quote")}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-[#F4EDE4] dark:hover:bg-[#2E1C23] hover:text-[#A4193D] dark:hover:text-[#FFDFB9] transition-colors cursor-pointer"
                title="Attach Artwork File"
              >
                <Paperclip className="h-4 w-4 text-[#A4193D]" />
                <span className="hidden sm:inline text-xs font-medium">Attach Artwork</span>
              </button>
            </div>

            {/* Right Submit Button */}
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={!prompt.trim()}
                className="rounded-full bg-[#A4193D] hover:bg-[#881230] disabled:opacity-40 text-white font-bold text-xs px-5 py-2.5 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 fill-[#FFDFB9] text-[#FFDFB9]" />
                <span>Get Instant Quote</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Quick Suggestion Pills Below the Box */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-[#6E5F64] dark:text-[#A8949A] text-[11px] font-mono mr-1">Try asking:</span>

        <button
          onClick={() => handleQuickPrompt("50 custom black cotton t-shirts with front print for Friday", "srv-custom-tshirt")}
          className="flex items-center gap-1.5 rounded-full border border-[#EADDCF] dark:border-[#331D25] bg-[#F4EDE4] dark:bg-[#24151B] px-3 py-1 text-[#181113] dark:text-[#FBF6F0] hover:border-[#A4193D] hover:bg-[#FFDFB9]/30 transition-all cursor-pointer"
        >
          <Shirt className="h-3 w-3 text-[#A4193D]" />
          <span>50 Custom T-Shirts</span>
        </button>

        <button
          onClick={() => handleQuickPrompt("10x4ft outdoor event banner with eyelets for church program", "srv-flex-banner")}
          className="flex items-center gap-1.5 rounded-full border border-[#EADDCF] dark:border-[#331D25] bg-[#F4EDE4] dark:bg-[#24151B] px-3 py-1 text-[#181113] dark:text-[#FBF6F0] hover:border-[#A4193D] hover:bg-[#FFDFB9]/30 transition-all cursor-pointer"
        >
          <Flag className="h-3 w-3 text-[#A4193D]" />
          <span>10x4ft Outdoor Banner</span>
        </button>

        <button
          onClick={() => handleQuickPrompt("2 retractable standup banners for business conference", "srv-rollup-banner")}
          className="flex items-center gap-1.5 rounded-full border border-[#EADDCF] dark:border-[#331D25] bg-[#F4EDE4] dark:bg-[#24151B] px-3 py-1 text-[#181113] dark:text-[#FBF6F0] hover:border-[#A4193D] hover:bg-[#FFDFB9]/30 transition-all cursor-pointer"
        >
          <ImageIcon className="h-3 w-3 text-[#A4193D]" />
          <span>2 Standup Banners</span>
        </button>

        <button
          onClick={() => handleQuickPrompt("200 premium matte velvet business cards for executive team", "srv-business-cards")}
          className="flex items-center gap-1.5 rounded-full border border-[#EADDCF] dark:border-[#331D25] bg-[#F4EDE4] dark:bg-[#24151B] px-3 py-1 text-[#181113] dark:text-[#FBF6F0] hover:border-[#A4193D] hover:bg-[#FFDFB9]/30 transition-all cursor-pointer"
        >
          <CreditCard className="h-3 w-3 text-[#A4193D]" />
          <span>200 Business Cards</span>
        </button>
      </div>
    </div>
  );
}
