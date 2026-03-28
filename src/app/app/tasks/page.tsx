"use client";

import { useState, useCallback } from "react";
import { CheckSquare } from "lucide-react";
import {
  EditableTasksTable,
  type TaskRow,
} from "@/components/EditableTasksTable";
import {
  getAllMyTasks,
  upsertTask,
  deleteTask,
} from "@/app/app/clients/actions";
import { usePolling } from "@/hooks/usePolling";

// Map DB status to display status
const statusDisplayMap: Record<string, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  waiting_on_client: "Waiting on Client",
  done: "Done",
  cancelled: "Cancelled",
};

type TaskWithClient = TaskRow & { _client_id?: string };

export default function TasksPage() {
  const [rows, setRows] = useState<TaskWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const result = await getAllMyTasks();
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const taskRows: TaskWithClient[] = (result.data || []).map((t: any) => ({
        id: t.id,
        item: t.title || "",
        owner: t.profiles?.full_name || "",
        status: statusDisplayMap[t.status || "backlog"] || "Backlog",
        notes: t.description || "",
        _client_id: t.client_id || "",
      }));
      setRows(taskRows);
      setError(null);
    } catch {
      setError("Failed to load tasks");
    }
    setLoading(false);
  }, []);

  usePolling(loadTasks);

  const handleSave = async (row: TaskRow) => {
    const existingRow = rows.find((r) => r.id === row.id);
    const clientId = existingRow?._client_id || "";

    if (!clientId) {
      // New row without client — save locally only
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, ...row } : r))
      );
      return;
    }

    const result = await upsertTask({
      id: row.id,
      client_id: clientId,
      title: row.item,
      status: row.status,
      assigned_to_name: row.owner,
      description: row.notes,
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

    const result = await deleteTask(id);
    if (result.error) {
      setError(result.error);
    } else {
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleAdd = () => {
    const newRow: TaskWithClient = {
      id: crypto.randomUUID(),
      item: "",
      owner: "",
      status: "Backlog",
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
          <CheckSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage tasks across all your clients.{" "}
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
          Loading tasks...
        </div>
      ) : (
        <EditableTasksTable
          rows={rows}
          onSave={handleSave}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
