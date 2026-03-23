"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { vendors } from "@/data/vendors";
import { mockNews } from "@/data/news";
import {
  complianceFrameworks,
  licenseRenewals,
  patchCompliance,
  eolProducts,
  incidentSummary,
} from "@/data/compliance";
import { NewsCard } from "@/components/NewsCard";
import {
  Search,
  Filter,
  SlidersHorizontal,
  AlertTriangle,
  Building2,
  ShieldCheck,
  FileWarning,
  CalendarClock,
  Activity,
  Monitor,
  Clock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NewsSeverity, NewsType } from "@/data/news";

function ComplianceScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 90 ? "text-green-500" : score >= 75 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          className="text-muted/50"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
        {score}
      </span>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  accent?: "red" | "yellow" | "green" | "blue";
}) {
  const accentColors = {
    red: "text-red-500",
    yellow: "text-yellow-500",
    green: "text-green-500",
    blue: "text-blue-500",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", accent ? accentColors[accent] : "text-muted-foreground")} />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={cn("text-2xl font-bold", accent ? accentColors[accent] : "text-foreground")}>
        {value}
      </p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  );
}

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

  // Compliance data derived from selected vendors
  const relevantLicenses = licenseRenewals.filter((l) => selectedVendorIds.includes(l.vendorId));
  const expiringLicenses = relevantLicenses.filter((l) => l.status === "expiring-soon");
  const relevantEol = eolProducts.filter((e) => selectedVendorIds.includes(e.vendorId));
  const patchRate = Math.round((patchCompliance.patchedWithinSLA / patchCompliance.totalEndpoints) * 100);

  if (selectedVendorIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to RITHand</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          Get started by selecting the vendors you work with. Your personalized news feed will appear here.
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

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={Activity}
          label="Open Incidents"
          value={incidentSummary.openIncidents}
          subtext={`${incidentSummary.criticalOpen} critical`}
          accent={incidentSummary.criticalOpen > 0 ? "red" : "green"}
        />
        <StatCard
          icon={Monitor}
          label="Patch Compliance"
          value={`${patchRate}%`}
          subtext={`${patchCompliance.overdueCritical} critical overdue`}
          accent={patchRate >= patchCompliance.slaTarget ? "green" : "yellow"}
        />
        <StatCard
          icon={CalendarClock}
          label="Expiring Licenses"
          value={expiringLicenses.length}
          subtext={expiringLicenses.length > 0 ? "Action needed" : "All current"}
          accent={expiringLicenses.length > 0 ? "yellow" : "green"}
        />
        <StatCard
          icon={Clock}
          label="Avg Resolution"
          value={`${incidentSummary.avgResolutionHours}h`}
          subtext={`${incidentSummary.resolvedThisMonth} resolved this month`}
          accent="blue"
        />
      </div>

      {/* Compliance & Risk Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Compliance Frameworks */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Compliance Posture</h2>
          </div>
          <div className="space-y-3">
            {complianceFrameworks.map((fw) => (
              <div key={fw.id} className="flex items-center gap-3">
                <ComplianceScoreRing score={fw.score} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-card-foreground">{fw.name}</span>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase",
                        fw.status === "compliant" && "bg-green-100 text-green-700",
                        fw.status === "at-risk" && "bg-yellow-100 text-yellow-700",
                        fw.status === "non-compliant" && "bg-red-100 text-red-700"
                      )}
                    >
                      {fw.status.replace("-", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Next audit:{" "}
                    {new Date(fw.nextAudit).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: License Renewals + EOL */}
        <div className="space-y-4">
          {/* License Renewals */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Upcoming Renewals</h2>
            </div>
            {relevantLicenses.length === 0 ? (
              <p className="text-xs text-muted-foreground">No license data for selected vendors.</p>
            ) : (
              <div className="space-y-2">
                {relevantLicenses.slice(0, 4).map((lic) => {
                  const vendor = vendors.find((v) => v.id === lic.vendorId);
                  return (
                    <div
                      key={lic.id}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-xs",
                        lic.status === "expiring-soon"
                          ? "bg-yellow-50 border border-yellow-200"
                          : "bg-muted/50"
                      )}
                    >
                      <div>
                        <span className="font-medium text-card-foreground">{lic.product}</span>
                        {vendor && (
                          <span className="text-muted-foreground ml-1">({vendor.name})</span>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className={cn(
                          "font-medium",
                          lic.status === "expiring-soon" ? "text-yellow-700" : "text-muted-foreground"
                        )}>
                          {new Date(lic.renewalDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-muted-foreground">
                          ${lic.annualCost.toLocaleString()}/yr
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* EOL Tracker */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileWarning className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">End-of-Life Tracker</h2>
            </div>
            {relevantEol.length === 0 ? (
              <p className="text-xs text-muted-foreground">No EOL items for selected vendors.</p>
            ) : (
              <div className="space-y-2">
                {relevantEol.map((eol) => {
                  const daysUntil = Math.ceil(
                    (new Date(eol.eolDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={eol.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-medium text-card-foreground">{eol.product}</span>
                        <div className="text-muted-foreground flex items-center gap-1">
                          <ChevronRight className="h-3 w-3" />
                          {eol.replacementSuggestion}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className={cn(
                          "font-medium",
                          daysUntil <= 180 ? "text-red-600" : "text-yellow-600"
                        )}>
                          {daysUntil}d remaining
                        </div>
                        <div className="text-muted-foreground">
                          {eol.affectedAssets} asset{eol.affectedAssets !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patch Compliance Bar */}
      <div className="rounded-xl border border-border bg-card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Patch Compliance Overview</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            SLA Target: {patchCompliance.slaTarget}%
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  patchRate >= patchCompliance.slaTarget ? "bg-green-500" : "bg-yellow-500"
                )}
                style={{ width: `${patchRate}%` }}
              />
            </div>
          </div>
          <span className={cn(
            "text-sm font-bold",
            patchRate >= patchCompliance.slaTarget ? "text-green-600" : "text-yellow-600"
          )}>
            {patchRate}%
          </span>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span>{patchCompliance.totalEndpoints.toLocaleString()} total endpoints</span>
          <span className="text-red-500 font-medium">{patchCompliance.overdueCritical} critical overdue</span>
          <span className="text-orange-500 font-medium">{patchCompliance.overdueHigh} high overdue</span>
          <span className="text-yellow-500 font-medium">{patchCompliance.overdueMedium} medium overdue</span>
        </div>
      </div>

      {/* News Feed Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Vendor News Feed</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Latest advisories, updates, and alerts from your tracked vendors</p>
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
