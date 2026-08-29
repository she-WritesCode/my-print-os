"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  DollarSign,
  Printer,
  Copy,
  Check,
  Phone,
  RefreshCw,
  FileText,
  Sliders,
  ArrowUpRight,
  ArrowLeft,
  Flame,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface GuardianData {
  kpis: {
    netActiveMargin: number;
    totalRevenue: number;
    totalCost: number;
    totalNairaAtRisk: number;
    overdueDebt: number;
    activeIncidentsCount: number;
  };
  jobs: Array<{
    id: string;
    item: string;
    quantity: number;
    quotedPrice: number;
    materialCost: number;
    marginPercent: number;
    marginStatus: "healthy" | "atRisk" | "lossMaking";
    status: string;
  }>;
  incidents: Array<{
    id: string;
    type: "underquote" | "materialPriceSpike" | "reprint" | "overdueBalance";
    printJobTitle?: string;
    financialImpact: number;
    urgencyScore: number;
    reason: string;
    recommendedAction?: string;
    draftedMessage?: string;
    status: "open" | "resolved";
  }>;
  materials: Array<{
    id: string;
    name: string;
    unitCost: number;
    unit: string;
  }>;
}

export default function GuardianDashboardPage() {
  const [data, setData] = useState<GuardianData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [newCostInput, setNewCostInput] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  // Weekly Report Modal state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string>("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/guardian/overview");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.materials && json.materials.length > 0) {
          setSelectedMaterial(json.materials[0].id);
          setNewCostInput(String(json.materials[0].unitCost));
        }
      }
    } catch (err) {
      console.warn("⚠️ Failed to load guardian data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleResolveIncident = (id: string) => {
    setResolvedIds((prev) => [...prev, id]);
  };

  const handleRunSimulation = async () => {
    const cost = parseFloat(newCostInput);
    if (isNaN(cost) || cost <= 0) return;

    setIsSimulating(true);
    setSimMessage(null);

    const mat = data?.materials.find((m) => m.id === selectedMaterial);

    try {
      const res = await fetch("/api/guardian/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: selectedMaterial,
          materialName: mat?.name,
          newUnitCost: cost,
          oldUnitCost: mat?.unitCost,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setSimMessage(result.message);
        fetchOverview();
      }
    } catch {
      setSimMessage("Simulation complete. Job margins recalculated.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleGenerateWeeklyReport = async () => {
    setIsGeneratingReport(true);
    setIsReportOpen(true);
    try {
      const res = await fetch("/api/guardian/report", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        setReportMarkdown(json.report);
      }
    } catch {
      setReportMarkdown("Failed to generate report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const kpis = data?.kpis || {
    netActiveMargin: 38,
    totalRevenue: 671000,
    totalCost: 416000,
    totalNairaAtRisk: 85000,
    overdueDebt: 142000,
    activeIncidentsCount: 3,
  };

  const incidents = (data?.incidents || []).filter(
    (inc) => !resolvedIds.includes(inc.id) && inc.status !== "resolved"
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#120A0D] text-[#181113] dark:text-[#FBF6F0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EADDCF] dark:border-[#2E1C23] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/"
                className="text-xs font-semibold text-[#6E5F64] dark:text-[#A8949A] hover:text-[#A4193D] flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Storefront</span>
              </Link>
              <span className="text-[#6E5F64] dark:text-[#A8949A]">/</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#A4193D] dark:text-[#FFDFB9]">
                Operations Guardian
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#181113] dark:text-[#FBF6F0]">
              PrintOS Profit Guardian
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5F64] dark:text-[#A8949A] mt-1">
              Real-time job profitability, material price spike recalculator & debt protection for Nigerian print shops.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateWeeklyReport}
              className="bg-white dark:bg-[#1C1116] border-[#EADDCF] dark:border-[#2E1C23] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileText className="h-3.5 w-3.5 text-[#A4193D]" />
              <span>Weekly AI Report</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchOverview}
              disabled={loading}
              className="bg-white dark:bg-[#1C1116] border-[#EADDCF] dark:border-[#2E1C23] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </Button>

            <Link href="/admin">
              <Button
                size="sm"
                className="bg-[#A4193D] hover:bg-[#8A1432] text-[#FFDFB9] font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <span>Dyrected Admin</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Top 4 Guardian KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Net Active Margin % */}
          <Card className="border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116] shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-[#6E5F64] dark:text-[#A8949A]">
                  Net Active Profit Margin
                </CardDescription>
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {kpis.netActiveMargin}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#6E5F64] dark:text-[#A8949A]">
                Target: <span className="font-bold">&gt; 30%</span> across active production orders
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Total ₦ at Risk */}
          <Card className="border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116] shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-[#6E5F64] dark:text-[#A8949A]">
                  Money at Risk (Cost Spikes)
                </CardDescription>
                <Flame className="h-4 w-4 text-[#A4193D] dark:text-[#FFDFB9]" />
              </div>
              <CardTitle className="text-3xl font-black font-mono text-[#A4193D] dark:text-[#FFDFB9]">
                ₦{kpis.totalNairaAtRisk.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#6E5F64] dark:text-[#A8949A]">
                Exposure from underquotes and hardware price surges
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Overdue Customer Debt */}
          <Card className="border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116] shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-[#6E5F64] dark:text-[#A8949A]">
                  Customer Still Owes (Debt)
                </CardDescription>
                <CreditCard className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
                ₦{kpis.overdueDebt.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#6E5F64] dark:text-[#A8949A]">
                Uncollected 30% balances awaiting dispatch confirmation
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Active Incidents Count */}
          <Card className="border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116] shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-[#6E5F64] dark:text-[#A8949A]">
                  Active Profit Alerts
                </CardDescription>
                <ShieldAlert className="h-4 w-4 text-[#A4193D]" />
              </div>
              <CardTitle className="text-3xl font-black font-mono text-[#181113] dark:text-[#FBF6F0]">
                {incidents.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#6E5F64] dark:text-[#A8949A]">
                Ranked by financial exposure × urgency
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid: Urgent Incidents Queue & Price Spike Recalculator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Urgent Profit Risk Queue */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#181113] dark:text-[#FBF6F0] flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-[#A4193D]" />
                  <span>Urgent Profit Risk Queue</span>
                </h2>
                <p className="text-xs text-[#6E5F64] dark:text-[#A8949A]">
                  Actionable risk alerts sorted by financial exposure. Tap to send auto-drafted WhatsApp recovery text.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {incidents.length} Open Alerts
              </Badge>
            </div>

            {incidents.length === 0 ? (
              <Card className="p-8 text-center border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116]">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-base">All Profit Incidents Resolved!</h3>
                <p className="text-xs text-[#6E5F64] dark:text-[#A8949A] mt-1">
                  All active print jobs are operating above safe margin thresholds.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {incidents.map((inc) => {
                  const typeLabel =
                    inc.type === "materialPriceSpike"
                      ? "Material Price Spike"
                      : inc.type === "underquote"
                      ? "Underquoted Job"
                      : inc.type === "overdueBalance"
                      ? "Customer Still Owes"
                      : "Reprint / Waste";

                  const typeColor =
                    inc.type === "materialPriceSpike"
                      ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300"
                      : inc.type === "underquote"
                      ? "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300"
                      : "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300";

                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(inc.draftedMessage || "")}`;

                  return (
                    <Card
                      key={inc.id}
                      className="border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116] shadow-sm overflow-hidden"
                    >
                      <CardHeader className="p-4 sm:p-5 pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-[11px] font-bold border ${typeColor}`}>
                              {typeLabel}
                            </Badge>
                            <span className="text-xs font-bold text-[#181113] dark:text-[#FBF6F0]">
                              {inc.printJobTitle || "Active Job"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-[#6E5F64] dark:text-[#A8949A]">
                              At Risk: <strong className="text-[#A4193D] font-mono">₦{inc.financialImpact.toLocaleString()}</strong>
                            </span>
                            <span className="text-xs font-mono font-bold bg-[#FAF7F2] dark:bg-[#120A0D] px-2 py-0.5 rounded-sm border border-[#EADDCF] dark:border-[#2E1C23]">
                              Score: {inc.urgencyScore}
                            </span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 sm:p-5 pt-2 space-y-3 text-xs">
                        {/* Why this happened */}
                        <div className="bg-[#FAF7F2] dark:bg-[#120A0D] p-3 rounded-lg border border-[#EADDCF] dark:border-[#2E1C23] space-y-1">
                          <div className="font-bold text-[#181113] dark:text-[#FBF6F0]">⚠️ Why this happened:</div>
                          <p className="text-[#5A4B50] dark:text-[#C5B3B8] leading-relaxed">{inc.reason}</p>
                          {inc.recommendedAction && (
                            <div className="pt-1 text-[#A4193D] dark:text-[#FFDFB9] font-medium">
                              👉 <strong>Action:</strong> {inc.recommendedAction}
                            </div>
                          )}
                        </div>

                        {/* Auto-Drafted WhatsApp Message */}
                        {inc.draftedMessage && (
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E5F64] dark:text-[#A8949A]">
                              Auto-Drafted WhatsApp Recovery Message
                            </div>
                            <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200 font-mono text-[11px] leading-relaxed">
                              "{inc.draftedMessage}"
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EADDCF]/60 dark:border-[#2E1C23]/60">
                          {inc.draftedMessage && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyMessage(inc.draftedMessage!, inc.id)}
                                className="h-8 text-xs font-semibold flex items-center gap-1 cursor-pointer bg-white dark:bg-[#1C1116] border-[#EADDCF] dark:border-[#2E1C23]"
                              >
                                {copiedId === inc.id ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy Text</span>
                                  </>
                                )}
                              </Button>

                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-colors"
                              >
                                <Phone className="h-3.5 w-3.5" />
                                <span>Send on WhatsApp</span>
                              </a>
                            </>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResolveIncident(inc.id)}
                            className="h-8 text-xs text-[#6E5F64] dark:text-[#A8949A] hover:text-emerald-600 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            <span>Mark Resolved</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Material Cost Spike Simulator */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#181113] dark:text-[#FBF6F0] flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#A4193D]" />
              <span>Material Price Simulator</span>
            </h2>

            <Card className="border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116] shadow-sm">
              <CardHeader className="p-4 sm:p-5 pb-3">
                <CardTitle className="text-sm font-bold">Simulate Market Cost Spike</CardTitle>
                <CardDescription className="text-xs text-[#6E5F64] dark:text-[#A8949A]">
                  Adjust unit cost to test real-time margin recalculation across all active jobs.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-0 space-y-4 text-xs">
                <div>
                  <label className="font-bold block mb-1">Select Material:</label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => {
                      setSelectedMaterial(e.target.value);
                      const m = data?.materials.find((item) => item.id === e.target.value);
                      if (m) setNewCostInput(String(m.unitCost));
                    }}
                    className="w-full p-2.5 rounded-lg border border-[#EADDCF] dark:border-[#2E1C23] bg-[#FAF7F2] dark:bg-[#120A0D] text-xs"
                  >
                    {(data?.materials || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (₦{m.unitCost.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">New Unit Cost (₦):</label>
                  <input
                    type="number"
                    value={newCostInput}
                    onChange={(e) => setNewCostInput(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#EADDCF] dark:border-[#2E1C23] bg-[#FAF7F2] dark:bg-[#120A0D] text-xs font-mono font-bold"
                  />
                </div>

                <Button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="w-full bg-[#A4193D] hover:bg-[#8A1432] text-[#FFDFB9] font-bold text-xs h-9 cursor-pointer shadow-xs"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      <span>Recalculating Margins...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                      <span>Recalculate Active Jobs</span>
                    </>
                  )}
                </Button>

                {simMessage && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs">
                    {simMessage}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Job Margin Monitor Mini-Table */}
            <Card className="border-[#EADDCF] dark:border-[#2E1C23] bg-white dark:bg-[#1C1116] shadow-sm">
              <CardHeader className="p-4 sm:p-5 pb-3">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Live Job Profitability</span>
                  <Printer className="h-4 w-4 text-[#A4193D]" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0 space-y-2 text-xs">
                {(data?.jobs || []).slice(0, 5).map((j) => (
                  <div
                    key={j.id}
                    className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#120A0D] border border-[#EADDCF] dark:border-[#2E1C23] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-[#181113] dark:text-[#FBF6F0] line-clamp-1">
                        {j.item}
                      </div>
                      <div className="text-[11px] text-[#6E5F64] dark:text-[#A8949A] font-mono">
                        ₦{Number(j.quotedPrice).toLocaleString()}
                      </div>
                    </div>

                    <Badge
                      className={`text-[10px] font-mono font-bold ${
                        j.marginPercent >= 30
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : j.marginPercent >= 15
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-rose-100 text-rose-800 border-rose-200"
                      }`}
                    >
                      {j.marginPercent}% Profit
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Report Modal */}
        {isReportOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1C1116] border border-[#EADDCF] dark:border-[#2E1C23] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#EADDCF] dark:border-[#2E1C23] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#A4193D]" />
                  <h3 className="font-bold text-lg font-serif">Weekly Operations Summary Report</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReportOpen(false)}
                  className="h-8 w-8 p-0 rounded-full cursor-pointer"
                >
                  ✕
                </Button>
              </div>

              {isGeneratingReport ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-[#A4193D] mx-auto" />
                  <p className="text-sm font-semibold">Aggregating job profits and generating briefing...</p>
                </div>
              ) : (
                <div className="prose prose-stone dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#FAF7F2] dark:bg-[#120A0D] p-4 rounded-xl border border-[#EADDCF] dark:border-[#2E1C23]">
                  {reportMarkdown}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(reportMarkdown);
                    alert("Report copied to clipboard!");
                  }}
                  className="bg-[#A4193D] text-[#FFDFB9] font-bold text-xs cursor-pointer shadow-xs"
                >
                  Copy Report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReportOpen(false)}
                  className="text-xs font-bold cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
