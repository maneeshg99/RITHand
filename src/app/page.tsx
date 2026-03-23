"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { vendors, vendorCategories } from "@/data/vendors";
import { mockNews } from "@/data/news";
import { NewsCard } from "@/components/NewsCard";
import { Search, Filter, SlidersHorizontal, AlertTriangle, Building2 } from "lucide-react";
import Link from "next/link";
import type { NewsSeverity, NewsType } from "@/data/news";

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
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
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
