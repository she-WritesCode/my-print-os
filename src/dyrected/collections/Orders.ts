import {
  defineCollection,
  defineDateField,
  defineNumberField,
  defineRelationshipField,
  defineSelectField,
  defineTextField,
  defineView,
} from "@dyrected/core";

export const Orders = defineCollection({
  slug: "orders",
  labels: {
    singular: "Customer Order",
    plural: "Orders & Quotes",
  },
  admin: {
    useAsTitle: "orderNumber",
    icon: "ShoppingCart",
    group: "Orders & Customers",
    defaultColumns: ["orderNumber", "customerName", "subtotal", "depositPaid", "balanceDue", "paymentStatus", "status"],
  },
  views: [
    defineView({
      slug: "orders-payment-ledger",
      label: "Payment & Balance Ledger",
      icon: "CreditCard",
      layout: "table",
      columns: [
        "orderNumber",
        "customerName",
        "subtotal",
        "depositPaid",
        "balanceDue",
        "paymentStatus",
        "status",
        "balanceDueDate",
      ],
      metrics: [
        { label: "Total Orders", aggregate: { count: "*" } },
        {
          label: "Deposits Secured (70%)",
          aggregate: { count: "*", where: { paymentStatus: { equals: "depositPaid" } } },
        },
        { label: "Overdue Balances", aggregate: { count: "*", where: { paymentStatus: { equals: "overdue" } } } },
      ],
    }),
    defineView({
      slug: "orders-due-calendar",
      label: "Balance Due Schedule",
      icon: "Calendar",
      layout: "calendar",
      dateField: "balanceDueDate",
      columns: ["orderNumber", "customerName", "balanceDue", "paymentStatus"],
    }),
  ],
  fields: [
    defineTextField({
      name: "orderNumber",
      label: "Reference",
      admin: { description: "(e.g. ORD-2026-0042)" },
      required: true,
      unique: true,
    }),
    defineRelationshipField({
      name: "customer",
      label: "Customer",
      relationTo: "customers",
      required: false,
    }),
    defineRelationshipField({
      name: "assets",
      label: "Artworks",
      relationTo: "assets",
      hasMany: true,
      required: false,
    }),
    defineRelationshipField({
      name: "conversation",
      label: "Originating Chat",
      relationTo: "conversations",
      required: false,
    }),
    defineTextField({
      name: "customerName",
      label: "Customer Name",
      required: true,
    }),
    defineTextField({
      name: "customerContact",
      label: "Customer Phone / Handle",
      required: false,
    }),
    defineNumberField({
      name: "subtotal",
      label: "Total Quoted (Money you'll make) (₦)",
      required: false,
      defaultValue: 0,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineNumberField({
      name: "depositRequired",
      label: "Deposit Required (70%) (₦)",
      required: false,
      defaultValue: 0,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineNumberField({
      name: "depositPaid",
      label: "Deposit Collected so far (₦)",
      required: false,
      defaultValue: 0,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineNumberField({
      name: "balanceDue",
      label: "Customer Still Owes (₦)",
      required: false,
      defaultValue: 0,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineDateField({
      name: "balanceDueDate",
      label: "Balance Due Date",
      required: false,
      admin: {
        format: { type: "date", dateStyle: "medium" },
      },
    }),
    defineSelectField({
      name: "paymentStatus",
      label: "Payment Status",
      options: [
        { label: "Unpaid", value: "unpaid" },
        { label: "Deposit Paid (In Production)", value: "depositPaid" },
        { label: "Fully Paid", value: "fullyPaid" },
        { label: "Overdue Balance", value: "overdue" },
      ],
      defaultValue: "unpaid",
      required: true,
    }),
    defineSelectField({
      name: "status",
      label: "Fulfillment Status",
      options: [
        { label: "Draft Quote", value: "draftQuote" },
        { label: "Quote Sent to Customer", value: "quoteSent" },
        { label: "Confirmed & Scheduled", value: "confirmed" },
        { label: "In Production", value: "inProduction" },
        { label: "Completed & Ready", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
      defaultValue: "draftQuote",
      required: true,
    }),
  ],
});
