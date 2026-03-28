"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskRow = {
  id: string;
  item: string;
  owner: string;
  status: string;
  notes: string;
  isNew?: boolean;
};

const STATUS_OPTIONS = [
  "Backlog",
  "In Progress",
  "Waiting on Client",
  "Done",
  "Cancelled",
];

interface EditableTasksTableProps {
  rows: TaskRow[];
  onSave: (row: TaskRow) => Promise<void>;
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

function StatusSelect({
  value,
  onChange,
  onBlur,
}: {
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        // Auto-save on selection change
        setTimeout(onBlur, 0);
      }}
      className="w-full bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded px-1 py-1.5 text-sm text-foreground cursor-pointer"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function EditableTasksTable({
  rows,
  onSave,
  onDelete,
  onAdd,
}: EditableTasksTableProps) {
  const [editingRows, setEditingRows] = useState<Record<string, TaskRow>>({});

  const getRow = (row: TaskRow) => editingRows[row.id] || row;

  const updateField = (
    id: string,
    field: keyof TaskRow,
    value: string,
    original: TaskRow
  ) => {
    setEditingRows((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || original), [field]: value },
    }));
  };

  const handleBlur = async (id: string, original: TaskRow) => {
    const edited = editingRows[id];
    if (!edited) return;

    // Check if anything actually changed
    if (
      edited.item === original.item &&
      edited.owner === original.owner &&
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

  const statusBg = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-50 [data-theme='dark']:bg-green-900/20";
      case "In Progress":
        return "bg-blue-50 [data-theme='dark']:bg-blue-900/20";
      case "Waiting on Client":
        return "bg-yellow-50 [data-theme='dark']:bg-yellow-900/20";
      case "Cancelled":
        return "bg-red-50 [data-theme='dark']:bg-red-900/20";
      default:
        return "";
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-3 py-2.5 font-semibold text-foreground w-[30%]">
                Item
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-foreground w-[18%]">
                Owner
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-foreground w-[18%]">
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
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No tasks yet. Click &quot;Add Row&quot; to create one.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const current = getRow(row);
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                      statusBg(current.status)
                    )}
                  >
                    <td className="px-1 py-0.5">
                      <EditableCell
                        value={current.item}
                        onChange={(v) => updateField(row.id, "item", v, row)}
                        onBlur={() => handleBlur(row.id, row)}
                        placeholder="Task description..."
                      />
                    </td>
                    <td className="px-1 py-0.5">
                      <EditableCell
                        value={current.owner}
                        onChange={(v) => updateField(row.id, "owner", v, row)}
                        onBlur={() => handleBlur(row.id, row)}
                        placeholder="Owner..."
                      />
                    </td>
                    <td className="px-1 py-0.5">
                      <StatusSelect
                        value={current.status}
                        onChange={(v) => updateField(row.id, "status", v, row)}
                        onBlur={() => handleBlur(row.id, row)}
                      />
                    </td>
                    <td className="px-1 py-0.5">
                      <EditableCell
                        value={current.notes}
                        onChange={(v) => updateField(row.id, "notes", v, row)}
                        onBlur={() => handleBlur(row.id, row)}
                        placeholder="Notes..."
                      />
                    </td>
                    <td className="px-1 py-0.5">
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
