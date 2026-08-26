"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Send } from "lucide-react";
import { PrintService } from "@/lib/services";

interface ServiceCardProps {
  service: PrintService;
  onOpenChat: (serviceId: string) => void;
}

export function ServiceCard({ service, onOpenChat }: ServiceCardProps) {
  const telegramDeepLink = `https://t.me/PrintOSBot?start=quote_${service.id.replace("srv-", "")}`;
  const conversationalPrice = service.startingPrice.replace("From ", "Starts at ");

  return (
    <div
      onClick={() => onOpenChat(service.id)}
      className="group flex flex-col cursor-pointer transition-all duration-300"
    >
      {/* 🖼️ HERO IMAGE CONTAINER (The Main Character - Aspect 3/4) */}
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl border border-[#EADDCF] dark:border-[#331D25] bg-white dark:bg-[#1C1116] transition-all duration-500 group-hover:border-[#A4193D] group-hover:shadow-xl group-hover:shadow-[#A4193D]/10">
        {/* Physical Mockup */}
        <div className="relative h-full w-full overflow-hidden flex items-center justify-center">
          {service.imageUrl ? (
            <Image
              src={service.imageUrl}
              alt={service.name}
              fill
              className="object-cover rounded-2xl transition-transform duration-700 ease-out group-hover:scale-108"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#A8949A]">
              <Sparkles className="h-8 w-8 text-[#A4193D]" />
            </div>
          )}
        </div>

        {/* Turnaround Badge in corner */}
        <div className="absolute top-3 right-3 rounded-full bg-white/90 dark:bg-black/80 px-2.5 py-1 text-[10px] font-mono font-medium text-[#181113] dark:text-[#FBF6F0] backdrop-blur-md border border-[#EADDCF] dark:border-[#331D25] shadow-xs">
          {service.turnaround}
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenChat(service.id);
            }}
            className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#A4193D] hover:bg-[#881230] text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 fill-[#FFDFB9] text-[#FFDFB9]" />
            <span>Get Price in 15s</span>
          </button>

          <a
            href={telegramDeepLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1C1116] hover:bg-[#F4EDE4] dark:hover:bg-[#2E1C23] text-[#181113] dark:text-[#FBF6F0] border border-[#EADDCF] dark:border-[#331D25] shadow-lg transition-colors"
            title="Chat on Telegram"
          >
            <Send className="h-3.5 w-3.5 text-[#A4193D]" />
          </a>
        </div>
      </div>

      {/* 🏷️ CLEAN EDITORIAL METADATA BELOW */}
      <div className="mt-3.5 px-1 space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C7A80] dark:text-[#A8949A] block">
          {service.categoryLabel}
        </span>

        <div className="flex items-baseline flex-col gap-1">
          <h3 className="text-sm sm:text-base font-extrabold text-[#181113] dark:text-[#FBF6F0] group-hover:text-[#A4193D] dark:group-hover:text-[#FFDFB9] transition-colors">
            {service.name}
          </h3>
          <span className="text-xs sm:text-sm font-mono font-bold text-[#A4193D] dark:text-[#FFDFB9] shrink-0">
            {conversationalPrice}
          </span>
        </div>

        <p className="text-xs text-[#6E5F64] dark:text-[#A8949A] line-clamp-1">
          {service.bestFor || service.displayTitle}
        </p>
      </div>
    </div>
  );
}
