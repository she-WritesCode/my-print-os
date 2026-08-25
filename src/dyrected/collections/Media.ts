import { defineCollection, defineTextField, defineTextareaField } from "@dyrected/core";

export const Media = defineCollection({
  slug: "media",
  labels: {
    singular: "Media File",
    plural: "Storefront Media",
  },
  admin: {
    useAsTitle: "alt",
    icon: "Image",
    group: "Catalog & Pricing Engine",
    defaultColumns: ["alt", "caption", "filename", "filesize", "createdAt"],
  },
  upload: {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "application/pdf"],
    maxFileSize: 25 * 1024 * 1024, // 25 MB
  },
  fields: [
    defineTextField({
      name: "alt",
      label: "Alternative Text / Title",
      required: true,
    }),
    defineTextareaField({
      name: "caption",
      label: "Caption / Usage Notes",
      required: false,
    }),
  ],
});
