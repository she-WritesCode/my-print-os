"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#EADDCF] dark:border-[#2E1C23] bg-[#F4EDE4] dark:bg-[#160D11] py-12 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo & Description */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A4193D] font-mono font-bold text-xs text-[#FFDFB9]">
              OS
            </div>
            <div>
              <span className="font-bold text-sm text-[#181113] dark:text-[#FBF6F0]">PrintOS</span>
              <p className="text-xs text-[#6E5F64] dark:text-[#A8949A]">
                Intelligent Print Quoting & Production • Shomolu, Lagos
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-xs text-[#6E5F64] dark:text-[#A8949A]">
            <Link href="#capabilities" className="hover:text-[#A4193D] dark:hover:text-[#FFDFB9] transition-colors">
              Capabilities
            </Link>
            <Link href="#manifesto" className="hover:text-[#A4193D] dark:hover:text-[#FFDFB9] transition-colors">
              Deposit Rule
            </Link>
            <Link href="/admin" className="hover:text-[#A4193D] dark:hover:text-[#FFDFB9] transition-colors">
              Admin Portal
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-[#8C7A80] dark:text-[#6E5F64]">
            © {new Date().getFullYear()} PrintOS. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
