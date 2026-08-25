import {
  defineBooleanField,
  defineCollection,
  defineNumberField,
  defineRelationshipField,
  defineSelectField,
  defineTextField,
} from "@dyrected/core";

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
    defaultColumns: ["name", "category", "pricingEngine", "baseBlankCost", "isActive"],
  },
  fields: [
    defineTextField({
      name: "name",
      label: "Internal Service Name",
      required: true,
    }),
    defineTextField({
      name: "displayTitle",
      label: "Customer Showcase Title",
      required: false,
    }),
    defineSelectField({
      name: "category",
      label: "Service Category",
      options: [
        { label: "Large Format & Banners", value: "largeFormat" },
        { label: "Apparel & Merch", value: "apparel" },
        { label: "Stationery & Marketing", value: "stationery" },
        { label: "Photo Framing & Canvas", value: "framing" },
        { label: "Souvenirs & Hard Goods", value: "souvenirs" },
      ],
      required: true,
    }),
    defineSelectField({
      name: "pricingEngine",
      label: "Pricing Algorithm Engine",
      options: [
        { label: "Matrix Engine (Volume Tiered)", value: "matrix" },
        { label: "Area Engine (2D Surface)", value: "area" },
        { label: "Perimeter Engine (1D Linear)", value: "perimeter" },
        { label: "Flat Rate", value: "flatRate" },
      ],
      required: true,
      defaultValue: "matrix",
    }),
    defineRelationshipField({
      name: "defaultMaterial",
      label: "Default Material Benchmark",
      relationTo: "materials",
      required: false,
    }),
    defineNumberField({
      name: "baseBlankCost",
      label: "Base Hardware / Blank Cost (₦)",
      required: false,
      defaultValue: 0,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineSelectField({
      name: "unit",
      label: "Unit of Measurement",
      options: [
        { label: "Piece", value: "piece" },
        { label: "Square Feet (sqft)", value: "sqft" },
        { label: "Square Meters (sqm)", value: "sqm" },
        { label: "Linear Inch (in)", value: "inch" },
        { label: "Pack", value: "pack" },
      ],
      defaultValue: "piece",
      required: true,
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
  ],
});
