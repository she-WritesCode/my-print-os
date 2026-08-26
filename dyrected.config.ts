import { defineConfig } from "@dyrected/core";
import { postgresAdapter } from "@dyrected/db-postgres";
import { cloudinaryStorage } from "@dyrected/storage-cloudinary";
import { Customers } from "./src/dyrected/collections/Customers";
import { Assets } from "./src/dyrected/collections/Assets";
import { Conversations } from "./src/dyrected/collections/Conversations";
import { Orders } from "./src/dyrected/collections/Orders";
import { PrintJobs } from "./src/dyrected/collections/PrintJobs";
import { Services } from "./src/dyrected/collections/Services";
import { PricingRules } from "./src/dyrected/collections/PricingRules";
import { Materials } from "./src/dyrected/collections/Materials";
import { Incidents } from "./src/dyrected/collections/Incidents";
import { Messages } from "./src/dyrected/collections/Messages";
import { Owners } from "./src/dyrected/collections/Owners";
import { Media } from "./src/dyrected/collections/Media";
import { ShopSettings } from "./src/dyrected/globals/ShopSettings";

export default defineConfig({
  admin: {
    meta: { titleSuffix: " | PrintOS" },
    branding: {
      // primaryColor: "#A4193D",
      // accentColor: "#FFDFB9",
      logoText: "PrintOS",
      fontSans: '"Plus Jakarta Sans", sans-serif',
      fontSerif: '"Fraunces", serif',
    },
  },
  accessPolicies: {
    isAdminOrOwner: "user != null",
    isManagerOrOwner: "user != null",
    isStaff: "user != null",
    isAuthenticated: "user != null",
    isPublic: "true",
  },
  collections: [
    Assets,
    Orders,
    PrintJobs,
    Customers,
    Conversations,
    Services,
    PricingRules,
    Materials,
    Incidents,
    Messages,
    Owners,
    Media,
  ],
  globals: [ShopSettings],
  storage: cloudinaryStorage({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "print-os",
    apiKey: process.env.CLOUDINARY_API_KEY || "print-os-key",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "print-os-secret",
    folder: "print-os",
  }),
  email: {
    from: process.env.EMAIL_FROM || "MyPrintOS <dyrectedcms@gmail.com>",
    send: async ({ to, subject, html }) => {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER || "dyrectedcms@gmail.com",
          pass: process.env.GMAIL_APP_PASSWORD || "REDACTED_GMAIL_PASSWORD",
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || "MyPrintOS <dyrectedcms@gmail.com>",
        to,
        subject,
        html,
      });
    },
  },
  db: postgresAdapter({
    url: process.env.DATABASE_URL || "postgres://teylod:teylod_local@localhost:5432/print_os",
  }),
});
