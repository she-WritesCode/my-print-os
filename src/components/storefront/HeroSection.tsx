"use client";

import React from "react";
import { HeroChatInput } from "./HeroChatInput";

interface HeroSectionProps {
  onOpenChat: (serviceId?: string, initialPrompt?: string) => void;
}

export function HeroSection({ onOpenChat }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Soft Background Ambient Peach Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[#FFDFB9]/30 dark:bg-[#A4193D]/10 blur-[100px]" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Warm Hub Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#EADDCF] dark:border-[#331D25] bg-[#F4EDE4] dark:bg-[#1C1116] px-4 py-1.5 text-xs text-[#6E5F64] dark:text-[#A8949A] mb-6 shadow-xs">
          <span className="h-2 w-2 rounded-full bg-[#A4193D] animate-pulse" />
          <span className="font-semibold text-[#181113] dark:text-[#FBF6F0]">Shomolu Print Hub, Lagos</span>
          <span className="text-[#EADDCF] dark:text-[#331D25]">•</span>
          <span className="text-[#A4193D] dark:text-[#FFDFB9] font-medium">Talk to us like a human</span>
        </div>

        {/* Punchy, Friendly Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#181113] dark:text-[#FBF6F0] leading-[1.08]">
          Tell us what you want to print. <br className="hidden sm:inline" />
          <span className="text-[#A4193D]">We'll tell you what it costs.</span>
        </h1>

        {/* Conversational Subtitle */}
        <p className="mt-5 max-w-xl mx-auto text-base sm:text-lg text-[#6E5F64] dark:text-[#A8949A] leading-relaxed font-normal">
          Chat in plain words — no confusing print terminology. Get exact upfront pricing, 
          see the <span className="text-[#A4193D] dark:text-[#FFDFB9] font-semibold">70% deposit to buy materials</span>, 
          and track production straight to delivery.
        </p>

        {/* 💬 The Elevated Hero Chat Box */}
        <HeroChatInput onOpenChat={onOpenChat} />

        {/* Straightforward Guarantees */}
        <div className="mt-12 pt-8 border-t border-[#EADDCF] dark:border-[#2E1C23] flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs text-[#6E5F64] dark:text-[#A8949A]">
          <div className="flex items-center gap-2">
            <span className="text-[#A4193D] dark:text-[#FFDFB9] font-bold">70% deposit</span>
            <span>buys materials immediately</span>
          </div>
          <div className="hidden sm:block text-[#EADDCF] dark:text-[#331D25]">•</div>
          <div className="flex items-center gap-2">
            <span className="text-[#181113] dark:text-[#FBF6F0] font-bold">24–48 hours</span>
            <span>delivery in Lagos & nationwide</span>
          </div>
          <div className="hidden sm:block text-[#EADDCF] dark:text-[#331D25]">•</div>
          <div className="flex items-center gap-2">
            <span className="text-[#A4193D] dark:text-[#FFDFB9] font-bold">Free sample proof</span>
            <span>before we print</span>
          </div>
        </div>
      </div>
    </section>
  );
}
