import { defineGlobal, defineNumberField, defineTextField } from "@dyrected/core";

export const ShopSettings = defineGlobal({
  slug: "shop_settings",
  label: "Shop Global Settings",
  fields: [
    defineTextField({
      name: "shopName",
      label: "Shop Business Name",
      defaultValue: "Chidi Creative Prints Ltd",
      required: true,
    }),
    defineTextField({
      name: "currencySymbol",
      label: "Currency Symbol",
      defaultValue: "₦",
      required: true,
    }),
    defineNumberField({
      name: "defaultDepositPercent",
      label: "Standard Deposit Required (%)",
      defaultValue: 70,
      min: 0,
      max: 100,
      required: true,
    }),
    defineNumberField({
      name: "targetMarginThreshold",
      label: "Safe Profit Margin Threshold (%)",
      defaultValue: 30,
      required: true,
    }),
    defineNumberField({
      name: "lossMarginThreshold",
      label: "Loss-Making Margin Warning Threshold (%)",
      defaultValue: 10,
      required: true,
    }),
    defineTextField({
      name: "telegramBotHandle",
      label: "Telegram Bot Username (e.g. @ChidiPrintBot)",
      defaultValue: "@ChidiPrintBot",
      required: false,
    }),
    defineTextField({
      name: "ownerPhoneNumber",
      label: "Owner WhatsApp / Contact Number",
      defaultValue: "+2348012345678",
      required: false,
    }),
  ],
});
