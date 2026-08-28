import type { Pricing_rules, Services } from "@/dyrected-types";

export interface QuotingInput {
  serviceId?: string;
  item: string;
  quantity: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;
  sizeArea?: string;
  materialName?: string;
  spec?: string;
}

export interface QuotingResult {
  serviceId: string;
  serviceName: string;
  item: string;
  quantity: number;
  specSummary: string;
  unitPrice: number;
  totalPrice: number;
  depositRequired: number; // 70% Material Deposit
  balanceDue: number; // 30% Balance on Delivery
  marginPercent: number;
  orderNumber: string;
}

/**
 * 1. Size / Quantity Matrix Engine
 * (T-shirts, Polos, Screen Print, Flyers, Business Cards)
 */
export function calculateMatrixPrice(
  quantity: number,
  sizeArea: string = "A4",
  baseBlankCost: number = 0,
  rules: Pricing_rules[]
): { unitPrice: number; totalPrice: number; marginPercent: number } {
  // Find matching quantity tier rule
  const normalizedSize = sizeArea.toUpperCase();
  const matchingRule = rules.find((r) => {
    const ruleSize = (r.sizeArea || "A4").toUpperCase();
    const sizeMatches =
      ruleSize === normalizedSize ||
      ruleSize === "STANDARD" ||
      ruleSize === "A4" ||
      sizeArea.toLowerCase().includes(ruleSize.toLowerCase());

    const minQty = r.minQuantity ?? 1;
    const maxQty = r.maxQuantity ?? Infinity;
    const qtyMatches = quantity >= minQty && quantity <= maxQty;

    return sizeMatches && qtyMatches;
  }) || rules[0];

  const printUnitPrice = matchingRule?.unitPrice ?? 2500;
  const unitPrice = baseBlankCost + printUnitPrice;
  const totalPrice = quantity * unitPrice;
  const targetMargin = matchingRule?.targetMarginPercent ?? 35;

  return { unitPrice, totalPrice, marginPercent: targetMargin };
}

/**
 * 2. Area Calculator Engine
 * (Flex Banners, Roll-up Banners, SAV Vinyl Stickers)
 */
export function calculateAreaPrice(
  quantity: number,
  width: number = 10,
  height: number = 4,
  baseBlankCost: number = 0,
  rules: Pricing_rules[]
): { unitPrice: number; totalPrice: number; marginPercent: number } {
  const matchingRule = rules.find((r) => (r.ratePerUnitArea ?? 0) > 0) || rules[0];
  const ratePerSqft = matchingRule?.ratePerUnitArea ?? 850;

  // Total surface area in square feet
  const totalArea = Math.max(1, width * height);
  const unitPrice = totalArea * ratePerSqft + baseBlankCost;
  const totalPrice = quantity * unitPrice;
  const targetMargin = matchingRule?.targetMarginPercent ?? 40;

  return { unitPrice, totalPrice, marginPercent: targetMargin };
}

/**
 * 3. Perimeter Calculator Engine
 * (Custom Picture & Canvas Framing)
 */
export function calculatePerimeterPrice(
  quantity: number,
  width: number = 16,
  height: number = 20,
  baseBlankCost: number = 3000,
  rules: Pricing_rules[]
): { unitPrice: number; totalPrice: number; marginPercent: number } {
  const matchingRule = rules.find((r) => (r.ratePerLinearUnit ?? 0) > 0) || rules[0];
  const ratePerInch = matchingRule?.ratePerLinearUnit ?? 120;

  // Linear perimeter in inches: 2 * (W + H)
  const perimeter = (width + height) * 2;
  const unitPrice = perimeter * ratePerInch + baseBlankCost;
  const totalPrice = quantity * unitPrice;
  const targetMargin = matchingRule?.targetMarginPercent ?? 45;

  return { unitPrice, totalPrice, marginPercent: targetMargin };
}

/**
 * 4. Flat Rate Engine
 * (Fixed Unit Items e.g. Branded Ceramic Mugs, Souvenirs)
 */
export function calculateFlatRatePrice(
  quantity: number,
  baseBlankCost: number = 1200,
  rules: Pricing_rules[]
): { unitPrice: number; totalPrice: number; marginPercent: number } {
  const matchingRule = rules.find((r) => (r.unitPrice ?? 0) > 0) || rules[0];
  const printUnitPrice = matchingRule?.unitPrice ?? 2000;
  const unitPrice = baseBlankCost + printUnitPrice;
  const totalPrice = quantity * unitPrice;
  const targetMargin = matchingRule?.targetMarginPercent ?? 40;

  return { unitPrice, totalPrice, marginPercent: targetMargin };
}

/**
 * Primary Quoting Resolver: Routes any job through its assigned engine
 */
export function quotePrintJob(
  input: QuotingInput,
  services: Services[],
  allRules: Pricing_rules[]
): QuotingResult {
  // Find matching service
  let service = services.find((s) => s.id === input.serviceId);
  if (!service) {
    const inputLower = (input.item || "").toLowerCase();
    service =
      services.find(
        (s) =>
          inputLower.includes(s.name.toLowerCase()) ||
          inputLower.includes((s.displayTitle || "").toLowerCase()) ||
          inputLower.includes(s.category)
      ) || services[0];
  }

  const serviceId = service?.id || "srv-dtf-tshirt";
  const serviceName = service?.displayTitle || service?.name || "Print Service";
  const engine = service?.pricingEngine || "matrix";
  const baseBlank = service?.baseBlankCost || 0;

  // Filter rules for this specific service
  const serviceRules = allRules.filter((r) => {
    const relId = typeof r.service === "object" && r.service !== null ? (r.service as any).id : r.service;
    return relId === serviceId;
  });

  let calculation: { unitPrice: number; totalPrice: number; marginPercent: number };
  let specSummary = "";

  const qty = Math.max(1, input.quantity || 1);

  if (engine === "area") {
    const w = input.width || (serviceId === "srv-rollup-banner" ? 3 : 10);
    const h = input.height || (serviceId === "srv-rollup-banner" ? 7 : 4);
    calculation = calculateAreaPrice(qty, w, h, baseBlank, serviceRules);
    specSummary = `${w}ft × ${h}ft • Weatherproof Material • Reinforced Eyelets`;
  } else if (engine === "perimeter") {
    const w = input.width || 16;
    const h = input.height || 20;
    calculation = calculatePerimeterPrice(qty, w, h, baseBlank, serviceRules);
    specSummary = `${w}" × ${h}" Linear Frame • Ultra-Clear Glass & Mounting`;
  } else if (engine === "flatRate") {
    calculation = calculateFlatRatePrice(qty, baseBlank, serviceRules);
    specSummary = `Full-Color Sublimation Print • Gloss Finish`;
  } else {
    // Matrix Engine (default)
    const sz = input.sizeArea || "A4";
    calculation = calculateMatrixPrice(qty, sz, baseBlank, serviceRules);
    specSummary = `${sz} Print Area • Heavyweight Blank • Vibrant Color`;
  }

  const deposit = Math.round(calculation.totalPrice * 0.7);
  const balance = calculation.totalPrice - deposit;

  // Generate unique order reference
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `ORD-${new Date().getFullYear()}-${randomSuffix}`;

  return {
    serviceId,
    serviceName,
    item: input.item || serviceName,
    quantity: qty,
    specSummary,
    unitPrice: calculation.unitPrice,
    totalPrice: calculation.totalPrice,
    depositRequired: deposit,
    balanceDue: balance,
    marginPercent: calculation.marginPercent,
    orderNumber,
  };
}
