"use client";

import dynamic from "next/dynamic";
import "@dyrected/admin/styles";
import "../admin-branding.css";

// Dynamically import DyrectedAdmin with SSR disabled for Next.js App Router client rendering
const DyrectedAdmin = dynamic(
  () => import("@dyrected/next/admin").then((mod) => mod.DyrectedAdmin),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0B0E14] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#F59E0B] border-t-transparent" />
          <p className="text-sm font-medium tracking-wide text-amber-200/80">
            Loading Dyrected Admin Panel...
          </p>
        </div>
      </div>
    ),
  }
);

export default function AdminPage() {
  return (
    <div id="dyrected-admin-wrapper" className="min-h-screen w-full bg-[#0B0E14]">
      <DyrectedAdmin baseUrl="/api/dyrected" />
    </div>
  );
}
