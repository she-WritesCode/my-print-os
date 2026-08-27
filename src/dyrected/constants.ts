/**
 * Single source of truth for Dyrected Pricing Engines & Select Options
 */

export const PRICING_ENGINES = ["matrix", "area", "perimeter", "flatRate"] as const;
export type PricingEngine = (typeof PRICING_ENGINES)[number];

export const SERVICE_ENGINE_OPTIONS: { label: string; value: PricingEngine }[] = [
  { label: "Matrix (Qty Tiers + Size / Color)", value: "matrix" },
  { label: "Area (Sq. Ft. / Sq. Meters)", value: "area" },
  { label: "Perimeter (Linear Inches / Moulding)", value: "perimeter" },
  { label: "Flat Rate (Fixed Unit / Souvenirs)", value: "flatRate" },
];

export const PRICING_RULE_ENGINE_OPTIONS: { label: string; value: PricingEngine }[] = [
  { label: "Matrix Engine (Volume Tiered: Apparel & Stationery)", value: "matrix" },
  { label: "Area Engine (2D Surface: Banners & Stickers ₦/sqft)", value: "area" },
  { label: "Perimeter Engine (1D Linear: Frames & Canvas ₦/inch)", value: "perimeter" },
  { label: "Flat Rate Engine (Fixed Unit Merch)", value: "flatRate" },
];
