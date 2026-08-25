import { defineCollection, defineNumberField, defineTextField, defineView } from "@dyrected/core";

export const Customers = defineCollection({
  slug: "customers",
  labels: {
    singular: "Customer",
    plural: "Customers",
  },
  admin: {
    useAsTitle: "name",
    icon: "Users",
    group: "Orders & Customers",
    defaultColumns: ["name", "phone", "company", "totalSpent", "outstandingDebt"],
  },
  views: [
    defineView({
      slug: "all-customers",
      label: "Client Directory & Debt",
      icon: "Users",
      layout: "table",
      columns: ["name", "phone", "company", "totalSpent", "outstandingDebt"],
      metrics: [
        { label: "Total Registered Clients", aggregate: { count: "*" } },
        { label: "Clients Owing Balance", aggregate: { count: "*", where: { outstandingDebt: { greaterThan: 0 } } } },
      ],
    }),
  ],
  fields: [
    defineTextField({
      name: "name",
      label: "Customer Full Name",
      required: true,
    }),
    defineTextField({
      name: "phone",
      label: "Phone Number (WhatsApp / Primary ID)",
      required: true,
    }),
    defineTextField({
      name: "email",
      label: "Email Address",
      required: false,
    }),
    defineTextField({
      name: "company",
      label: "Company / Brand Name",
      required: false,
    }),
    defineTextField({
      name: "telegramHandle",
      label: "Telegram Username / Handle",
      required: false,
    }),
    defineNumberField({
      name: "totalSpent",
      label: "Total Money Paid to Shop (₦)",
      required: false,
      defaultValue: 0,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineNumberField({
      name: "outstandingDebt",
      label: "Customer Still Owes (Total Debt) (₦)",
      required: false,
      defaultValue: 0,
      admin: {
        format: { type: "currency", currency: "NGN", locale: "en-NG" },
      },
    }),
    defineTextField({
      name: "notes",
      label: "Customer Preferences / Notes",
      required: false,
    }),
  ],
});
