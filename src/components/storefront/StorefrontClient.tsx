"use client";

import React, { useState } from "react";
import { Header } from "@/components/storefront/Header";
import { HeroSection } from "@/components/storefront/HeroSection";
import { ServiceGrid } from "@/components/storefront/ServiceGrid";
import { TrustBanners } from "@/components/storefront/TrustBanners";
import { Footer } from "@/components/storefront/Footer";
import { QuoteChatDrawer } from "@/components/chat/QuoteChatDrawer";
import { PrintService } from "@/lib/services";

interface StorefrontClientProps {
  services: PrintService[];
}

export function StorefrontClient({ services }: StorefrontClientProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [prefillServiceId, setPrefillServiceId] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

  const handleOpenChat = (serviceId?: string, prompt?: string) => {
    setPrefillServiceId(serviceId || null);
    setInitialPrompt(prompt || null);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setPrefillServiceId(null);
    setInitialPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#120A0D] text-[#181113] dark:text-[#FBF6F0] transition-colors duration-200">
      {/* Header Navigation with Theme Toggle */}
      <Header onOpenChat={() => handleOpenChat()} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with Lovable-Style Chat Prompt */}
        <HeroSection onOpenChat={handleOpenChat} />

        {/* Capabilities Showcase */}
        <ServiceGrid services={services} onOpenChat={(id) => handleOpenChat(id)} />

        {/* High-Contrast Editorial Trust Banner */}
        <TrustBanners onOpenChat={() => handleOpenChat()} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Conversational Quote Intake Drawer */}
      <QuoteChatDrawer
        isOpen={chatOpen}
        onClose={handleCloseChat}
        prefillServiceId={prefillServiceId}
        initialPrompt={initialPrompt}
      />
    </div>
  );
}
