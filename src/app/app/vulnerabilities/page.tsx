"use client";

import { useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import {
  EditableVulnTable,
  type VulnRow,
} from "@/components/EditableVulnTable";
import {
  getAllMyVulnerabilities,
  upsertVulnerability,
  deleteVulnerability,
} from "@/app/app/clients/actions";
import { usePolling } from "@/hooks/usePolling";

// Map DB values to display values
const severityDisplayMap: Record<string, string> = {
  critical: "High",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Low",
};

const statusDisplayMap: Record<string, string> = {
  open: "In Progress",
  in_progress: "In Progress",
  mitigated: "Completed",
  accepted_risk: "Accepted Risk",
  false_positive: "Deferred",
};

type VulnWithClient = VulnRow & { _client_id?: string };

export default function VulnerabilitiesPage() {
  const [rows, setRows] = useState<VulnWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVulns = useCallback(async () => {
    try {
      const result = await getAllMyVulnerabilities();
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vulnRows: VulnWithClient[] = (result.data || []).map((v: any) => ({
        id: v.id,
        severity:
          severityDisplayMap[v.severity || "medium"] || "Medium",
        vulnerability: v.title || "",
        ticket: v.ticket || v.cve_id || "",
        status:
          statusDisplayMap[v.status || "open"] || "In Progress",
        notes: v.remediation_notes || v.remediation_plan || "",
        _client_id: v.client_id || "",
      }));
      setRows(vulnRows);
      setError(null);
    } catch {
      setError("Failed to load vulnerabilities");
    }
    setLoading(false);
  }, []);

  usePolling(loadVulns);

  const handleSave = async (row: VulnRow) => {
    const existingRow = rows.find((r) => r.id === row.id);
    const clientId = (existingRow as VulnWithClient)?._client_id || "";

    if (!clientId) {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, ...row } : r))
      );
      return;
    }

    const result = await upsertVulnerability({
      id: row.id,
      client_id: clientId,
      title: row.vulnerability,
      severity: row.severity,
      status: row.status,
      ticket: row.ticket,
      notes: row.notes,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, ...row } : r))
      );
    }
  };

  const handleDelete = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (row?.isNew) {
      setRows((prev) => prev.filter((r) => r.id !== id));
      return;
    }

    const result = await deleteVulnerability(id);
    if (result.error) {
      setError(result.error);
    } else {
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleAdd = () => {
    const newRow: VulnWithClient = {
      id: crypto.randomUUID(),
      severity: "Medium",
      vulnerability: "",
      ticket: "",
      status: "In Progress",
      notes: "",
      isNew: true,
      _client_id: "",
    };
    setRows((prev) => [...prev, newRow]);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <AlertTriangle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Vulnerabilities
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage vulnerabilities across all clients.{" "}
            <span className="font-medium text-foreground">
              {rows.length} total
            </span>
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Loading vulnerabilities...
        </div>
      ) : (
        <EditableVulnTable
          rows={rows}
          onSave={handleSave}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
