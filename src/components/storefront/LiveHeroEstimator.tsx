"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Calculator, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveHeroEstimatorProps {
  onOpenChat: (serviceId?: string) => void;
}

type EstimatorServiceType = "custom-tshirt" | "flex-banner" | "rollup-banner" | "business-cards" | "photo-frame";

export function LiveHeroEstimator({ onOpenChat }: LiveHeroEstimatorProps) {
  const [serviceType, setServiceType] = useState<EstimatorServiceType>("custom-tshirt");
  
  // Custom T-shirt state
  const [shirtQty, setShirtQty] = useState(50);
  const [shirtPrintSize, setShirtPrintSize] = useState<"front" | "front-back" | "pocket">("front");

  // Outdoor banner state
  const [bannerWidth, setBannerWidth] = useState(10);
  const [bannerHeight, setBannerHeight] = useState(4);
  const [bannerQty, setBannerQty] = useState(1);

  // Rollup state
  const [rollupQty, setRollupQty] = useState(2);

  // Business cards state
  const [cardsPacks, setCardsPacks] = useState(2); // in hundreds (2 = 200 pcs)
  const [cardFinish, setCardFinish] = useState<"matte" | "velvet">("matte");

  // Photo frame state
  const [frameSize, setFrameSize] = useState<"12x16" | "16x20" | "24x36">("16x20");
  const [frameQty, setFrameQty] = useState(1);

  // Dynamic calculations
  const calculation = useMemo(() => {
    switch (serviceType) {
      case "custom-tshirt": {
        let baseUnit = shirtQty >= 100 ? 3800 : shirtQty >= 20 ? 4500 : 5200;
        if (shirtPrintSize === "front-back") baseUnit += 1000;
        if (shirtPrintSize === "pocket") baseUnit -= 500;
        const total = shirtQty * baseUnit;
        const deposit = Math.round(total * 0.7);
        return {
          title: `${shirtQty}x Custom Heavyweight Cotton Shirts`,
          specSummary: `Premium Cotton Blank • ${shirtPrintSize === "front" ? "Front Print" : shirtPrintSize === "front-back" ? "Front & Back Print" : "Pocket Logo"}`,
          unitRateText: `₦${baseUnit.toLocaleString()} / piece`,
          total,
          deposit,
          balance: total - deposit,
          turnaround: "24–48h Shomolu Dispatch",
          serviceId: "srv-custom-tshirt",
        };
      }
      case "flex-banner": {
        const sqft = bannerWidth * bannerHeight * bannerQty;
        const ratePerSqft = sqft >= 100 ? 750 : 850;
        const total = Math.max(sqft * ratePerSqft, 4500);
        const deposit = Math.round(total * 0.7);
        return {
          title: `${bannerQty}x Outdoor Banner (${bannerWidth}ft × ${bannerHeight}ft)`,
          specSummary: `${sqft} sq.ft Weatherproof Vinyl • Reinforced Eyelets & Hemming`,
          unitRateText: `₦${ratePerSqft} / sqft`,
          total,
          deposit,
          balance: total - deposit,
          turnaround: "Same-Day / 24h Express",
          serviceId: "srv-flex-banner",
        };
      }
      case "rollup-banner": {
        const unitRate = 32000;
        const total = rollupQty * unitRate;
        const deposit = Math.round(total * 0.7);
        return {
          title: `${rollupQty}x Retractable Standup Banner`,
          specSummary: `3x7 ft Aluminum Base Stand + Full-Color Vinyl Print + Free Carry Bag`,
          unitRateText: `₦${unitRate.toLocaleString()} / unit`,
          total,
          deposit,
          balance: total - deposit,
          turnaround: "24h Shomolu Dispatch",
          serviceId: "srv-rollup-banner",
        };
      }
      case "business-cards": {
        const basePackRate = cardFinish === "velvet" ? 16000 : 12000;
        const total = cardsPacks * basePackRate;
        const deposit = Math.round(total * 0.7);
        return {
          title: `${cardsPacks * 100}x Premium Business Cards (${cardsPacks} packs)`,
          specSummary: `Heavyweight Card • ${cardFinish === "velvet" ? "Velvet Matte Finish" : "Standard Matte Lamination"} • Double-Sided`,
          unitRateText: `₦${basePackRate.toLocaleString()} / 100 pcs`,
          total,
          deposit,
          balance: total - deposit,
          turnaround: "24–48h Delivery",
          serviceId: "srv-business-cards",
        };
      }
      case "photo-frame": {
        const rateMap = { "12x16": 12000, "16x20": 16500, "24x36": 28000 };
        const unitRate = rateMap[frameSize];
        const total = frameQty * unitRate;
        const deposit = Math.round(total * 0.7);
        return {
          title: `${frameQty}x Custom Picture & Canvas Frame (${frameSize} in)`,
          specSummary: `Solid Wood Molding • Ultra-Clear Glass & Mounting Hardware`,
          unitRateText: `₦${unitRate.toLocaleString()} / frame`,
          total,
          deposit,
          balance: total - deposit,
          turnaround: "24–48h Delivery",
          serviceId: "srv-photo-frame",
        };
      }
    }
  }, [serviceType, shirtQty, shirtPrintSize, bannerWidth, bannerHeight, bannerQty, rollupQty, cardsPacks, cardFinish, frameSize, frameQty]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-[#EADDCF] dark:border-[#331D25] bg-white dark:bg-[#1C1116] p-5 sm:p-6 shadow-2xl text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EADDCF] dark:border-[#2E1C23] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#A4193D]/10 border border-[#A4193D]/20 text-[#A4193D] dark:text-[#FFDFB9]">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#181113] dark:text-[#FBF6F0]">Interactive Price Calculator</h3>
            <p className="text-[11px] text-[#6E5F64] dark:text-[#A8949A]">Live Lagos Production Rates</p>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-full">
          <ShieldCheck className="h-3 w-3" />
          70% Deposit Rule
        </span>
      </div>

      {/* Service Selector Tabs */}
      <div className="mt-4 flex flex-wrap gap-1.5 p-1 rounded-2xl bg-[#FAF7F2] dark:bg-[#120A0D] border border-[#EADDCF] dark:border-[#2E1C23]">
        {[
          { id: "custom-tshirt", label: "👕 Custom Shirts" },
          { id: "flex-banner", label: "🚩 Outdoor Banner" },
          { id: "rollup-banner", label: "🖼️ Standup Banner" },
          { id: "business-cards", label: "💳 Business Cards" },
          { id: "photo-frame", label: "🖼️ Framing" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setServiceType(tab.id as EstimatorServiceType)}
            className={`flex-1 min-w-[100px] rounded-xl py-2 px-2.5 text-xs font-bold transition-all text-center cursor-pointer ${
              serviceType === tab.id
                ? "bg-[#A4193D] text-white shadow-xs"
                : "text-[#6E5F64] dark:text-[#A8949A] hover:text-[#181113] dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Controls based on chosen service */}
      <div className="mt-5 space-y-4">
        {serviceType === "custom-tshirt" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6E5F64] dark:text-[#A8949A]">Quantity Needed:</span>
              <span className="font-mono font-bold text-[#A4193D] dark:text-[#FFDFB9]">{shirtQty} pieces</span>
            </div>
            <input
              type="range"
              min={5}
              max={500}
              step={5}
              value={shirtQty}
              onChange={(e) => setShirtQty(parseInt(e.target.value))}
              className="w-full accent-[#A4193D] h-1.5 bg-[#EADDCF] dark:bg-[#2E1C23] rounded-lg cursor-pointer"
            />
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: "front", label: "Front Print" },
                { id: "front-back", label: "Front & Back" },
                { id: "pocket", label: "Pocket Logo" },
              ].map((sz) => (
                <button
                  key={sz.id}
                  onClick={() => setShirtPrintSize(sz.id as any)}
                  className={`rounded-xl border py-1.5 px-2 text-[11px] font-bold text-center transition-all cursor-pointer ${
                    shirtPrintSize === sz.id
                      ? "border-[#A4193D] bg-[#A4193D]/10 text-[#A4193D] dark:text-[#FFDFB9]"
                      : "border-[#EADDCF] dark:border-[#2E1C23] text-[#6E5F64] dark:text-[#A8949A]"
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {serviceType === "flex-banner" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[#6E5F64] dark:text-[#A8949A] block mb-1">Width (Feet):</label>
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={bannerWidth}
                  onChange={(e) => setBannerWidth(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-xl border border-[#EADDCF] dark:border-[#2E1C23] bg-[#FAF7F2] dark:bg-[#120A0D] px-3 py-1.5 text-xs text-[#181113] dark:text-[#FBF6F0] font-mono focus:border-[#A4193D] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[#6E5F64] dark:text-[#A8949A] block mb-1">Height (Feet):</label>
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={bannerHeight}
                  onChange={(e) => setBannerHeight(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-xl border border-[#EADDCF] dark:border-[#2E1C23] bg-[#FAF7F2] dark:bg-[#120A0D] px-3 py-1.5 text-xs text-[#181113] dark:text-[#FBF6F0] font-mono focus:border-[#A4193D] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#6E5F64] dark:text-[#A8949A]">Units / Copies:</span>
              <span className="font-mono font-bold text-[#A4193D] dark:text-[#FFDFB9]">{bannerQty} unit(s)</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={bannerQty}
              onChange={(e) => setBannerQty(parseInt(e.target.value))}
              className="w-full accent-[#A4193D] h-1.5 bg-[#EADDCF] dark:bg-[#2E1C23] rounded-lg cursor-pointer"
            />
          </div>
        )}

        {serviceType === "rollup-banner" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6E5F64] dark:text-[#A8949A]">Number of Stands:</span>
              <span className="font-mono font-bold text-[#A4193D] dark:text-[#FFDFB9]">{rollupQty} stand(s)</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={rollupQty}
              onChange={(e) => setRollupQty(parseInt(e.target.value))}
              className="w-full accent-[#A4193D] h-1.5 bg-[#EADDCF] dark:bg-[#2E1C23] rounded-lg cursor-pointer"
            />
          </div>
        )}

        {serviceType === "business-cards" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6E5F64] dark:text-[#A8949A]">Total Cards:</span>
              <span className="font-mono font-bold text-[#A4193D] dark:text-[#FFDFB9]">{cardsPacks * 100} cards ({cardsPacks} packs)</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={cardsPacks}
              onChange={(e) => setCardsPacks(parseInt(e.target.value))}
              className="w-full accent-[#A4193D] h-1.5 bg-[#EADDCF] dark:bg-[#2E1C23] rounded-lg cursor-pointer"
            />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setCardFinish("matte")}
                className={`rounded-xl border py-1.5 px-2 text-[11px] font-bold text-center transition-all cursor-pointer ${
                  cardFinish === "matte"
                    ? "border-[#A4193D] bg-[#A4193D]/10 text-[#A4193D] dark:text-[#FFDFB9]"
                    : "border-[#EADDCF] dark:border-[#2E1C23] text-[#6E5F64] dark:text-[#A8949A]"
                }`}
              >
                Matte Lamination
              </button>
              <button
                onClick={() => setCardFinish("velvet")}
                className={`rounded-xl border py-1.5 px-2 text-[11px] font-bold text-center transition-all cursor-pointer ${
                  cardFinish === "velvet"
                    ? "border-[#A4193D] bg-[#A4193D]/10 text-[#A4193D] dark:text-[#FFDFB9]"
                    : "border-[#EADDCF] dark:border-[#2E1C23] text-[#6E5F64] dark:text-[#A8949A]"
                }`}
              >
                Velvet Finish
              </button>
            </div>
          </div>
        )}

        {serviceType === "photo-frame" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "12x16", label: '12" × 16"' },
                { id: "16x20", label: '16" × 20"' },
                { id: "24x36", label: '24" × 36"' },
              ].map((sz) => (
                <button
                  key={sz.id}
                  onClick={() => setFrameSize(sz.id as any)}
                  className={`rounded-xl border py-1.5 px-2 text-[11px] font-bold text-center transition-all cursor-pointer ${
                    frameSize === sz.id
                      ? "border-[#A4193D] bg-[#A4193D]/10 text-[#A4193D] dark:text-[#FFDFB9]"
                      : "border-[#EADDCF] dark:border-[#2E1C23] text-[#6E5F64] dark:text-[#A8949A]"
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#6E5F64] dark:text-[#A8949A]">Quantity:</span>
              <span className="font-mono font-bold text-[#A4193D] dark:text-[#FFDFB9]">{frameQty} frame(s)</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={frameQty}
              onChange={(e) => setFrameQty(parseInt(e.target.value))}
              className="w-full accent-[#A4193D] h-1.5 bg-[#EADDCF] dark:bg-[#2E1C23] rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Calculated Breakdown Card */}
      <div className="mt-4 rounded-2xl border border-[#EADDCF] dark:border-[#331D25] bg-[#FAF7F2] dark:bg-[#120A0D] p-4 text-[#181113] dark:text-[#FBF6F0]">
        <div className="flex items-baseline justify-between border-b border-[#EADDCF] dark:border-[#2E1C23] pb-2">
          <div>
            <span className="text-xs font-bold block">{calculation.title}</span>
            <span className="text-[11px] text-[#6E5F64] dark:text-[#A8949A] block mt-0.5">{calculation.specSummary}</span>
          </div>
          <span className="font-mono text-sm font-black text-[#A4193D] dark:text-[#FFDFB9]">
            ₦{calculation.total.toLocaleString()}
          </span>
        </div>

        {/* 70% Deposit & 30% Balance */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-[#FFDFB9]/40 dark:bg-[#2E151E] border border-[#EADDCF] dark:border-[#A4193D]/30 p-2 text-center">
            <span className="text-[10px] text-[#5C0B20] dark:text-[#FFDFB9] block font-bold uppercase tracking-wider">70% Deposit</span>
            <span className="font-mono text-sm sm:text-base font-black text-[#5C0B20] dark:text-[#FFDFB9]">
              ₦{calculation.deposit.toLocaleString()}
            </span>
          </div>
          <div className="rounded-xl bg-white dark:bg-[#1C1116] border border-[#EADDCF] dark:border-[#2E1C23] p-2 text-center">
            <span className="text-[10px] text-[#6E5F64] dark:text-[#A8949A] block font-medium uppercase tracking-wider">30% on Pickup</span>
            <span className="font-mono text-sm sm:text-base font-bold text-[#181113] dark:text-[#FBF6F0]">
              ₦{calculation.balance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onOpenChat(calculation.serviceId)}
          className="mt-3.5 w-full rounded-xl bg-[#A4193D] hover:bg-[#881230] text-white font-extrabold text-xs py-5 shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="mr-2 h-4 w-4 fill-[#FFDFB9] text-[#FFDFB9]" />
          Lock This Quote & Order
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
