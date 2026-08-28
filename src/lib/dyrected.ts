import postgres from "postgres";
import { PRINT_SERVICES, PrintService } from "./services";
import { Pricing_rules, Services } from "@/dyrected-types";

const DATABASE_URL = process.env.DATABASE_URL || "";

// Map category values to clean display labels
export const CATEGORY_LABELS: Record<string, string> = {
  apparel: "Apparel & Merch",
  largeFormat: "Large Format & Signage",
  stationery: "Stationery & Paper",
  framing: "Framing & Wall Art",
  souvenirs: "Apparel & Souvenirs",
};

/**
 * Calculates benchmark display rate from dynamic backend pricing rules,
 * respecting the shop owner's custom unit labels and pack sizes.
 */
function computeStartingPrice(
  serviceId: string,
  serviceData: Services & { unitsPerPack?: number; customUnitLabel?: string },
  pricingRules: Pricing_rules[]
): { price: string; turnaround: string } {
  // 1. Safe relationship ID match (handles both string ID and populated object)
  const rules = pricingRules.filter((r) => {
    const relId = typeof r.service === "object" && r.service !== null ? (r.service as any).id : r.service;
    return relId === serviceId;
  });

  const engine = serviceData.pricingEngine || "matrix";
  const baseBlank = serviceData.baseBlankCost || 0;
  const category = serviceData.category || "apparel";

  // Determine explicit unit suffix without guessing
  const unitSuffix =
    serviceData.customUnitLabel ||
    (serviceData.unit === "pack" && serviceData.unitsPerPack
      ? `pack of ${serviceData.unitsPerPack}`
      : serviceData.unit || "piece");

  // Dynamic realistic turnaround based on category
  const defaultTurnaround =
    category === "largeFormat"
      ? "Same-Day / 24h Express"
      : category === "framing"
      ? "2–3 Days Delivery"
      : "24–48h Delivery";

  if (rules.length > 0) {
    if (engine === "matrix") {
      const prices = rules
        .map((r) => (r.unitPrice || 0) + baseBlank)
        .filter((p) => p > 0);

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      if (minPrice > 0) {
        return {
          price: `₦${minPrice.toLocaleString()} / ${unitSuffix}`,
          turnaround: defaultTurnaround,
        };
      }
    } else if (engine === "area") {
      const areaRule = rules.find((r) => (r.ratePerUnitArea ?? 0) > 0);
      if (areaRule && areaRule.ratePerUnitArea) {
        return {
          price: `₦${areaRule.ratePerUnitArea.toLocaleString()} / sqft`,
          turnaround: defaultTurnaround,
        };
      }
      const unitRule = rules.find((r) => (r.unitPrice ?? 0) > 0);
      if (unitRule && unitRule.unitPrice) {
        return {
          price: `₦${unitRule.unitPrice.toLocaleString()} / ${unitSuffix === "piece" ? "unit" : unitSuffix}`,
          turnaround: defaultTurnaround,
        };
      }
    } else if (engine === "perimeter") {
      const perimRule = rules[0];
      const price = perimRule?.unitPrice || 15000;
      return {
        price: `₦${price.toLocaleString()} / ${unitSuffix === "piece" ? "frame" : unitSuffix}`,
        turnaround: defaultTurnaround,
      };
    } else if (engine === "flatRate") {
      const flatRule = rules.find((r) => (r.unitPrice ?? 0) > 0) || rules[0];
      const price = (flatRule?.unitPrice || 0) + baseBlank;
      if (price > 0) {
        return {
          price: `₦${price.toLocaleString()} / ${unitSuffix}`,
          turnaround: defaultTurnaround,
        };
      }
    }
  }

  // Fallback if no rules configured yet
  if (baseBlank > 0) {
    return {
      price: `From ₦${baseBlank.toLocaleString()} / ${unitSuffix}`,
      turnaround: defaultTurnaround,
    };
  }

  return {
    price: "Custom Quote",
    turnaround: defaultTurnaround,
  };
}

/**
 * Fetches print services from Dyrected backend PostgreSQL collection_services
 * and resolves live starting rates from collection_pricing_rules.
 */
export async function getDyrectedServices(): Promise<PrintService[]> {
  try {
    const sql = postgres(DATABASE_URL, { max: 1, timeout: 4 });
    const [serviceRows, ruleRows] = await Promise.all([
      sql`SELECT id, data FROM collection_services ORDER BY id ASC`,
      sql`SELECT id, data FROM collection_pricing_rules`,
    ]);
    await sql.end();

    const pricingRules = (ruleRows || []).map((r) => ({
      id: r.id,
      ...(r.data || {}),
    })) as Pricing_rules[];

    if (serviceRows && serviceRows.length > 0) {
      return serviceRows.map((r) => {
        const d = r.data || {};
        const id = (r.id || d.id) as string;
        const calculated = computeStartingPrice(id, d, pricingRules);

        return {
          id,
          name: d.name || "Print Service",
          category: d.category || "apparel",
          categoryLabel: CATEGORY_LABELS[d.category] || "Print Capability",
          pricingEngine: d.pricingEngine || "matrix",
          displayTitle: d.displayTitle || d.name,
          bestFor: d.bestFor || "",
          startingPrice: calculated.price,
          turnaround: calculated.turnaround,
          imageUrl: d.imageUrl || "/images/categories/marketing.png",
          isActive: d.isActive !== false,
          unit: d.unit || "piece",
        };
      });
    }
  } catch (err) {
    console.warn("⚠️ Falling back to static seed services:", err);
  }

  // Fallback to static seed
  return PRINT_SERVICES;
}
