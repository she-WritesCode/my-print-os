"use client";

import React, { useState, useMemo } from "react";
import { PrintService } from "@/lib/services";
import { ServiceCard } from "./ServiceCard";
import { CategoryTabs, CategoryKey } from "./CategoryTabs";

interface ServiceGridProps {
  services: PrintService[];
  onOpenChat: (serviceId?: string) => void;
}

export function ServiceGrid({ services, onOpenChat }: ServiceGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");

  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryKey, number> = {
      all: services.length,
      apparel: 0,
      largeFormat: 0,
      stationery: 0,
      framing: 0,
      souvenirs: 0,
    };

    services.forEach((s) => {
      if (s.category in counts) {
        counts[s.category as CategoryKey]++;
      }
    });

    return counts;
  }, [services]);

  return (
    <section id="capabilities" className="py-12 md:py-16 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Warm Conversational Section Header */}
        <div className="text-center max-w-xl mx-auto mb-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#A4193D] dark:text-[#FFDFB9] block mb-2">
            The Print Shop
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#181113] dark:text-[#FBF6F0] tracking-tight">
            What are we printing for you today?
          </h2>
          <p className="mt-2 text-sm text-[#6E5F64] dark:text-[#A8949A] leading-relaxed">
            Click on any item below to see starting rates, or ask our AI for an exact price based on your quantity.
          </p>
        </div>

        {/* Friendly Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          counts={categoryCounts}
        />

        {/* Clean Service Cards Grid with Image as Main Character */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onOpenChat={onOpenChat}
            />
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#EADDCF] dark:border-[#331D25] bg-[#F4EDE4] dark:bg-[#1C1116] py-16 text-center">
            <h3 className="text-sm font-bold text-[#181113] dark:text-[#FBF6F0]">No items found in this section</h3>
            <p className="text-xs text-[#6E5F64] dark:text-[#A8949A] mt-1">Select another category above to see our work.</p>
          </div>
        )}
      </div>
    </section>
  );
}
