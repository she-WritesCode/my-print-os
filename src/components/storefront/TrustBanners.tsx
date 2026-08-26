"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrustBannersProps {
  onOpenChat: () => void;
}

export function TrustBanners({ onOpenChat }: TrustBannersProps) {
  return (
    <section id="manifesto" className="py-14 md:py-20 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Crimson Card with Warm Peach Cream Accents */}
        <div className="rounded-3xl bg-[#A4193D] p-8 sm:p-12 md:p-16 text-white shadow-xl">
          <div className="max-w-3xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FFDFB9] block mb-4">
              How We Do Business
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.08] text-white">
              70% deposit buys your materials right away. No stories.
            </h2>

            <p className="mt-6 text-base sm:text-lg font-medium text-[#FFDFB9] leading-relaxed">
              In this market, paper, ink, and cotton prices move quickly. 
              The moment you pay your 70% deposit, we purchase and lock down your materials from the market immediately so your price never increases mid-production. 
              You only settle the remaining <strong>30% balance</strong> when your job is finished and ready for pickup.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                onClick={onOpenChat}
                className="rounded-full bg-[#FFDFB9] hover:bg-[#FFEBD3] text-[#5C0B20] font-extrabold text-xs px-7 py-5 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Sparkles className="mr-2 h-4 w-4 fill-[#A4193D] text-[#A4193D]" />
                Try a 15-Second Quote
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-mono font-bold text-[#FFDFB9]">
                ⚡ Direct from our Shomolu workshop
              </span>
            </div>

            {/* 3 Simple Guarantees */}
            <div className="mt-10 pt-8 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">
              <div>
                <span className="font-extrabold text-sm block text-[#FFDFB9]">1. No Hidden Extra Costs</span>
                <span className="text-xs text-white/80 mt-1 block">What we calculate is what you pay. No sudden surprises.</span>
              </div>
              <div>
                <span className="font-extrabold text-sm block text-[#FFDFB9]">2. Digital Sample Proof</span>
                <span className="text-xs text-white/80 mt-1 block">We confirm your design layout before ink hits paper.</span>
              </div>
              <div>
                <span className="font-extrabold text-sm block text-[#FFDFB9]">3. 24–48h Delivery</span>
                <span className="text-xs text-white/80 mt-1 block">Express dispatch straight to your Lagos doorstep or park.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
