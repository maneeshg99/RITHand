"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type VulnRow = {
  id: string;
  severity: string;
  vulnerability: string;
  ticket: string;
  status: string;
  notes: string;
  isNew?: boolean;
};

const SEVERITY_OPTIONS = ["High", "Medium", "Low"];
const STATUS_OPTIONS = ["In Progress", "Completed", "Accepted Risk", "Deferred"];

const severityColors: Record<string, string> = {
  High: "bg-red-100 text-red-800 [data-theme='dark']:bg-red-900/40 [data-theme='dark']:text-red-300",
  Medium:
    "bg-orange-100 text-orange-800 [data-theme='dark']:bg-orange-900/40 [data-theme='dark']:text-orange-300",
  Low: "bg-yellow-100 text-yellow-800 [data-theme='dark']:bg-yellow-900/40 [data-theme='dark']:text-yellow-300",
};

function isHighlightedStatus(status: string) {
  return status === "Completed" || status === "Accepted Risk";
}

interface EditableVulnTableProps {
  rows: VulnRow[];
  onSave: (row: VulnRow) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: () => void;
}

function EditableCell({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className={cn(
        "w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground",
        className
      )}
    />
  );
}

export function EditableVulnTable({
  rows,
  onSave,
  onDelete,
  onAdd,
}: EditableVulnTableProps) {
  const [editingRows, setEditingRows] = useState<Record<string, VulnRow>>({});

  const getRow = (row: VulnRow) => editingRows[row.id] || row;

  const updateField = (
    id: string,
    field: keyof VulnRow,
    value: string,
    original: VulnRow
  ) => {
    setEditingRows((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || original), [field]: value },
    }));
  };

  const handleBlur = async (id: string, original: VulnRow) => {
    const edited = editingRows[id];
    if (!edited) return;

    if (
      edited.severity === original.severity &&
      edited.vulnerability === original.vulnerability &&
      edited.ticket === original.ticket &&
      edited.status === original.status &&
      edited.notes === original.notes
    )
      return;

    await onSave(edited);
    setEditingRows((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-3 py-2.5 font-semibold text-foreground w-[12%]">
                Severity
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-foreground w-[25%]">
                Vulnerability
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-foreground w-[13%]">
                Ticket
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-foreground w-[15%]">
                Status
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-foreground w-[30%]">
                Notes
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No vulnerabilities yet. Click &quot;Add Row&quot; to create
                  one.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const current = getRow(row);
                const highlighted = isHighlightedStatus(current.status);
                const rowHighlight = highlighted
                  ? "bg-green-50 [data-theme='dark']:bg-green-900/20"
                  : "";

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    )}
                  >
                    {/* Severity — always colored by severity, never by status */}
                    <td
                      className={cn(
                        "px-1 py-0.5",
                        severityColors[current.severity] || ""
                      )}
                    >
                      <select
                        value={current.severity}
                        onChange={(e) => {
                          updateField(
                            row.id,
                            "severity",
                            e.target.value,
                            row
                          );
                          setTimeout(
                            () => handleBlur(row.id, row),
                            0
                          );
                        }}
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded px-2 py-1.5 text-sm font-semibold cursor-pointer"
                      >
                        {SEVERITY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Remaining cells — highlighted if Completed/Accepted Risk */}
                    <td className={cn("px-1 py-0.5", rowHighlight)}>
                      <EditableCell
                        value={current.vulnerability}
                        onChange={(v) =>
                          updateField(row.id, "vulnerability", v, row)
                        }
                        onBlur={() => handleBlur(row.id, row)}
                        placeholder="Vulnerability name..."
                      />
                    </td>
                    <td className={cn("px-1 py-0.5", rowHighlight)}>
                      <EditableCell
                        value={current.ticket}
                        onChange={(v) =>
                          updateField(row.id, "ticket", v, row)
                        }
                        onBlur={() => handleBlur(row.id, row)}
                        placeholder="TICKET-123"
                      />
                    </td>
                    <td className={cn("px-1 py-0.5", rowHighlight)}>
                      <select
                        value={current.status}
                        onChange={(e) => {
                          updateField(
                            row.id,
                            "status",
                            e.target.value,
                            row
                          );
                          setTimeout(
                            () => handleBlur(row.id, row),
                            0
                          );
                        }}
                        className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded px-1 py-1.5 text-sm cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={cn("px-1 py-0.5", rowHighlight)}>
                      <EditableCell
                        value={current.notes}
                        onChange={(v) =>
                          updateField(row.id, "notes", v, row)
                        }
                        onBlur={() => handleBlur(row.id, row)}
                        placeholder="Notes..."
                      />
                    </td>
                    <td className={cn("px-1 py-0.5", rowHighlight)}>
                      <button
                        onClick={() => onDelete(row.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete row"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border p-2">
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </button>
      </div>
    </div>
  );
}
