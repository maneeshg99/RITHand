"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Calendar,
  Clock,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllMyTasks } from "@/app/app/clients/actions";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string;
  due_date: string | null;
  assigned_to: string | null;
  clients: {
    name: string;
  } | null;
  profiles: {
    full_name: string | null;
    username: string | null;
  } | null;
  created_at: string;
  updated_at: string;
};

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  backlog: { bg: "bg-slate-100", text: "text-slate-700", label: "Backlog" },
  in_progress: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "In Progress",
  },
  waiting_on_client: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    label: "Waiting",
  },
  done: { bg: "bg-green-100", text: "text-green-700", label: "Done" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
};

const priorityColors: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  critical: { bg: "bg-red-100", text: "text-red-700", label: "Critical" },
  high: { bg: "bg-orange-100", text: "text-orange-700", label: "High" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium" },
  low: { bg: "bg-blue-100", text: "text-blue-700", label: "Low" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [clientFilter, setClientFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"due_date" | "priority">("due_date");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllMyTasks();
      if (result.error) {
        setError(result.error);
        setTasks([]);
      } else {
        setTasks(result.data || []);
      }
    } catch (err) {
      setError("Failed to load tasks");
      setTasks([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Get unique clients and statuses from tasks
  const clients = useMemo(
    () =>
      Array.from(
        new Map(
          tasks
            .filter((t) => t.clients?.name)
            .map((t) => [t.clients?.name, t.clients?.name])
        ).values()
      ).sort(),
    [tasks]
  );

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      if (statusFilter && task.status !== statusFilter) return false;
      if (priorityFilter && task.priority !== priorityFilter) return false;
      if (clientFilter && task.clients?.name !== clientFilter) return false;
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "due_date") {
        const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return dateA - dateB;
      } else {
        const priorityOrder: Record<string, number> = {
          critical: 0,
          high: 1,
          medium: 2,
          low: 3,
        };
        const orderA = priorityOrder[a.priority] ?? 999;
        const orderB = priorityOrder[b.priority] ?? 999;
        return orderA - orderB;
      }
    });

    return filtered;
  }, [tasks, statusFilter, priorityFilter, clientFilter, sortBy]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
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
        <h1 className="text-2xl font-bold text-foreground mb-1">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Cross-client task view and management
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 p-4 rounded-lg border border-border bg-card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <option value="backlog">Backlog</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_on_client">Waiting on Client</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "due_date" | "priority")}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Total Tasks
          </div>
          <div className="text-2xl font-bold text-foreground">
            {filteredTasks.length}
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            In Progress
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {filteredTasks.filter((t) => t.status === "in_progress").length}
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Completed
          </div>
          <div className="text-2xl font-bold text-green-600">
            {filteredTasks.filter((t) => t.status === "done").length}
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Overdue
          </div>
          <div className="text-2xl font-bold text-red-600">
            {filteredTasks.filter((t) => isOverdue(t.due_date) && t.status !== "done").length}
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Loading tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No tasks found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <div key={task.id}>
              {/* Task Row */}
              <button
                onClick={() =>
                  setExpandedTaskId(
                    expandedTaskId === task.id ? null : task.id
                  )
                }
                className="w-full text-left"
              >
                <div className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Expand Icon */}
                    <div className="mt-1">
                      {expandedTaskId === task.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                      {/* Title */}
                      <div className="col-span-1 md:col-span-2 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {task.title}
                        </h3>
                      </div>

                      {/* Client */}
                      <div className="col-span-1 min-w-0">
                        <p className="text-sm text-muted-foreground truncate">
                          {task.clients?.name || "—"}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="col-span-1">
                        <span
                          className={cn(
                            "inline-block text-xs font-medium px-2 py-1 rounded",
                            statusColors[task.status]?.bg || "bg-slate-100",
                            statusColors[task.status]?.text || "text-slate-700"
                          )}
                        >
                          {statusColors[task.status]?.label || task.status}
                        </span>
                      </div>

                      {/* Priority Badge */}
                      <div className="col-span-1">
                        <span
                          className={cn(
                            "inline-block text-xs font-medium px-2 py-1 rounded",
                            priorityColors[task.priority]?.bg || "bg-slate-100",
                            priorityColors[task.priority]?.text ||
                              "text-slate-700"
                          )}
                        >
                          {priorityColors[task.priority]?.label || task.priority}
                        </span>
                      </div>

                      {/* Category */}
                      <div className="col-span-1 hidden md:block">
                        <p className="text-xs text-muted-foreground capitalize">
                          {task.category || "—"}
                        </p>
                      </div>

                      {/* Due Date */}
                      <div className="col-span-1 min-w-0">
                        <p
                          className={cn(
                            "text-xs",
                            isOverdue(task.due_date) && task.status !== "done"
                              ? "text-red-600 font-semibold"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatDate(task.due_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedTaskId === task.id && (
                <div className="mt-2 ml-8 p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                  {/* Description */}
                  {task.description && (
                    <div>
                      <h4 className="text-xs font-semibold text-foreground mb-1">
                        Description
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {task.description}
                      </p>
                    </div>
                  )}

                  {/* Assigned To */}
                  {task.profiles && (
                    <div>
                      <h4 className="text-xs font-semibold text-foreground mb-1">
                        Assigned To
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {task.profiles.full_name || task.profiles.username || "Unassigned"}
                      </p>
                    </div>
                  )}

                  {/* Additional Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Category
                      </p>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {task.category || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Status
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {statusColors[task.status]?.label || task.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Priority
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {priorityColors[task.priority]?.label || task.priority}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Due Date
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(task.due_date)}
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
