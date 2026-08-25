import {
  defineCollection,
  defineDateField,
  defineNumberField,
  defineSelectField,
  defineTextField,
} from "@dyrected/core";

export const Materials = defineCollection({
  slug: "materials",
  labels: {
    singular: "Raw Material",
    plural: "Raw Materials",
  },
  admin: {
    useAsTitle: "name",
    icon: "Package",
    group: "Catalog & Pricing Engine",
    defaultColumns: ["name", "unitCost", "unit", "category", "lastUpdated"],
  },
  access: {
    read: { policy: "isStaff" },
    create: { policy: "isAdminOrOwner" },
    update: { policy: "isAdminOrOwner" },
    delete: { policy: "isAdminOrOwner" },
  },
  fields: [
    defineTextField({
      name: "name",
      label: "Material Name",
      required: true,
    }),
    defineSelectField({
      name: "category",
      label: "Category",
      options: [
        { label: "Large Format / Signage", value: "largeFormat" },
        { label: "Apparel / Garments", value: "apparel" },
        { label: "Paper / Stationery", value: "stationery" },
        { label: "Framing / Canvas", value: "framing" },
        { label: "Souvenirs / Hard Goods", value: "souvenirs" },
      ],
      required: true,
    }),
    defineNumberField({
      name: "unitCost",
      label: "Unit Benchmark Cost (₦)",
      required: true,
      min: 0,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineTextField({
      name: "unit",
      label: "Measurement Unit",
      required: true,
      defaultValue: "sqft",
    }),
    defineDateField({
      name: "lastUpdated",
      label: "Last Price Update",
      required: false,
      admin: {
        format: { type: "date", dateStyle: "medium" },
      },
    }),
    defineTextField({
      name: "notes",
      label: "Supplier / Market Notes",
      required: false,
    }),
  ],
});
