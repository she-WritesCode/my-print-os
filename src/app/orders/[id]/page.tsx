import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import postgres from "postgres";
import {
  CheckCircle2,
  Clock,
  Printer,
  Truck,
  ArrowLeft,
  ShieldCheck,
  Phone,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/printos";

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerContact: string;
  customerEmail?: string;
  subtotal: number;
  depositRequired: number;
  depositPaid: number;
  balanceDue: number;
  paymentStatus: "unpaid" | "depositPaid" | "fullyPaid" | "overdue";
  status: "quoteSent" | "depositPaid" | "inProduction" | "readyForDelivery" | "delivered";
  notes?: string;
  createdAt?: string;
}

interface PrintJobData {
  id: string;
  item: string;
  quantity: number;
  spec?: string;
  quotedPrice: number;
}

async function getOrderDetails(paramId: string): Promise<{ order: OrderData; job?: PrintJobData } | null> {
  try {
    const sql = postgres(DATABASE_URL, { max: 1, timeout: 3, connect_timeout: 3, idle_timeout: 3 });

    // 1. Search by exact ID or orderNumber
    const orderRows = await sql`
      SELECT id, data FROM collection_orders
      WHERE id = ${paramId} 
         OR data->>'orderNumber' = ${paramId.toUpperCase()}
         OR data->>'orderNumber' = ${paramId}
         OR id = ${`ord_${paramId.toLowerCase()}`}
      LIMIT 1
    `;

    if (!orderRows || orderRows.length === 0) {
      await sql.end();
      return null;
    }

    const rawOrder = orderRows[0];
    const orderData: OrderData = {
      id: rawOrder.id,
      ...(rawOrder.data || {}),
    };

    // 2. Fetch linked print job if available
    const jobRows = await sql`
      SELECT id, data FROM collection_print_jobs
      WHERE data->>'order' = ${rawOrder.id}
         OR data->>'order' = ${orderData.orderNumber}
      LIMIT 1
    `;
    await sql.end();

    const jobData: PrintJobData | undefined =
      jobRows && jobRows.length > 0
        ? { id: jobRows[0].id, ...(jobRows[0].data || {}) }
        : undefined;

    return { order: orderData, job: jobData };
  } catch (err) {
    console.warn("⚠️ Database query failed in /orders/[id], using fallback preview:", err);
    // Fallback demo order if database is unreachable
    if (paramId.startsWith("ORD-") || paramId.startsWith("ord_") || paramId === "demo") {
      return {
        order: {
          id: paramId,
          orderNumber: paramId.startsWith("ORD-") ? paramId : "ORD-2026-4892",
          customerName: "Valued Customer",
          customerContact: "+234 802 000 0000",
          subtotal: 64000,
          depositRequired: 44800,
          depositPaid: 0,
          balanceDue: 19200,
          paymentStatus: "unpaid",
          status: "quoteSent",
          notes: "Soft-copy photos received for high-definition studio printing.",
          createdAt: new Date().toISOString(),
        },
        job: {
          id: "job-demo",
          item: "2 × 8x10\" Custom Photo Frames",
          quantity: 2,
          spec: "Classic Matte Black Frame with Crystal Glass Finishing",
          quotedPrice: 64000,
        },
      };
    }
    return null;
  }
}

export default async function OrderPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getOrderDetails(id);

  if (!result) {
    notFound();
  }

  const { order, job } = result;

  const steps = [
    { title: "Quote Prepared", icon: FileText, completed: true, current: order.status === "quoteSent" },
    {
      title: "70% Deposit Paid",
      icon: Clock,
      completed: order.depositPaid > 0 || order.paymentStatus === "depositPaid" || order.paymentStatus === "fullyPaid",
      current: order.status === "depositPaid",
    },
    {
      title: "In Production",
      icon: Printer,
      completed: ["inProduction", "readyForDelivery", "delivered"].includes(order.status),
      current: order.status === "inProduction",
    },
    {
      title: "Ready for Delivery",
      icon: Truck,
      completed: ["readyForDelivery", "delivered"].includes(order.status),
      current: order.status === "readyForDelivery",
    },
    {
      title: "Completed",
      icon: CheckCircle2,
      completed: order.status === "delivered" || order.paymentStatus === "fullyPaid",
      current: order.status === "delivered",
    },
  ];

  const whatsappMessage = encodeURIComponent(
    `Hello PrintOS! 🖨️✨ I am confirming payment for my Order #${order.orderNumber} (${job?.item || "Print Order"}). Total: ₦${order.subtotal?.toLocaleString()}`
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#120A0D] text-[#181113] dark:text-[#FBF6F0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6E5F64] dark:text-[#A8949A] hover:text-[#A4193D] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Storefront</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#6E5F64] dark:text-[#A8949A]">
              Ref: {order.orderNumber}
            </span>
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
            >
              Verified Workshop Quote
            </Badge>
          </div>
        </div>

        {/* Order Main Banner Card */}
        <Card className="border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116] shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#A4193D] text-[#FFDFB9] font-black text-xs flex items-center justify-center font-mono">
                    OS
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-bold font-serif text-[#181113] dark:text-[#FBF6F0]">
                    Print Order & Quote Summary
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-[#6E5F64] dark:text-[#A8949A] mt-1">
                  Issued by PrintOS Operations Engine • Shomolu Workshop Hub
                </CardDescription>
              </div>

              <div className="text-right">
                <div className="text-xs text-[#6E5F64] dark:text-[#A8949A]">Customer will pay:</div>
                <div className="text-2xl sm:text-3xl font-black text-[#A4193D] dark:text-[#FFDFB9] font-mono">
                  ₦{order.subtotal?.toLocaleString()}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Stepper Status Bar */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#120A0D] border border-[#EADDCF] dark:border-[#2E1C23]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#6E5F64] dark:text-[#A8949A] mb-3">
                Production & Payment Progress
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {steps.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center text-center p-2 rounded-lg border transition-all ${
                        s.current
                          ? "bg-white dark:bg-[#1C1116] border-[#A4193D] shadow-xs text-[#A4193D] dark:text-[#FFDFB9]"
                          : s.completed
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400"
                          : "border-transparent opacity-40 text-[#6E5F64] dark:text-[#A8949A]"
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-[11px] font-semibold leading-tight">{s.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid: Order Specifications & Financial Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Item Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#181113] dark:text-[#FBF6F0]">
                  Job Specifications
                </h4>
                <div className="p-4 rounded-xl border border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116] space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6E5F64] dark:text-[#A8949A]">Item</span>
                    <span className="font-bold text-[#181113] dark:text-[#FBF6F0]">
                      {job?.item || "Custom Print Order"}
                    </span>
                  </div>
                  <Separator className="bg-[#EADDCF]/60 dark:bg-[#2E1C23]/60" />
                  <div className="flex justify-between">
                    <span className="text-[#6E5F64] dark:text-[#A8949A]">Quantity</span>
                    <span className="font-semibold text-[#181113] dark:text-[#FBF6F0]">
                      {job?.quantity || 1} units / pieces
                    </span>
                  </div>
                  {job?.spec && (
                    <>
                      <Separator className="bg-[#EADDCF]/60 dark:bg-[#2E1C23]/60" />
                      <div>
                        <span className="text-xs text-[#6E5F64] dark:text-[#A8949A] block mb-1">
                          Finishing & Specs
                        </span>
                        <p className="text-xs font-mono bg-[#FAF7F2] dark:bg-[#120A0D] p-2 rounded-lg border border-[#EADDCF] dark:border-[#2E1C23]">
                          {job.spec}
                        </p>
                      </div>
                    </>
                  )}
                  {order.notes && (
                    <>
                      <Separator className="bg-[#EADDCF]/60 dark:bg-[#2E1C23]/60" />
                      <div>
                        <span className="text-xs text-[#6E5F64] dark:text-[#A8949A] block mb-1">
                          Production Notes
                        </span>
                        <p className="text-xs italic text-[#6E5F64] dark:text-[#A8949A]">
                          &ldquo;{order.notes}&rdquo;
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-[#EADDCF] dark:border-[#2E1C23] bg-[#FAF7F2] dark:bg-[#120A0D] text-xs space-y-1">
                  <div className="font-bold text-[#181113] dark:text-[#FBF6F0]">Customer Details</div>
                  <div>Name: <span className="font-medium">{order.customerName}</span></div>
                  <div>Phone / WhatsApp: <span className="font-medium">{order.customerContact}</span></div>
                  {order.customerEmail && <div>Email: <span className="font-medium">{order.customerEmail}</span></div>}
                </div>
              </div>

              {/* Nigerian Trade Payment Terms */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#181113] dark:text-[#FBF6F0]">
                  Payment Schedule
                </h4>
                <div className="p-4 rounded-xl border border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116] space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#181113] dark:text-[#FBF6F0]">70% Material Deposit</div>
                      <div className="text-xs text-[#6E5F64] dark:text-[#A8949A]">Required to start production</div>
                    </div>
                    <span className="font-bold text-base text-[#A4193D] dark:text-[#FFDFB9] font-mono">
                      ₦{order.depositRequired?.toLocaleString()}
                    </span>
                  </div>

                  <Separator className="bg-[#EADDCF]/60 dark:bg-[#2E1C23]/60" />

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#181113] dark:text-[#FBF6F0]">30% Balance</div>
                      <div className="text-xs text-[#6E5F64] dark:text-[#A8949A]">Payable on delivery / dispatch</div>
                    </div>
                    <span className="font-bold text-base text-[#181113] dark:text-[#FBF6F0] font-mono">
                      ₦{order.balanceDue?.toLocaleString()}
                    </span>
                  </div>

                  <Separator className="bg-[#EADDCF]/60 dark:bg-[#2E1C23]/60" />

                  <div className="pt-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#6E5F64] dark:text-[#A8949A] mb-2">
                      Direct Workshop Bank Transfer
                    </div>
                    <div className="bg-[#FAF7F2] dark:bg-[#120A0D] p-3 rounded-lg border border-[#EADDCF] dark:border-[#2E1C23] space-y-1 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#6E5F64] dark:text-[#A8949A]">Bank:</span>
                        <span className="font-bold text-[#181113] dark:text-[#FBF6F0]">Moniepoint MFB / GTBank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6E5F64] dark:text-[#A8949A]">Account Name:</span>
                        <span className="font-bold text-[#181113] dark:text-[#FBF6F0]">PrintOS Commercial Hub</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[#6E5F64] dark:text-[#A8949A]">Account No:</span>
                        <span className="font-black text-sm text-[#A4193D] dark:text-[#FFDFB9]">
                          8020000000
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Action Button */}
                <a
                  href={`https://wa.me/2348020000000?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-sm transition-all"
                >
                  <Phone className="h-4 w-4" />
                  <span>Confirm Deposit on WhatsApp</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Guarantee */}
        <div className="text-center text-xs text-[#6E5F64] dark:text-[#A8949A] space-y-1">
          <div className="flex items-center justify-center gap-1 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Guaranteed Print Quality & Transparent Workshop Costing</span>
          </div>
          <p>Questions about this quote? Call our shop line at +234 802 000 0000 or reply directly in the chat.</p>
        </div>
      </div>
    </div>
  );
}
