import {
  defineCollection,
  defineDateTimeField,
  defineRelationshipField,
  defineSelectField,
  defineTextField,
} from "@dyrected/core";

export const Messages = defineCollection({
  slug: "messages",
  labels: {
    singular: "Chat Message",
    plural: "Chat Messages Log",
  },
  admin: {
    useAsTitle: "content",
    icon: "Send",
    group: "Orders & Customers",
    defaultColumns: ["role", "content", "timestamp", "conversation"],
    hidden: true,
  },
  fields: [
    defineRelationshipField({
      name: "conversation",
      label: "Linked Chat Session",
      relationTo: "conversations",
      required: true,
    }),
    defineSelectField({
      name: "role",
      label: "Message Sender",
      options: [
        { label: "Customer", value: "customer" },
        { label: "AI Assistant", value: "assistant" },
        { label: "Shop Owner", value: "owner" },
      ],
      required: true,
    }),
    defineTextField({
      name: "content",
      label: "Message Content",
      required: true,
    }),
    defineDateTimeField({
      name: "timestamp",
      label: "Sent At",
      required: false,
    }),
  ],
});
