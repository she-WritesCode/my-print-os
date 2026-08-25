import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dyrected Admin | PrintOS",
  description: "PrintOS Dyrected CMS Admin Control Panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="dyrected-admin-wrapper" className="min-h-screen w-full bg-[#0B0F19]">
      {children}
    </div>
  );
}
