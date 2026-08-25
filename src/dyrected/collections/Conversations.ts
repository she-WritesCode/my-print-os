import {
  defineCollection,
  defineRelationshipField,
  defineSelectField,
  defineTextField,
  defineView,
} from "@dyrected/core";

export const Conversations = defineCollection({
  slug: "conversations",
  labels: {
    singular: "Customer Chat",
    plural: "Customer Chats",
  },
  admin: {
    useAsTitle: "customerName",
    icon: "MessagesSquare",
    group: "Orders & Customers",
    defaultColumns: ["customerName", "channel", "status", "customerContact"],
  },
  views: [
    defineView({
      slug: "all-conversations",
      label: "Customer Inquiries",
      icon: "MessagesSquare",
      layout: "table",
      columns: ["customerName", "channel", "status", "customerContact"],
      metrics: [
        { label: "Active Chats", aggregate: { count: "*", where: { status: { equals: "inProgress" } } } },
        { label: "Quotes Generated", aggregate: { count: "*", where: { status: { equals: "completed" } } } },
      ],
    }),
  ],
  fields: [
    defineRelationshipField({
      name: "customer",
      label: "Customer Record",
      relationTo: "customers",
      required: false,
    }),
    defineTextField({
      name: "customerName",
      label: "Customer Name",
      required: false,
    }),
    defineTextField({
      name: "customerContact",
      label: "Phone / Handle",
      required: false,
    }),
    defineSelectField({
      name: "channel",
      label: "Intake Channel",
      options: [
        { label: "Web Chat Widget", value: "webChat" },
        { label: "Telegram Bot", value: "telegram" },
        { label: "Manual Quick-Log", value: "manual" },
      ],
      defaultValue: "webChat",
      required: true,
    }),
    defineSelectField({
      name: "status",
      label: "Chat Status",
      options: [
        { label: "In Progress", value: "inProgress" },
        { label: "Quote Ready", value: "completed" },
        { label: "Abandoned", value: "abandoned" },
      ],
      defaultValue: "inProgress",
      required: true,
    }),
  ],
});
