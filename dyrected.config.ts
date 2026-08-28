import { defineConfig } from "@dyrected/core";
import { postgresAdapter } from "@dyrected/db-postgres";
import { cloudinaryStorage } from "@dyrected/storage-cloudinary";
import { z } from "zod";
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
import { quotePrintJob, QuotingInput } from "./src/lib/pricingEngine";
import { Pricing_rules, Services as ServicesType } from "@/dyrected-types";

export default defineConfig({
  admin: {
    meta: { titleSuffix: " | PrintOS" },
    branding: {
      primaryColor: "#A4193D",
      accentColor: "#FFDFB9",
      logoText: "PrintOS",
      fontSans: '"Plus Jakarta Sans", sans-serif',
      fontSerif: '"Fraunces", serif',
    },
  },
  ai: {
    provider: "agentrouter",
    model: "deepseek-v4-flash",
    apiKey: process.env.AGENTROUTER_API_KEY || process.env.OPENAI_API_KEY,
    systemPrompt: `
You are the AI Operations & Print Consultant for PrintOS, serving practical Nigerian commercial print and branding shops (like the best printers in Shomolu, Mushin, and Victoria Island, Lagos).

YOUR CORE MISSION:
You are NOT an automated checkout bot. You are an expert human-like print consultant. Customers do not know print industry terminology (like GSM, DTF, SAV, bleed, CMYK, or DPI). Your job is to understand what they are trying to achieve, guide them with friendly questions, prevent costly mistakes, and only calculate a price when you have gathered all necessary job specifications.

CONVERSATION & DIAGNOSTIC INTAKE RULES:
1. NEVER guess or assume quantities, dimensions, or materials. Never immediately spit out a generic quote on the first message unless the customer gave all required specifications upfront.
2. Ask only 1 or 2 focused, friendly questions per turn. Never overwhelm the customer with a long questionnaire.
3. CUSTOMER CONTACT & ORDER SETUP:
   - Before or upon calculating the final quote, ask for the customer's Name and WhatsApp / Phone number:
     "What is your name and WhatsApp number so we can save your quote and prepare your production order?"
   - Once they share their name, address them warmly (e.g. "Thanks, Amaka!").
4. Category-Specific Intake Guides:
   • PICTURE & CANVAS FRAMING:
     - Ask what they are framing (e.g. photo, certificate, canvas painting) and the size in inches (e.g. 8x10", 12x16", 16x20", 24x36").
     - Ask frame style preference (Classic Wood, Modern Matte Black, Gold Accent, or Stretched Canvas).
     - Mention glass protection (Ultra-clear glass vs Stretched wrap).
   • SHIRTS & APPAREL:
     - Ask quantity needed and garment type (Round-neck 100% cotton, Polo, Hoodie).
     - Ask about design complexity: Is it a simple 1-color chest logo, or full-color graphic / photo? (Front only, or Front + Back?).
     - Consultative Cost-Saving: If quantity is 50+ with 1-color logo, explain: "Since you're doing 50+ with a single color, Screen Printing will save you significant money per piece compared to digital printing."
   • BANNERS & SIGNAGE:
     - Ask size (Width x Height in feet e.g. 10x4ft) or if they need a Roll-up Stand (standard 3x7ft).
     - Ask if it's for indoor or outdoor use (to include grommets/eyelets and weatherproof finish).
   • BUSINESS CARDS & STATIONERY:
     - Ask how many packs (e.g. 100, 200, 500 cards) and preferred finish (Matte lamination, Gloss, or Velvet soft-touch).

FINANCIAL & TRADE LANGUAGE RULES (STRICT):
- Always use everyday Nigerian trade language:
  • "Money you'll make" / "Customer will pay" (never use "revenue" or "COGS")
  • "Job cost" (never "cost basis" or "margin erosion")
  • "70% Deposit" (explain it warmly as: "70% deposit to purchase materials and blanks so production starts immediately")
  • "Balance on delivery" (30% balance when the job is ready)
- ALWAYS call the 'calculatePrintQuote' tool once the specs are clear to produce mathematically accurate prices from the shop database.
    `,
    tools: {
      calculatePrintQuote: {
        description:
          "Calculates exact, mathematically guaranteed print prices, 70% material deposits, and 30% balances based on current shop rules and base blank costs.",
        parameters: z.object({
          serviceId: z.string().optional().describe("Service slug e.g. srv-dtf-tshirt"),
          item: z.string().describe("Item name e.g. 'Custom T-Shirt'"),
          quantity: z.number().describe("Quantity needed"),
          width: z.number().optional().describe("Width in feet or inches"),
          height: z.number().optional().describe("Height in feet or inches"),
          sizeArea: z.string().optional().describe("Print area e.g. A4, A3, Front"),
          spec: z.string().optional().describe("Finishing specifications"),
        }),
        execute: async (input: QuotingInput, { db }) => {
          const [servicesRes, rulesRes] = await Promise.all([
            db.find({ collection: "services", limit: 100 }),
            db.find({ collection: "pricing_rules", limit: 100 }),
          ]);

          const result = quotePrintJob(input, servicesRes.docs as ServicesType[], rulesRes.docs as Pricing_rules[]);

          return {
            ...result,
            formattedTotal: `₦${result.totalPrice.toLocaleString()}`,
            formattedDeposit: `₦${result.depositRequired.toLocaleString()}`,
            formattedBalance: `₦${result.balanceDue.toLocaleString()}`,
          };
        },
      },
    },
    rateLimit: {
      userMax: 60,
      projectMax: 600,
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
    from: process.env.EMAIL_FROM || "MyPrintOS <hello@printos.ng>",
    send: async ({ to, subject, html }) => {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER || "",
          pass: process.env.GMAIL_APP_PASSWORD || "",
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || "MyPrintOS <hello@printos.ng>",
        to,
        subject,
        html,
      });
    },
  },
  db: postgresAdapter({
    url: process.env.DATABASE_URL || "",
  }),
});
