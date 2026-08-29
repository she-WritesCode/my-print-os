"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Send, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onOpenChat: () => void;
}

export function Header({ onOpenChat }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#EADDCF] dark:border-[#2E1C23] bg-[#FAF7F2]/90 dark:bg-[#120A0D]/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A4193D] font-mono font-black text-sm text-[#FFDFB9] shadow-xs group-hover:scale-105 transition-transform">
            OS
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-[#181113] dark:text-[#FBF6F0] group-hover:text-[#A4193D] transition-colors">
              Print<span className="text-[#A4193D]">OS</span>
            </span>
            <span className="text-[10px] font-mono tracking-wider text-[#6E5F64] dark:text-[#A8949A] uppercase -mt-0.5">
              Shomolu Hub
            </span>
          </div>
        </Link>

        {/* Minimal Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#6E5F64] dark:text-[#A8949A]">
          <Link
            href="#capabilities"
            className="hover:text-[#A4193D] dark:hover:text-[#FFDFB9] transition-colors"
          >
            What We Print
          </Link>
          <Link
            href="#manifesto"
            className="hover:text-[#A4193D] dark:hover:text-[#FFDFB9] transition-colors"
          >
            70% Deposit Rule
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[#A4193D] dark:text-[#FFDFB9] font-bold hover:underline transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Guardian Dashboard</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {/* Telegram Channel / Chat Link */}
          <a
            href="https://t.me/PrintOSBot"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#EADDCF] dark:border-[#2E1C23] bg-[#F4EDE4] dark:bg-[#1C1116] text-[#6E5F64] dark:text-[#A8949A] hover:text-[#A4193D] dark:hover:text-[#FFDFB9] transition-colors"
            title="Chat on Telegram"
          >
            <Send className="h-3.5 w-3.5" />
          </a>

          {/* Quick AI Quote CTA */}
          <Button
            size="sm"
            onClick={onOpenChat}
            className="rounded-full bg-[#A4193D] hover:bg-[#881230] text-white font-bold text-xs px-4 py-2 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 fill-[#FFDFB9] text-[#FFDFB9]" />
            <span>Instant Quote</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
