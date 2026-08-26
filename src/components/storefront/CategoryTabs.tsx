"use client";

import React from "react";

export type CategoryKey = "all" | "apparel" | "largeFormat" | "stationery" | "framing" | "souvenirs";

interface CategoryTabsProps {
  selectedCategory: CategoryKey;
  onSelectCategory: (category: CategoryKey) => void;
  counts: Record<CategoryKey, number>;
}

export function CategoryTabs({ selectedCategory, onSelectCategory, counts }: CategoryTabsProps) {
  const tabs: { key: CategoryKey; label: string }[] = [
    { key: "all", label: "All Things We Print" },
    { key: "apparel", label: "T-Shirts & Merch" },
    { key: "largeFormat", label: "Banners & Signs" },
    { key: "stationery", label: "Flyers & Cards" },
    { key: "framing", label: "Frames & Canvas" },
    { key: "souvenirs", label: "Mugs & Souvenirs" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-6">
      {tabs.map((tab) => {
        const isSelected = selectedCategory === tab.key;
        const count = counts[tab.key] || 0;

        return (
          <button
            key={tab.key}
            onClick={() => onSelectCategory(tab.key)}
            className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              isSelected
                ? "bg-[#A4193D] text-white shadow-sm font-bold"
                : "bg-[#F4EDE4] dark:bg-[#24151B] text-[#6E5F64] dark:text-[#A8949A] hover:text-[#181113] dark:hover:text-white hover:bg-[#EADDCF] dark:hover:bg-[#331D25]"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono transition-colors ${
                isSelected
                  ? "bg-white/20 text-white font-bold"
                  : "text-[#8C7A80] dark:text-[#806E73] group-hover:text-[#181113] dark:group-hover:text-zinc-200"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
