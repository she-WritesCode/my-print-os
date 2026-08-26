import {
  defineBooleanField,
  defineCollection,
  defineJoinField,
  defineNumberField,
  defineSelectField,
  defineTextField,
} from "@dyrected/core";

import type { Services as ServiceDoc, Pricing_rules as PricingRuleDoc } from "@/dyrected-types";

export interface ServiceWithCalculatedPrice extends ServiceDoc {
  startingPrice?: string;
  unitsPerPack?: number;
  customUnitLabel?: string;
}

export const Services = defineCollection({
  slug: "services",
  labels: {
    singular: "Print Service",
    plural: "Print Services",
  },
  admin: {
    useAsTitle: "name",
    icon: "Layers",
    group: "Catalog & Pricing Engine",
    defaultColumns: [
      "name",
      "category",
      "pricingEngine",
      "defaultMaterial",
      "baseBlankCost",
      "unit",
      "unitsPerPack",
      "isActive",
    ],
  },
  access: {
    read: { policy: "isPublic" },
    create: { policy: "isAdminOrOwner" },
    update: { policy: "isAdminOrOwner" },
    delete: { policy: "isAdminOrOwner" },
  },
  fields: [
    defineTextField({
      name: "name",
      label: "Internal Service Name",
      required: true,
    }),
    defineTextField({
      name: "displayTitle",
      label: "Customer-Facing Title",
      required: false,
    }),
    defineSelectField({
      name: "category",
      label: "Category",
      required: true,
      options: [
        { label: "T-Shirts & Merch", value: "apparel" },
        { label: "Banners & Signs", value: "largeFormat" },
        { label: "Flyers & Cards", value: "stationery" },
        { label: "Frames & Canvas", value: "framing" },
        { label: "Mugs & Souvenirs", value: "souvenirs" },
      ],
      defaultValue: "apparel",
    }),
    defineSelectField({
      name: "pricingEngine",
      label: "Pricing Engine",
      required: true,
      options: [
        { label: "Matrix (Qty Tiers + Size / Color)", value: "matrix" },
        { label: "Area (Sq. Ft. / Sq. Meters)", value: "area" },
        { label: "Perimeter (Linear Inches / Moulding)", value: "perimeter" },
        { label: "Flat Rate", value: "flatRate" },
      ],
      defaultValue: "matrix",
    }),
    defineTextField({
      name: "defaultMaterial",
      label: "Primary Material Reference",
      required: false,
    }),
    defineNumberField({
      name: "baseBlankCost",
      label: "Base Blank Item Cost (₦)",
      required: false,
      defaultValue: 0,
    }),
    defineSelectField({
      name: "unit",
      label: "Pricing Unit",
      options: [
        { label: "Piece", value: "piece" },
        { label: "Sq. Ft.", value: "sqft" },
        { label: "Pack", value: "pack" },
        { label: "Linear Inch", value: "inch" },
        { label: "Unit", value: "unit" },
      ],
      defaultValue: "piece",
      required: true,
    }),
    defineNumberField({
      name: "unitsPerPack",
      label: "Units Per Pack (e.g. 100, 500, 1000 for flyers/cards)",
      required: false,
    }),
    defineTextField({
      name: "customUnitLabel",
      label: "Custom Price Suffix (e.g. 'pack of 500', 'A4 sheet', 'stand')",
      required: false,
    }),
    defineTextField({
      name: "bestFor",
      label: "Best For Tagline",
      required: false,
    }),
    defineTextField({
      name: "imageUrl",
      label: "Showcase Image Path",
      required: false,
    }),
    defineBooleanField({
      name: "isActive",
      label: "Visible on Storefront",
      defaultValue: true,
      admin: {
        format: {
          type: "boolean",
          true: { label: "Active", tone: "success" },
          false: { label: "Inactive", tone: "neutral" },
        },
      },
    }),
    defineJoinField({
      name: "pricingRules",
      label: "Pricing Rules",
      collection: "pricing_rules",
      on: "service",
    }),
  ],
  hooks: {
    afterRead: [
      async ({ doc, db }) => {
        try {
          const service = doc as ServiceWithCalculatedPrice;
          const serviceId = service.id;
          if (!serviceId) return doc;

          const res = await db.find({
            collection: "pricing_rules",
            where: { service: { equals: serviceId } },
          });

          const rules = (res?.docs as PricingRuleDoc[]) || [];
          if (rules.length > 0) {
            const engine = service.pricingEngine;
            const unitSuffix =
              service.customUnitLabel ||
              (service.unit === "pack" && service.unitsPerPack ? `pack of ${service.unitsPerPack}` : service.unit || "piece");
            const baseBlank = service.baseBlankCost || 0;

            if (engine === "matrix") {
              const prices = rules
                .map((r) => (r.unitPrice || 0) + baseBlank)
                .filter((p) => p > 0);
              const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
              if (minPrice > 0) {
                service.startingPrice = `Starts at ₦${minPrice.toLocaleString()} / ${unitSuffix}`;
              }
            } else if (engine === "area") {
              const areaRule = rules.find((r) => (r.ratePerUnitArea ?? 0) > 0) || rules[0];
              if (areaRule?.ratePerUnitArea) {
                service.startingPrice = `Starts at ₦${areaRule.ratePerUnitArea.toLocaleString()} / sqft`;
              } else if (areaRule?.unitPrice) {
                service.startingPrice = `Starts at ₦${areaRule.unitPrice.toLocaleString()} / ${unitSuffix}`;
              }
            } else if (engine === "perimeter") {
              const perimRule = rules[0];
              const price = perimRule?.unitPrice || 15000;
              service.startingPrice = `Starts at ₦${price.toLocaleString()} / ${unitSuffix === "piece" ? "frame" : unitSuffix}`;
            } else if (engine === "flatRate") {
              const flatRule = rules.find((r) => (r.unitPrice ?? 0) > 0) || rules[0];
              const price = (flatRule?.unitPrice || 0) + baseBlank;
              if (price > 0) {
                service.startingPrice = `Starts at ₦${price.toLocaleString()} / ${unitSuffix}`;
              }
            }
          }
        } catch {
          // Gracefully fallback
        }
        return doc;
      },
    ],
  },
});
