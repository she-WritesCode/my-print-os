import { defineCollection, defineMultiSelectField, defineTextField } from "@dyrected/core";

export const Owners = defineCollection({
  slug: "admin",
  auth: true,
  labels: {
    singular: "Team Member",
    plural: "Shop Team",
  },
  admin: {
    useAsTitle: "name",
    icon: "UserCheck",
    group: "Settings & Access",
    defaultColumns: ["name", "email", "role"],
  },
  access: {
    read: { policy: "isAdminOrOwner" },
    create: { policy: "isAdminOrOwner" },
    update: { policy: "isAdminOrOwner" },
    delete: { policy: "isAdminOrOwner" },
  },
  fields: [
    defineTextField({
      name: "name",
      label: "Full Name",
      required: true,
    }),
    defineMultiSelectField({
      name: "roles",
      label: "Access Level / Role",
      options: [
        { label: "Shop Owner (Full Financial & System Access)", value: "owner" },
        { label: "Production Manager (Orders, Quotes & Operations)", value: "manager" },
        { label: "Press Operator (Production Floor & Job Status)", value: "operator" },
      ],
      defaultValue: ["owner"],
      required: true,
      access: {
        update: { policy: "isAdminOrOwner" },
      },
    }),
  ],
});
