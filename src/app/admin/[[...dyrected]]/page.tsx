"use client";

import dynamic from "next/dynamic";
import "@dyrected/admin/styles";
import "../admin-branding.css";
import { ProfitGuardianWidget } from "@/components/admin/ProfitGuardianWidget";

// Dynamically import DyrectedAdmin with SSR disabled for Next.js App Router client rendering
const DyrectedAdmin = dynamic(
  () => import("@dyrected/next/admin").then((mod) => mod.DyrectedAdmin),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#FAF7F2] dark:bg-[#120A0D] text-[#181113] dark:text-[#FBF6F0]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#A4193D] border-t-transparent" />
          <p className="text-sm font-medium tracking-wide text-[#A4193D] dark:text-[#FFDFB9]">
            Loading PrintOS Admin Panel...
          </p>
        </div>
      </div>
    ),
  }
);

export default function AdminPage() {
  return (
    <div id="dyrected-admin-wrapper" className="min-h-screen w-full bg-[#FAF7F2] dark:bg-[#120A0D]">
      <DyrectedAdmin
        baseUrl="/api/dyrected"
        components={{
          dashboard: {
            "profit-guardian": ProfitGuardianWidget,
          },
        }}
      />
    </div>
  );
}
