import {
  defineCollection,
  defineNumberField,
  defineRelationshipField,
  defineSelectField,
  defineTextField,
  defineView,
} from "@dyrected/core";

export const PrintJobs = defineCollection({
  slug: "print_jobs",
  labels: {
    singular: "Print Job",
    plural: "Print Jobs",
  },
  admin: {
    useAsTitle: "item",
    icon: "Printer",
    group: "Orders & Customers",
    defaultColumns: ["item", "quantity", "quotedPrice", "materialCost", "marginPercent", "marginStatus", "status"],
  },
  views: [
    defineView({
      slug: "all-jobs",
      label: "All Jobs & Margin Health",
      icon: "TrendingUp",
      layout: "table",
      columns: ["item", "quantity", "quotedPrice", "materialCost", "marginPercent", "marginStatus", "status"],
      sort: { field: "marginPercent", direction: "asc" },
      metrics: [
        { label: "Healthy Jobs (≥ 30%)", aggregate: { count: "*", where: { marginStatus: { equals: "healthy" } } } },
        { label: "At-Risk Jobs (10-30%)", aggregate: { count: "*", where: { marginStatus: { equals: "atRisk" } } } },
        { label: "Losing Money (< 10%)", aggregate: { count: "*", where: { marginStatus: { equals: "lossMaking" } } } },
      ],
    }),
    defineView({
      slug: "jobs-production-status",
      label: "Production Floor Pipeline",
      icon: "Kanban",
      layout: "kanban",
      groupBy: "status",
      columns: ["item", "quantity", "quotedPrice", "marginStatus"],
    }),
  ],
  fields: [
    defineRelationshipField({
      name: "order",
      label: "Parent Order",
      relationTo: "orders",
      required: false,
    }),
    defineRelationshipField({
      name: "conversation",
      label: "Originating Chat",
      relationTo: "conversations",
      required: false,
    }),
    defineRelationshipField({
      name: "service",
      label: "Print Service Method",
      relationTo: "services",
      required: false,
    }),
    defineTextField({
      name: "item",
      label: "Job Description (e.g. 2x Roll-up Banner)",
      required: true,
    }),
    defineNumberField({
      name: "quantity",
      label: "Quantity",
      required: true,
      defaultValue: 1,
      min: 1,
    }),
    defineNumberField({
      name: "width",
      label: "Width (for Area / Perimeter)",
      required: false,
    }),
    defineNumberField({
      name: "height",
      label: "Height (for Area / Perimeter)",
      required: false,
    }),
    defineRelationshipField({
      name: "material",
      label: "Benchmark Raw Material",
      relationTo: "materials",
      required: false,
    }),
    defineTextField({
      name: "spec",
      label: "Print Area & Finishing Specs",
      required: false,
    }),
    defineNumberField({
      name: "quotedPrice",
      label: "Customer Payment (₦)",
      required: true,
      min: 0,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineNumberField({
      name: "materialCost",
      label: "Job Cost (Raw Materials) (₦)",
      required: false,
      defaultValue: 0,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineNumberField({
      name: "marginPercent",
      label: "Expected Profit Margin (%)",
      required: false,
      defaultValue: 0,
      admin: {
        format: { type: "percent", scale: false },
      },
    }),
    defineSelectField({
      name: "marginStatus",
      label: "Profit Health Status",
      options: [
        { label: "Healthy (>30%)", value: "healthy" },
        { label: "At Risk (10–30%)", value: "atRisk" },
        { label: "Losing Money (<10%)", value: "lossMaking" },
      ],
      defaultValue: "healthy",
      required: true,
    }),
    defineSelectField({
      name: "status",
      label: "Production State",
      options: [
        { label: "Quoted", value: "quoted" },
        { label: "In Production", value: "inProduction" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
      defaultValue: "quoted",
      required: true,
    }),
    defineSelectField({
      name: "sourceChannel",
      label: "Intake Source",
      options: [
        { label: "Web Chat", value: "webChat" },
        { label: "Telegram Bot", value: "telegram" },
        { label: "Manual Quick-Log", value: "manual" },
      ],
      defaultValue: "webChat",
      required: true,
    }),
  ],
});
