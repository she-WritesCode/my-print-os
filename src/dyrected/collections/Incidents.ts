import {
  defineCollection,
  defineNumberField,
  defineRelationshipField,
  defineSelectField,
  defineTextField,
  defineView,
} from "@dyrected/core";

export const Incidents = defineCollection({
  slug: "incidents",
  labels: {
    singular: "Profit Incident",
    plural: "Profit Incidents",
  },
  admin: {
    useAsTitle: "reason",
    icon: "ShieldAlert",
    group: "Profit Guardian & Risk",
    defaultColumns: ["type", "financialImpact", "urgencyScore", "status", "printJob"],
  },
  access: {
    read: { policy: "isStaff" },
    create: { policy: "isStaff" },
    update: { policy: "isStaff" },
    delete: { policy: "isAdminOrOwner" },
  },
  views: [
    defineView({
      slug: "incidents-urgent-queue",
      label: "Urgent Risk Queue",
      icon: "Flame",
      layout: "table",
      filter: { status: { equals: "open" } },
      sort: { field: "urgencyScore", direction: "desc" },
      columns: ["type", "reason", "financialImpact", "urgencyScore", "status", "printJob"],
      metrics: [
        { label: "Open Risk Alerts", aggregate: { count: "*", where: { status: { equals: "open" } } } },
        { label: "Resolved Incidents", aggregate: { count: "*", where: { status: { equals: "resolved" } } } },
      ],
    }),
    defineView({
      slug: "incidents-history",
      label: "All Incidents Log",
      icon: "History",
      layout: "table",
      columns: ["type", "reason", "financialImpact", "suggestedAction", "status", "printJob"],
    }),
  ],
  fields: [
    defineRelationshipField({
      name: "printJob",
      label: "Affected Print Job",
      relationTo: "print_jobs",
      required: false,
    }),
    defineRelationshipField({
      name: "order",
      label: "Affected Order",
      relationTo: "orders",
      required: false,
    }),
    defineSelectField({
      name: "type",
      label: "Risk Event Type",
      options: [
        { label: "Underquoted Job", value: "underquote" },
        { label: "Material Price Spike", value: "materialPriceSpike" },
        { label: "Customer Reprint / Waste", value: "reprint" },
        { label: "Customer Still Owes (Overdue)", value: "overdueBalance" },
      ],
      required: true,
    }),
    defineNumberField({
      name: "financialImpact",
      label: "Money at Risk (₦)",
      required: true,
      defaultValue: 0,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineNumberField({
      name: "urgencyScore",
      label: "Urgency Score (Impact / Time Remaining)",
      required: false,
      defaultValue: 0,
    }),
    defineTextField({
      name: "reason",
      label: "Why this happened (Plain English)",
      required: true,
    }),
    defineTextField({
      name: "recommendedAction",
      label: "Recommended Action to Take",
      required: false,
    }),
    defineTextField({
      name: "draftedMessage",
      label: "Pre-Drafted Message to Send",
      required: false,
    }),
    defineSelectField({
      name: "status",
      label: "Resolution Status",
      options: [
        { label: "Open Alert (Action Needed)", value: "open" },
        { label: "Resolved", value: "resolved" },
      ],
      defaultValue: "open",
      required: true,
    }),
    defineTextField({
      name: "resolutionNote",
      label: "How it was resolved",
      required: false,
    }),
  ],
});
