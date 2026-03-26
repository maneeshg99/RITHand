"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllMyVulnerabilities } from "@/app/app/clients/actions";

type Vulnerability = {
  id: string;
  cve_id: string | null;
  title: string;
  severity: string;
  status: string;
  cvss_score: number | null;
  affected_assets: string | null;
  remediation_plan: string | null;
  due_date: string | null;
  assigned_to: string | null;
  clients: {
    name: string;
  } | null;
  profiles: {
    full_name: string | null;
    username: string | null;
  } | null;
  discovered_date: string | null;
  created_at: string;
  updated_at: string;
};

const severityColors: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  critical: { bg: "bg-red-100", text: "text-red-700", label: "Critical" },
  high: { bg: "bg-orange-100", text: "text-orange-700", label: "High" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium" },
  low: { bg: "bg-blue-100", text: "text-blue-700", label: "Low" },
  info: { bg: "bg-slate-100", text: "text-slate-700", label: "Info" },
};

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: "bg-red-100", text: "text-red-700", label: "Open" },
  in_progress: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    label: "In Progress",
  },
  mitigated: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Mitigated",
  },
  accepted_risk: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    label: "Accepted Risk",
  },
  false_positive: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    label: "False Positive",
  },
};

export default function VulnerabilitiesPage() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVulnId, setExpandedVulnId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [clientFilter, setClientFilter] = useState<string>("");

  const loadVulnerabilities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllMyVulnerabilities();
      if (result.error) {
        setError(result.error);
        setVulns([]);
      } else {
        setVulns(result.data || []);
      }
    } catch (err) {
      setError("Failed to load vulnerabilities");
      setVulns([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadVulnerabilities();
  }, [loadVulnerabilities]);

  // Get unique clients from vulns
  const clients = useMemo(
    () =>
      Array.from(
        new Map(
          vulns
            .filter((v) => v.clients?.name)
            .map((v) => [v.clients?.name, v.clients?.name])
        ).values()
      ).sort(),
    [vulns]
  );

  // Filter vulns
  const filteredVulns = useMemo(() => {
    return vulns.filter((vuln) => {
      if (severityFilter && vuln.severity !== severityFilter) return false;
      if (statusFilter && vuln.status !== statusFilter) return false;
      if (clientFilter && vuln.clients?.name !== clientFilter) return false;
      return true;
    });
  }, [vulns, severityFilter, statusFilter, clientFilter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const openCritical = vulns.filter(
      (v) => v.status === "open" && v.severity === "critical"
    ).length;
    const openHigh = vulns.filter(
      (v) => v.status === "open" && v.severity === "high"
    ).length;
    const mitigatedThisMonth = vulns.filter(
      (v) =>
        v.status === "mitigated" &&
        v.updated_at &&
        new Date(v.updated_at) >= oneMonthAgo
    ).length;

    return { openCritical, openHigh, mitigatedThisMonth };
  }, [vulns]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Vulnerabilities
        </h1>
        <p className="text-sm text-muted-foreground">
          Cross-client vulnerability tracking and remediation
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-red-200 bg-red-50">
          <div className="text-xs font-medium text-red-600 mb-1">
            Open Critical
          </div>
          <div className="text-3xl font-bold text-red-700">
            {stats.openCritical}
          </div>
          <p className="text-xs text-red-600 mt-1">Requires immediate action</p>
        </div>
        <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
          <div className="text-xs font-medium text-orange-600 mb-1">
            Open High
          </div>
          <div className="text-3xl font-bold text-orange-700">
            {stats.openHigh}
          </div>
          <p className="text-xs text-orange-600 mt-1">High priority</p>
        </div>
        <div className="p-4 rounded-lg border border-green-200 bg-green-50">
          <div className="text-xs font-medium text-green-600 mb-1">
            Mitigated (30d)
          </div>
          <div className="text-3xl font-bold text-green-700">
            {stats.mitigatedThisMonth}
          </div>
          <p className="text-xs text-green-600 mt-1">Last 30 days</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Total Vulns
          </div>
          <div className="text-3xl font-bold text-foreground">
            {filteredVulns.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredVulns.filter((v) => v.status === "open").length} open
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 rounded-lg border border-border bg-card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="mitigated">Mitigated</option>
              <option value="accepted_risk">Accepted Risk</option>
              <option value="false_positive">False Positive</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Client
            </label>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vulnerabilities List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Loading vulnerabilities...
        </div>
      ) : filteredVulns.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No vulnerabilities found.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredVulns.map((vuln) => (
            <div key={vuln.id}>
              {/* Vuln Row */}
              <button
                onClick={() =>
                  setExpandedVulnId(expandedVulnId === vuln.id ? null : vuln.id)
                }
                className="w-full text-left"
              >
                <div className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Expand Icon */}
                    <div className="mt-1">
                      {expandedVulnId === vuln.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      {/* CVE ID */}
                      <div className="col-span-1 min-w-0">
                        <h3 className="font-mono text-sm font-semibold text-foreground truncate">
                          {vuln.cve_id || "No CVE"}
                        </h3>
                      </div>

                      {/* Title */}
                      <div className="col-span-1 md:col-span-2 min-w-0">
                        <p className="text-sm text-muted-foreground truncate">
                          {vuln.title}
                        </p>
                      </div>

                      {/* Client */}
                      <div className="col-span-1 min-w-0">
                        <p className="text-sm text-muted-foreground truncate">
                          {vuln.clients?.name || "—"}
                        </p>
                      </div>

                      {/* Severity Badge */}
                      <div className="col-span-1">
                        <span
                          className={cn(
                            "inline-block text-xs font-medium px-2 py-1 rounded",
                            severityColors[vuln.severity]?.bg || "bg-slate-100",
                            severityColors[vuln.severity]?.text ||
                              "text-slate-700"
                          )}
                        >
                          {severityColors[vuln.severity]?.label ||
                            vuln.severity}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="col-span-1">
                        <span
                          className={cn(
                            "inline-block text-xs font-medium px-2 py-1 rounded",
                            statusColors[vuln.status]?.bg || "bg-slate-100",
                            statusColors[vuln.status]?.text || "text-slate-700"
                          )}
                        >
                          {statusColors[vuln.status]?.label || vuln.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedVulnId === vuln.id && (
                <div className="mt-2 ml-8 p-4 rounded-lg border border-border bg-muted/20 space-y-4">
                  {/* CVSS Score */}
                  {vuln.cvss_score !== null && (
                    <div>
                      <h4 className="text-xs font-semibold text-foreground mb-1">
                        CVSS Score
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {vuln.cvss_score.toFixed(1)}/10
                      </p>
                    </div>
                  )}

                  {/* Affected Assets */}
                  {vuln.affected_assets && (
                    <div>
                      <h4 className="text-xs font-semibold text-foreground mb-1">
                        Affected Assets
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {vuln.affected_assets}
                      </p>
                    </div>
                  )}

                  {/* Remediation Plan */}
                  {vuln.remediation_plan && (
                    <div>
                      <h4 className="text-xs font-semibold text-foreground mb-1">
                        Remediation Plan
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {vuln.remediation_plan}
                      </p>
                    </div>
                  )}

                  {/* Assigned To */}
                  {vuln.profiles && (
                    <div>
                      <h4 className="text-xs font-semibold text-foreground mb-1">
                        Assigned To
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {vuln.profiles.full_name ||
                          vuln.profiles.username ||
                          "Unassigned"}
                      </p>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Severity
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {severityColors[vuln.severity]?.label ||
                          vuln.severity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Status
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {statusColors[vuln.status]?.label || vuln.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Discovered
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(vuln.discovered_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Due Date
                      </p>
                      <p
                        className={cn(
                          "text-sm font-medium",
                          isOverdue(vuln.due_date) &&
                            vuln.status !== "mitigated"
                            ? "text-red-600"
                            : "text-foreground"
                        )}
                      >
                        {formatDate(vuln.due_date)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
