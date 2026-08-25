import {
  defineCollection,
  defineRelationshipField,
  defineSelectField,
  defineTextField,
  defineTextareaField,
} from "@dyrected/core";

export const Assets = defineCollection({
  slug: "assets",
  labels: {
    singular: "File / Artwork",
    plural: "Assets & Artwork",
  },
  admin: {
    useAsTitle: "title",
    icon: "FileImage",
    group: "Orders & Customers",
    defaultColumns: ["title", "customer", "assetType", "filename", "filesize", "createdAt"],
  },
  upload: {
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
      "application/postscript", // .ai, .eps
      "image/vnd.adobe.photoshop", // .psd
      "application/zip",
    ],
    maxFileSize: 50 * 1024 * 1024, // 50 MB
  },
  fields: [
    defineTextField({
      name: "title",
      label: "Asset Title / Description",
      required: true,
    }),
    defineRelationshipField({
      name: "customer",
      label: "Customer Owner",
      relationTo: "customers",
      required: false,
    }),
    defineRelationshipField({
      name: "orders",
      label: "Attached Orders",
      relationTo: "orders",
      hasMany: true,
      required: false,
    }),
    defineSelectField({
      name: "assetType",
      label: "Asset Category",
      options: [
        { label: "Customer Print Ready Artwork", value: "artwork" },
        { label: "Brand Logo / Vector", value: "logo" },
        { label: "Design Proof / Mockup", value: "proof" },
        { label: "Payment Proof / Receipt", value: "receipt" },
        { label: "Raw Design Asset (PSD/AI/ZIP)", value: "rawAsset" },
      ],
      defaultValue: "artwork",
      required: true,
    }),
    defineTextareaField({
      name: "printInstructions",
      label: "Customer / Operator Print Instructions",
      required: false,
    }),
  ],
});
