import {
  defineCollection,
  defineNumberField,
  defineRelationshipField,
  defineSelectField,
  defineTextField,
  defineView,
} from "@dyrected/core";
import { PRICING_RULE_ENGINE_OPTIONS } from "../constants";

export const PricingRules = defineCollection({
  slug: "pricing_rules",
  labels: {
    singular: "Pricing Rule",
    plural: "Pricing Rules",
  },
  admin: {
    useAsTitle: "sizeArea",
    icon: "Scale",
    group: "Catalog & Pricing Engine",
    defaultColumns: [
      "service",
      "pricingEngine",
      "sizeArea",
      "minQuantity",
      "unitPrice",
      "ratePerUnitArea",
      "targetMarginPercent",
    ],
  },
  access: {
    read: { policy: "isStaff" },
    create: { policy: "isAdminOrOwner" },
    update: { policy: "isAdminOrOwner" },
    delete: { policy: "isAdminOrOwner" },
  },
  views: [
    defineView({
      slug: "matrix-engine",
      label: "Matrix Engine",
      icon: "Layers",
      layout: "spreadsheet",
      groupBy: "service",
      filter: { pricingEngine: { equals: "matrix" } },
      sort: { field: "service", direction: "asc" },
      columns: ["service", "sizeArea", "minQuantity", "maxQuantity", "unitPrice", "targetMarginPercent"],
      metrics: [
        {
          label: `"Matrix Engine works by calculating the total cost of materials based on the quantity and size of the product. It then applies a markup to the total cost to determine the final price.\nThe formula is: Total Cost = Quantity × Unit Price\nThe final price is then calculated as: Final Price = Total Cost × (1 + Target Margin Percentage)"`,
        },
      ],
    }),
    defineView({
      slug: "area-engine",
      label: "Area Engine",
      icon: "Maximize2",
      layout: "spreadsheet",
      groupBy: "service",
      filter: { pricingEngine: { equals: "area" } },
      sort: { field: "service", direction: "asc" },
      columns: ["service", "sizeArea", "ratePerUnitArea", "targetMarginPercent"],
      metrics: [
        {
          label: `"Area Engine works by calculating the total cost of materials based on the area of the product. It then applies a markup to the total cost to determine the final price.\nThe formula is: Total Cost = Area × Rate per Unit Area\nThe final price is then calculated as: Final Price = Total Cost × (1 + Target Margin Percentage)"`,
        },
      ],
    }),
    defineView({
      slug: "perimeter-engine",
      label: "Perimeter Engine",
      icon: "Frame",
      layout: "spreadsheet",
      groupBy: "service",
      filter: { pricingEngine: { equals: "perimeter" } },
      sort: { field: "service", direction: "asc" },
      columns: ["service", "sizeArea", "ratePerLinearUnit", "targetMarginPercent"],
      metrics: [
        {
          label: `"Perimeter Engine works by calculating the total cost of materials based on the perimeter of the product. It then applies a markup to the total cost to determine the final price.\nThe formula is: Total Cost = Perimeter × Rate per Linear Unit\nThe final price is then calculated as: Final Price = Total Cost × (1 + Target Margin Percentage)"`,
        },
      ],
    }),
    defineView({
      slug: "flat-rate",
      label: "Flat Rate",
      icon: "Tag",
      layout: "spreadsheet",
      groupBy: "service",
      filter: { pricingEngine: { equals: "flatRate" } },
      sort: { field: "service", direction: "asc" },
      columns: ["service", "unitPrice", "targetMarginPercent"],
      metrics: [
        {
          label: `"Flat Rate Engine sets a standardized price per unit or pack.\nThe formula is: Job Cost = (Base Blank Cost + Unit Print Cost) × Quantity\nThe final price is: Final Price = Unit Price × Quantity"`,
        },
      ],
    }),
  ],
  fields: [
    defineRelationshipField({
      name: "service",
      label: "Service",
      relationTo: "services",
      required: true,
    }),
    defineSelectField({
      name: "pricingEngine",
      label: "Pricing Engine Model",
      options: PRICING_RULE_ENGINE_OPTIONS,
      defaultValue: "matrix",
      required: true,
    }),
    defineTextField({
      name: "sizeArea",
      label: "Print Area / Dimension Tier",
      admin: { description: "e.g. A4, A3, Pocket, Single-Sided, Custom Sqft" },
      required: false,
    }),
    defineNumberField({
      name: "minQuantity",
      label: "Minimum Quantity",
      required: false,
      defaultValue: 1,
    }),
    defineNumberField({
      name: "maxQuantity",
      label: "Maximum Quantity (leave empty if no limit)",
      required: false,
    }),
    defineNumberField({
      name: "unitPrice",
      label: "Unit Price (₦)",
      required: false,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineNumberField({
      name: "ratePerUnitArea",
      label: "Rate per Unit Area (₦/sqft)",
      required: false,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineNumberField({
      name: "ratePerLinearUnit",
      label: "Rate per Linear Unit (₦/inch)",
      required: false,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineNumberField({
      name: "targetMarginPercent",
      label: "Target Profit Margin (%)",
      defaultValue: 35,
      required: true,
      admin: {
        format: { type: "percent", scale: false },
      },
    }),
  ],
});
