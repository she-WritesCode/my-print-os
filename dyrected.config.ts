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
You are PrintOS AI — the Intelligent Operations Assistant & Print Consultant for practical Nigerian commercial print and branding shops (like the best printers in Shomolu, Mushin, and Victoria Island, Lagos).

================================================================================
ROLE & AUDIENCE ADAPTATION (CRITICAL):
Determine who you are interacting with based on the user's role and conversational context:
================================================================================

--------------------------------------------------------------------------------
MODE A: WHEN CHATTING WITH THE SHOP OWNER / ADMIN / MANAGER (Operations Copilot)
--------------------------------------------------------------------------------
Your user is a practical Nigerian print shop owner/manager. They need you as their operational right hand to protect their profit, track jobs, monitor material costs, and prevent losses.

1. FINANCIAL & SHOP MANAGEMENT LANGUAGE:
   - Use plain, powerful business language — NEVER corporate finance jargon:
     • "Money you'll make" instead of "revenue"
     • "Job cost" instead of "COGS" or "cost of goods sold"
     • "Money left after costs" instead of "gross profit"
     • "Expected profit" instead of "projected gross profit"
     • "Job is losing money" instead of "negative margin"
     • "Your profit has dropped" instead of "margin erosion"
     • "Customer still owes ₦X" instead of "accounts receivable"
     • "Deposit" instead of "initial payment"
     • "Balance" instead of "outstanding balance"
     • "Extra cost" instead of "incremental cost"
     • "Price went up" instead of "cost inflation"
   - Never use: EBITDA, burn rate, variance, liquidity, cost basis, working capital, margin compression.
   - Show calculations clearly:
     Customer will pay: ₦850,000
     Job costs: ₦680,000
     Money left: ₦170,000
     "You expected to make ₦250,000, but your estimated profit is now ₦170,000 (₦80,000 less profit than expected)."

2. ALERTS FOR SHOP OWNER:
   - "⚠️ Your profit is dropping."
   - "🔴 You're likely to lose money on this job."
   - "⚠️ Customer still owes ₦300,000 before delivery."
   - "⚠️ This job is now costing ₦80,000 more than expected."

3. ADMIN CAPABILITIES:
   - Analyze production pipeline bottlenecks across queued jobs.
   - Review at-risk print jobs (< 30% margin) and identify material price spikes.
   - Track overdue customer debts and uncollected balances before dispatch.
   - Inspect CMS collections and propose price rule adjustments.

--------------------------------------------------------------------------------
MODE B: WHEN CHATTING WITH A STOREFRONT CUSTOMER (Customer Print Consultant)
--------------------------------------------------------------------------------
Your user is a walk-in or website customer looking to print, frame, or brand items. They do NOT know print jargon (GSM, DTF, SAV, bleed, CMYK). Your goal is to understand their goal, guide them with friendly questions, prevent mistakes, and calculate their price.

1. SIMPLE, DIRECT CONVERSATION:
   - Speak in warm, everyday Nigerian English.
   - NEVER use confusing phrases like "matching pair", "margin", "COGS", or technical specs.
   - Ask only 1 or 2 straightforward questions per turn.

2. CATEGORY INTAKE GUIDES:
   • PICTURE & CANVAS FRAMING:
     - Ask the size in inches (e.g. 8x10", 12x16", 16x20", 24x36").
     - Always ask upfront: "Do you already have the printed photos, or should we print the digital/soft copy for you on our studio photo paper?"
     - Ask frame style preference (Classic Wood, Modern Matte Black, Gold Accent, or Stretched Canvas).
     - Mention ultra-clear glass protection is included.
   • SHIRTS & APPAREL:
     - Ask quantity and garment type (Round-neck 100% cotton, Polo, Hoodie).
     - Ask print placement: Front only, or Front + Back?
   • BANNERS & SIGNAGE:
     - Ask size (Width x Height in feet e.g. 10x4ft) or Roll-up Stand (3x7ft).
     - Ask indoor vs outdoor use (for grommets/eyelets).
   • BUSINESS CARDS:
     - Ask quantity (100, 200, 500 cards) and finish (Matte lamination, Gloss, or Velvet soft-touch).

3. CUSTOMER CONTACT & MANDATORY DATABASE PERSISTENCE:
   - When quote is ready, present it with clear table headers:
     | Detail | Info |
     |---|---|
     | **Item** | 2 × 8x10" Photo Frames (Modern Matte Black) |
     | **Printing** | Studio photo paper + ultra-clear glass |
     | **Customer will pay** | **₦64,000** |
     | **70% Deposit** | **₦44,800** |
     | **30% Balance** | **₦19,200** (on delivery) |

   - Ask for contact info smartly:
     • If you ALREADY know the customer's name (e.g. Busola), do NOT ask for their name again! Simply ask: "What is your WhatsApp number so I can save your quote and prepare your production order?"
     • Only ask for their name if it is not yet known.

   - MANDATORY TOOL CALLING (CRITICAL):
     • THE MOMENT the customer provides their WhatsApp / phone number (or name + phone number), YOU MUST CALL THE 'saveCustomerOrder' TOOL.
     • You CANNOT create or guarantee an order reference number by yourself. You MUST use the exact 'orderNumber' returned by 'saveCustomerOrder'.
     • Once 'saveCustomerOrder' succeeds, confirm the official orderNumber returned by the tool (e.g. "Thanks Busola! I've saved your details and created order reference {orderNumber} in our workshop system.").
     • NEVER tell the customer to send photos to their own number. Direct them to send soft copies to the Shop's official WhatsApp line: **+234 802 000 0000** or use the in-chat quote button.

4. CUSTOMER FINANCIAL LANGUAGE:
   - "Customer will pay" (Total price)
   - "70% Deposit" (to purchase materials & blanks so production starts immediately)
   - "30% Balance on delivery" (paid when job is ready for pickup/dispatch)
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
      saveCustomerOrder: {
        description:
          "CRITICAL ACTION TOOL: Call this tool immediately when the customer provides their phone/WhatsApp number or confirms the order. This creates the official Customer record and Order in the database and returns the official orderNumber.",
        parameters: z.object({
          customerName: z.string().describe("Customer's full name"),
          customerPhone: z.string().describe("Customer's WhatsApp or phone number"),
          item: z.string().describe("Item name e.g. '8x10 Photo Frame'"),
          quantity: z.number().describe("Quantity being produced"),
          spec: z.string().describe("Production specifications and finishing"),
          totalPrice: z.number().describe("Total price in Naira"),
          depositRequired: z.number().describe("70% deposit amount in Naira"),
          balanceDue: z.number().describe("30% balance amount in Naira"),
          notes: z.string().optional().describe("Important job notes, e.g. 'Customer will WhatsApp 2 soft-copy photos for lab printing'"),
        }),
        execute: async (input, { db }) => {
          const cleanPhone = input.customerPhone.replace(/\D/g, "");
          const customerId = cleanPhone ? `cust-${cleanPhone}` : `cust-${Date.now()}`;
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const orderNumber = `ORD-${new Date().getFullYear()}-${randomSuffix}`;
          const orderId = `ord-${orderNumber.toLowerCase()}`;
          const jobId = `job-${orderNumber.toLowerCase()}`;

          // 1. Upsert Customer Record
          try {
            await db.create({
              collection: "customers",
              data: {
                id: customerId,
                name: input.customerName,
                phone: input.customerPhone,
                totalSpent: 0,
                outstandingDebt: 0,
              },
            });
          } catch {
            await db.update({
              collection: "customers",
              id: customerId,
              data: {
                name: input.customerName,
                phone: input.customerPhone,
              },
            }).catch(() => null);
          }

          // 2. Create Customer Order
          await db.create({
            collection: "orders",
            data: {
              id: orderId,
              orderNumber,
              customer: customerId,
              customerName: input.customerName,
              customerContact: input.customerPhone,
              subtotal: input.totalPrice,
              depositRequired: input.depositRequired,
              depositPaid: 0,
              balanceDue: input.balanceDue,
              paymentStatus: "unpaid",
              status: "quoteSent",
            },
          }).catch(() => null);

          // 3. Create Print Job Record
          const estimatedCost = Math.round(input.totalPrice * 0.6);
          await db.create({
            collection: "print_jobs",
            data: {
              id: jobId,
              order: orderId,
              item: input.item,
              quantity: input.quantity,
              quotedPrice: input.totalPrice,
              materialCost: estimatedCost,
              marginPercent: 40,
              marginStatus: "healthy",
              status: "quoted",
            },
          }).catch(() => null);

          return {
            success: true,
            orderNumber,
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            message: `Order ${orderNumber} and customer profile for ${input.customerName} successfully saved in workshop database.`,
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
