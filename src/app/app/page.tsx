"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { vendors } from "@/data/vendors";
import { mockNews } from "@/data/news";
import {
  complianceFrameworkTemplates,
  eolProducts,
  vendorPatchSchedules,
  cveAlerts,
} from "@/data/compliance";
import type { ComplianceFramework } from "@/data/compliance";
import { NewsCard } from "@/components/NewsCard";
import {
  Search,
  Filter,
  SlidersHorizontal,
  AlertTriangle,
  Building2,
  ShieldCheck,
  FileWarning,
  Wrench,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  CheckSquare,
  Square,
  ExternalLink,
  AlertCircle,
  Calendar,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NewsSeverity, NewsType } from "@/data/news";

// ─── Compliance Panel ─────────────────────────────────────────────────────────

function CompliancePanel() {
  const {
    activeFrameworkIds,
    addFramework,
    removeFramework,
    toggleComplianceItem,
    isComplianceItemChecked,
  } = useApp();

  const [expandedFrameworks, setExpandedFrameworks] = useState<Set<string>>(new Set());
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);

  const activeFrameworks = activeFrameworkIds
    .map((id) => complianceFrameworkTemplates.find((f) => f.id === id))
    .filter((f): f is ComplianceFramework => f !== undefined);

  const availableToAdd = complianceFrameworkTemplates.filter(
    (f) => !activeFrameworkIds.includes(f.id)
  );

  function toggleExpand(id: string) {
    setExpandedFrameworks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function getFrameworkProgress(fw: ComplianceFramework) {
    const allItems = fw.sections.flatMap((s) => s.items);
    const checked = allItems.filter((item) => isComplianceItemChecked(fw.id, item.id)).length;
    return { checked, total: allItems.length };
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Compliance Checklists</h2>
        </div>

        {/* Add Framework dropdown */}
        <div className="relative">
          <button
            onClick={() => setAddDropdownOpen((o) => !o)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-muted transition-colors text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Framework
            <ChevronDown className={cn("h-3 w-3 transition-transform", addDropdownOpen && "rotate-180")} />
          </button>
          {addDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-lg border border-border bg-card shadow-lg py-1">
              {availableToAdd.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">All frameworks added</p>
              ) : (
                availableToAdd.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => {
                      addFramework(fw.id);
                      setAddDropdownOpen(false);
                      setExpandedFrameworks((prev) => new Set([...prev, fw.id]));
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                  >
                    <div className="font-medium">{fw.name}</div>
                    <div className="text-muted-foreground truncate">{fw.description}</div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {activeFrameworks.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          No frameworks added. Use the button above to add compliance frameworks relevant to this client.
        </p>
      ) : (
        <div className="space-y-2">
          {activeFrameworks.map((fw) => {
            const { checked, total } = getFrameworkProgress(fw);
            const isExpanded = expandedFrameworks.has(fw.id);
            const pct = total > 0 ? Math.round((checked / total) * 100) : 0;

            return (
              <div key={fw.id} className="border border-border rounded-lg overflow-hidden">
                {/* Framework header row */}
                <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30">
                  <button
                    onClick={() => toggleExpand(fw.id)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    <ChevronRight
                      className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isExpanded && "rotate-90")}
                    />
                    <span className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {fw.name}
                    </span>
                  </button>

                  {/* Progress pill */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-14 text-right">
                        {checked}/{total} items
                      </span>
                    </div>
                    <button
                      onClick={() => removeFramework(fw.id)}
                      className="p-1 rounded hover:bg-red-100 hover:text-red-600 text-muted-foreground transition-colors"
                      title="Remove framework"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded checklist */}
                {isExpanded && (
                  <div className="divide-y divide-border/50">
                    {fw.sections.map((section) => {
                      const sectionChecked = section.items.filter((item) =>
                        isComplianceItemChecked(fw.id, item.id)
                      ).length;
                      return (
                        <div key={section.id} className="px-3 py-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              {section.name}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {sectionChecked}/{section.items.length}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {section.items.map((item) => {
                              const checked = isComplianceItemChecked(fw.id, item.id);
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => toggleComplianceItem(fw.id, item.id)}
                                  className="flex items-start gap-2 w-full text-left group"
                                >
                                  {checked ? (
                                    <CheckSquare className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                  ) : (
                                    <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-foreground transition-colors" />
                                  )}
                                  <span
                                    className={cn(
                                      "text-xs leading-relaxed transition-colors",
                                      checked
                                        ? "text-muted-foreground line-through"
                                        : "text-foreground group-hover:text-foreground"
                                    )}
                                  >
                                    {item.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── EOL Tracker ─────────────────────────────────────────────────────────────

function EolTracker({ selectedVendorIds }: { selectedVendorIds: string[] }) {
  const { userEolItems } = useApp();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const allEolItems = [...eolProducts, ...userEolItems].filter((e) =>
    selectedVendorIds.includes(e.vendorId)
  );

  function toggleItem(id: string) {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <FileWarning className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">End-of-Life Tracker</h2>
      </div>

      {allEolItems.length === 0 ? (
        <p className="text-xs text-muted-foreground">No EOL items for your selected vendors.</p>
      ) : (
        <div className="space-y-2">
          {allEolItems.map((eol) => {
            const daysUntil = Math.ceil(
              (new Date(eol.eolDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            const isExpanded = expandedItems.has(eol.id);
            const vendor = vendors.find((v) => v.id === eol.vendorId);

            return (
              <div key={eol.id} className="border border-border rounded-lg overflow-hidden">
                {/* EOL item header */}
                <button
                  onClick={() => toggleItem(eol.id)}
                  className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ChevronDown
                      className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", !isExpanded && "-rotate-90")}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{eol.product}</span>
                        {vendor && (
                          <span className="text-xs text-muted-foreground">({vendor.name})</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        EOL: {new Date(eol.eolDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" · "}{eol.affectedAssets} asset{eol.affectedAssets !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold shrink-0 ml-2 px-2 py-0.5 rounded-full",
                      daysUntil <= 90
                        ? "bg-red-100 text-red-700"
                        : daysUntil <= 365
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {daysUntil}d
                  </span>
                </button>

                {/* Expanded remediation options */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 px-3 py-3 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Remediation Options
                    </p>
                    {eol.remediationOptions.map((opt, i) => (
                      <div key={i} className="rounded-md border border-border bg-card px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                              opt.type === "replacement"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                            )}
                          >
                            {opt.type === "replacement" ? "Replacement" : "EOL Support"}
                          </span>
                          <span className="text-xs font-medium text-foreground">{opt.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
                      </div>
                    ))}

                    {/* Open in new tab */}
                    <Link
                      href={`/eol/${eol.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open full EOL detail in new tab
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Patching & CVE Panel ─────────────────────────────────────────────────────

function PatchingPanel({ selectedVendorIds }: { selectedVendorIds: string[] }) {
  const { userCveAlerts } = useApp();
  const [expandedCves, setExpandedCves] = useState<Set<string>>(new Set());

  const relevantSchedules = vendorPatchSchedules.filter((s) =>
    selectedVendorIds.includes(s.vendorId)
  );

  const allCves = [...cveAlerts, ...userCveAlerts].filter((c) =>
    selectedVendorIds.includes(c.vendorId)
  );

  const urgentCves = allCves.filter((c) => c.immediateAction);
  const otherCves = allCves.filter((c) => !c.immediateAction);

  function toggleCve(id: string) {
    setExpandedCves((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const severityColors: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Vendor Patching & CVE Alerts</h2>
      </div>

      {/* CVE Alerts – Immediate Action */}
      {urgentCves.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
              Immediate Patch Required ({urgentCves.length})
            </span>
          </div>
          <div className="space-y-1.5">
            {urgentCves.map((cve) => {
              const vendor = vendors.find((v) => v.id === cve.vendorId);
              const isExpanded = expandedCves.has(cve.id);
              return (
                <div key={cve.id} className="border border-red-200 rounded-lg overflow-hidden bg-red-50/40">
                  <button
                    onClick={() => toggleCve(cve.id)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-red-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 text-red-400 shrink-0 transition-transform", !isExpanded && "-rotate-90")}
                      />
                      <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border", severityColors[cve.severity])}>
                        {cve.severity}
                      </span>
                      <span className="text-xs font-mono font-semibold text-foreground">{cve.cveId}</span>
                      {vendor && <span className="text-xs text-muted-foreground truncate">· {vendor.name}</span>}
                    </div>
                    <a
                      href={cve.patchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 ml-2 inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      Patch <ExternalLink className="h-3 w-3" />
                    </a>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-red-200 px-3 py-2 bg-red-50/20">
                      <p className="text-xs text-foreground mb-1">{cve.summary}</p>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        <span className="font-medium">Affected:</span> {cve.affectedProducts}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Reported: {new Date(cve.dateReported).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <a
                        href={cve.advisoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View vendor advisory
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CVE Alerts – Standard */}
      {otherCves.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Recent CVEs ({otherCves.length})
            </span>
          </div>
          <div className="space-y-1.5">
            {otherCves.map((cve) => {
              const vendor = vendors.find((v) => v.id === cve.vendorId);
              const isExpanded = expandedCves.has(cve.id);
              return (
                <div key={cve.id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCve(cve.id)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform", !isExpanded && "-rotate-90")}
                      />
                      <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border", severityColors[cve.severity])}>
                        {cve.severity}
                      </span>
                      <span className="text-xs font-mono font-semibold text-foreground">{cve.cveId}</span>
                      {vendor && <span className="text-xs text-muted-foreground truncate">· {vendor.name}</span>}
                    </div>
                    <a
                      href={cve.patchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 ml-2 inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      Patch <ExternalLink className="h-3 w-3" />
                    </a>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border px-3 py-2 bg-muted/10">
                      <p className="text-xs text-foreground mb-1">{cve.summary}</p>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        <span className="font-medium">Affected:</span> {cve.affectedProducts}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Reported: {new Date(cve.dateReported).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <a
                        href={cve.advisoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View vendor advisory
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {allCves.length === 0 && (
        <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          No CVE alerts for selected vendors.
        </div>
      )}

      {/* Patching Schedules */}
      {relevantSchedules.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Patching Schedules
            </span>
          </div>
          <div className="space-y-1.5">
            {relevantSchedules.map((sched) => {
              const vendor = vendors.find((v) => v.id === sched.vendorId);
              const nextDate = new Date(sched.nextPatchDate);
              const daysUntil = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={sched.vendorId} className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {vendor && (
                          <span className="text-xs font-semibold text-foreground">{vendor.name}</span>
                        )}
                        <span className="text-xs text-muted-foreground">–</span>
                        <span className="text-xs font-medium text-foreground">{sched.scheduleName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{sched.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                        <Clock className="h-3 w-3" />
                        <span>{sched.frequency}</span>
                      </div>
                      <div
                        className={cn(
                          "text-xs font-medium mt-0.5",
                          daysUntil <= 7 ? "text-orange-600" : "text-muted-foreground"
                        )}
                      >
                        Next: {nextDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {daysUntil <= 7 && ` (${daysUntil}d)`}
                      </div>
                      {sched.notesUrl && (
                        <a
                          href={sched.notesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline mt-0.5"
                        >
                          Notes <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {relevantSchedules.length === 0 && allCves.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No patch schedule or CVE data for your selected vendors.
        </p>
      )}
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { selectedVendorIds } = useApp();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<NewsSeverity | "all">("all");
  const [typeFilter, setTypeFilter] = useState<NewsType | "all">("all");
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "severity">("date");

  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };

  const filteredNews = useMemo(() => {
    let items = mockNews.filter((n) => selectedVendorIds.includes(n.vendorId));

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          vendors.find((v) => v.id === n.vendorId)?.name.toLowerCase().includes(q)
      );
    }

    if (severityFilter !== "all") {
      items = items.filter((n) => n.severity === severityFilter);
    }

    if (typeFilter !== "all") {
      items = items.filter((n) => n.type === typeFilter);
    }

    if (vendorFilter !== "all") {
      items = items.filter((n) => n.vendorId === vendorFilter);
    }

    if (sortBy === "date") {
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      items.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    }

    return items;
  }, [selectedVendorIds, search, severityFilter, typeFilter, vendorFilter, sortBy]);

  const selectedVendors = vendors.filter((v) => selectedVendorIds.includes(v.id));
  const criticalCount = mockNews.filter(
    (n) => selectedVendorIds.includes(n.vendorId) && (n.severity === "critical" || n.severity === "high")
  ).length;

  if (selectedVendorIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to RITHand</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          Get started by selecting the vendors you work with. Your personalized dashboard will appear here.
        </p>
        <Link
          href="/vendors"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <Building2 className="h-4 w-4" />
          Select Vendors
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tracking {selectedVendors.length} vendor{selectedVendors.length !== 1 ? "s" : ""}
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 ml-2 text-orange-600 font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              {criticalCount} critical/high alert{criticalCount !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      {/* Compliance Checklists */}
      <div className="mb-6">
        <CompliancePanel />
      </div>

      {/* EOL Tracker */}
      <div className="mb-6">
        <EolTracker selectedVendorIds={selectedVendorIds} />
      </div>

      {/* Patching & CVE Alerts */}
      <div className="mb-6">
        <PatchingPanel selectedVendorIds={selectedVendorIds} />
      </div>

      {/* News Feed Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Vendor News Feed</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Latest advisories, updates, and alerts from your tracked vendors
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as NewsSeverity | "all")}
              className="text-xs rounded-md border border-input bg-background px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as NewsType | "all")}
            className="text-xs rounded-md border border-input bg-background px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Types</option>
            <option value="security">Security</option>
            <option value="update">Update</option>
            <option value="outage">Outage</option>
            <option value="eol">End of Life</option>
            <option value="patch">Patch</option>
            <option value="general">General</option>
          </select>

          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="text-xs rounded-md border border-input bg-background px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Vendors</option>
            {selectedVendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 ml-auto">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "severity")}
              className="text-xs rounded-md border border-input bg-background px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="date">Newest First</option>
              <option value="severity">Severity</option>
            </select>
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="space-y-3">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No news items match your filters.</p>
          </div>
        ) : (
          filteredNews.map((item) => <NewsCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
