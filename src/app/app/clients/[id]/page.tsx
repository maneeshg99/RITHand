"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FolderOpen,
  CheckSquare,
  Calendar,
  AlertTriangle,
  ClipboardList,
  Plus,
  X,
  Pencil,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getClientDetail,
  getClientTasks,
  getClientMeetings,
  getClientVulnerabilities,
  getClientAssessments,
  createTask,
  updateTask,
  createMeeting,
  createVulnerability,
  updateVulnerability,
  createAssessment,
} from "../actions";

type Client = {
  id: string;
  name: string;
  industry: string | null;
  status: string;
  primary_contact: string | null;
  contact_email: string | null;
  notes: string | null;
  created_at: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to: string | null;
  profiles?: {
    full_name: string | null;
    username: string | null;
  };
};

type Meeting = {
  id: string;
  title: string;
  meeting_type: string;
  scheduled_date: string | null;
  status: string;
};

type Vulnerability = {
  id: string;
  title: string;
  cve_id: string | null;
  severity: string;
  cvss_score: number | null;
  status: string;
  affected_assets: string | null;
  due_date: string | null;
  assigned_to: string | null;
  profiles?: {
    full_name: string | null;
    username: string | null;
  };
};

type Assessment = {
  id: string;
  title: string;
  framework_id: string;
  status: string;
  overall_score: number | null;
  created_at: string;
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  onboarding: "bg-blue-100 text-blue-700",
  offboarding: "bg-yellow-100 text-yellow-700",
  inactive: "bg-slate-100 text-slate-500",
};

const taskStatusColors: Record<string, string> = {
  backlog: "bg-slate-100 text-slate-700",
  todo: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
};

const taskPriorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
  critical: "bg-purple-100 text-purple-700",
};

const severityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [tab, setTab] = useState<"overview" | "tasks" | "meetings" | "vulnerabilities" | "assessments">("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [showNewVulnerability, setShowNewVulnerability] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const clientRes = await getClientDetail(clientId);
      if (clientRes.error) {
        setError(clientRes.error);
      } else {
        setClient(clientRes.data as Client);
      }
    } catch {
      setError("Failed to load client");
    }
    setLoading(false);
  }, [clientId]);

  const loadTasks = useCallback(async () => {
    const result = await getClientTasks(clientId);
    if (result.error) {
      setError(result.error);
    } else {
      setTasks(result.data as Task[]);
    }
  }, [clientId]);

  const loadMeetings = useCallback(async () => {
    const result = await getClientMeetings(clientId);
    if (result.error) {
      setError(result.error);
    } else {
      setMeetings(result.data as Meeting[]);
    }
  }, [clientId]);

  const loadVulnerabilities = useCallback(async () => {
    const result = await getClientVulnerabilities(clientId);
    if (result.error) {
      setError(result.error);
    } else {
      setVulnerabilities(result.data as Vulnerability[]);
    }
  }, [clientId]);

  const loadAssessments = useCallback(async () => {
    const result = await getClientAssessments(clientId);
    if (result.error) {
      setError(result.error);
    } else {
      setAssessments(result.data as Assessment[]);
    }
  }, [clientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (tab === "tasks") loadTasks();
    else if (tab === "meetings") loadMeetings();
    else if (tab === "vulnerabilities") loadVulnerabilities();
    else if (tab === "assessments") loadAssessments();
  }, [tab, loadTasks, loadMeetings, loadVulnerabilities, loadAssessments]);

  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createTask(clientId, {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      priority: (formData.get("priority") as string) || undefined,
      status: (formData.get("status") as string) || undefined,
      due_date: (formData.get("due_date") as string) || undefined,
    });
    if (result.error) {
      setError(result.error);
    } else {
      setShowNewTask(false);
      loadTasks();
    }
  }

  async function handleCreateMeeting(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createMeeting(clientId, {
      title: formData.get("title") as string,
      scheduled_date: (formData.get("scheduled_date") as string) || undefined,
      meeting_type: (formData.get("meeting_type") as string) || undefined,
    });
    if (result.error) {
      setError(result.error);
    } else {
      setShowNewMeeting(false);
      loadMeetings();
    }
  }

  async function handleCreateVulnerability(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createVulnerability(clientId, {
      title: formData.get("title") as string,
      cve_id: (formData.get("cve_id") as string) || undefined,
      severity: (formData.get("severity") as string) || undefined,
      cvss_score: formData.get("cvss_score") ? Number(formData.get("cvss_score")) : undefined,
      affected_assets: (formData.get("affected_assets") as string) || undefined,
      remediation_plan: (formData.get("remediation_plan") as string) || undefined,
      due_date: (formData.get("due_date") as string) || undefined,
    });
    if (result.error) {
      setError(result.error);
    } else {
      setShowNewVulnerability(false);
      loadVulnerabilities();
    }
  }

  async function handleCreateAssessment() {
    setError(null);
    const result = await createAssessment(clientId, "nist-csf");
    if (result.error) {
      setError(result.error);
    } else {
      loadAssessments();
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto text-center py-12 text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto text-center py-12">
        <p className="text-muted-foreground">Client not found.</p>
        <Link href="/app/clients" className="text-primary text-sm hover:underline mt-2 inline-block">
          Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Back link */}
      <Link
        href="/app/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Clients
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">
            {client.name}
          </h1>
          <span
            className={cn(
              "text-xs font-bold uppercase px-2 py-0.5 rounded",
              statusColors[client.status] || statusColors.inactive
            )}
          >
            {client.status}
          </span>
        </div>
        {client.industry && (
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {client.industry}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
        <button
          onClick={() => setTab("overview")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
            tab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <FolderOpen className="h-4 w-4" />
          Overview
        </button>
        <button
          onClick={() => setTab("tasks")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
            tab === "tasks"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <CheckSquare className="h-4 w-4" />
          Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setTab("meetings")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
            tab === "meetings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Calendar className="h-4 w-4" />
          Meetings ({meetings.length})
        </button>
        <button
          onClick={() => setTab("vulnerabilities")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
            tab === "vulnerabilities"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          Vulnerabilities ({vulnerabilities.length})
        </button>
        <button
          onClick={() => setTab("assessments")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
            tab === "assessments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <ClipboardList className="h-4 w-4" />
          Assessments ({assessments.length})
        </button>
      </div>

      {/* Tab Content */}
      {tab === "overview" && <OverviewTab client={client} />}
      {tab === "tasks" && (
        <TasksTab
          clientId={clientId}
          tasks={tasks}
          showNewTask={showNewTask}
          setShowNewTask={setShowNewTask}
          onCreateTask={handleCreateTask}
          onRefresh={loadTasks}
        />
      )}
      {tab === "meetings" && (
        <MeetingsTab
          clientId={clientId}
          meetings={meetings}
          showNewMeeting={showNewMeeting}
          setShowNewMeeting={setShowNewMeeting}
          onCreateMeeting={handleCreateMeeting}
          onRefresh={loadMeetings}
        />
      )}
      {tab === "vulnerabilities" && (
        <VulnerabilitiesTab
          clientId={clientId}
          vulnerabilities={vulnerabilities}
          showNewVulnerability={showNewVulnerability}
          setShowNewVulnerability={setShowNewVulnerability}
          onCreateVulnerability={handleCreateVulnerability}
          onRefresh={loadVulnerabilities}
        />
      )}
      {tab === "assessments" && (
        <AssessmentsTab
          clientId={clientId}
          assessments={assessments}
          onCreateAssessment={handleCreateAssessment}
          onRefresh={loadAssessments}
        />
      )}
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────

function OverviewTab({ client }: { client: Client }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoField label="Primary Contact" value={client.primary_contact} />
      <InfoField label="Contact Email" value={client.contact_email} />
      <InfoField label="Industry" value={client.industry} className="capitalize" />
      <InfoField label="Status" value={client.status} className="capitalize" />
      <div className="md:col-span-2">
        <InfoField label="Notes" value={client.notes} />
      </div>
      <InfoField
        label="Created"
        value={new Date(client.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      />
    </div>
  );
}

function InfoField({
  label,
  value,
  className,
}: {
  label: string;
  value: string | null;
  className?: string;
}) {
  return (
    <div className="p-3 rounded-lg border border-border bg-card">
      <p className="text-xs font-medium text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className={cn("text-sm text-foreground", className)}>
        {value || <span className="text-muted-foreground italic">Not set</span>}
      </p>
    </div>
  );
}

// ─── Tasks Tab ─────────────────────────────────────────────────────────────

function TasksTab({
  clientId,
  tasks,
  showNewTask,
  setShowNewTask,
  onCreateTask,
  onRefresh,
}: {
  clientId: string;
  tasks: Task[];
  showNewTask: boolean;
  setShowNewTask: (v: boolean) => void;
  onCreateTask: (e: React.FormEvent<HTMLFormElement>) => void;
  onRefresh: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Tasks and action items for this client
        </p>
        <button
          onClick={() => setShowNewTask(!showNewTask)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {/* New Task Form */}
      {showNewTask && (
        <form
          onSubmit={onCreateTask}
          className="mb-6 p-4 rounded-xl border border-border bg-card space-y-4"
        >
          <h3 className="text-sm font-semibold text-foreground">
            Create New Task
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Task Title *
              </label>
              <input
                name="title"
                required
                placeholder="e.g., Review security policy"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="Task details..."
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Status
              </label>
              <select
                name="status"
                defaultValue="backlog"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Priority
              </label>
              <select
                name="priority"
                defaultValue="medium"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Due Date
              </label>
              <input
                name="due_date"
                type="date"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={() => setShowNewTask(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No tasks yet. Create your first task to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Priority</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded inline-block",
                        taskStatusColors[task.status] || taskStatusColors.backlog
                      )}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded inline-block",
                        taskPriorityColors[task.priority] || taskPriorityColors.medium
                      )}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Meetings Tab ──────────────────────────────────────────────────────────

function MeetingsTab({
  clientId,
  meetings,
  showNewMeeting,
  setShowNewMeeting,
  onCreateMeeting,
  onRefresh,
}: {
  clientId: string;
  meetings: Meeting[];
  showNewMeeting: boolean;
  setShowNewMeeting: (v: boolean) => void;
  onCreateMeeting: (e: React.FormEvent<HTMLFormElement>) => void;
  onRefresh: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Meetings and check-ins with this client
        </p>
        <button
          onClick={() => setShowNewMeeting(!showNewMeeting)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Meeting
        </button>
      </div>

      {/* New Meeting Form */}
      {showNewMeeting && (
        <form
          onSubmit={onCreateMeeting}
          className="mb-6 p-4 rounded-xl border border-border bg-card space-y-4"
        >
          <h3 className="text-sm font-semibold text-foreground">
            Schedule New Meeting
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Meeting Title *
              </label>
              <input
                name="title"
                required
                placeholder="e.g., Quarterly Review"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Meeting Type
              </label>
              <select
                name="meeting_type"
                defaultValue="ad_hoc"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ad_hoc">Ad Hoc</option>
                <option value="check_in">Check-in</option>
                <option value="review">Review</option>
                <option value="planning">Planning</option>
                <option value="incident">Incident</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Scheduled Date
              </label>
              <input
                name="scheduled_date"
                type="datetime-local"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Schedule Meeting
            </button>
            <button
              type="button"
              onClick={() => setShowNewMeeting(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No meetings scheduled yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">
                    {meeting.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground capitalize">
                      {meeting.meeting_type.replace("_", " ")}
                    </span>
                    {meeting.scheduled_date && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(meeting.scheduled_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">
                  {meeting.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Vulnerabilities Tab ───────────────────────────────────────────────────

function VulnerabilitiesTab({
  clientId,
  vulnerabilities,
  showNewVulnerability,
  setShowNewVulnerability,
  onCreateVulnerability,
  onRefresh,
}: {
  clientId: string;
  vulnerabilities: Vulnerability[];
  showNewVulnerability: boolean;
  setShowNewVulnerability: (v: boolean) => void;
  onCreateVulnerability: (e: React.FormEvent<HTMLFormElement>) => void;
  onRefresh: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Security vulnerabilities and findings
        </p>
        <button
          onClick={() => setShowNewVulnerability(!showNewVulnerability)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add Vulnerability
        </button>
      </div>

      {/* New Vulnerability Form */}
      {showNewVulnerability && (
        <form
          onSubmit={onCreateVulnerability}
          className="mb-6 p-4 rounded-xl border border-border bg-card space-y-4"
        >
          <h3 className="text-sm font-semibold text-foreground">
            Report New Vulnerability
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Vulnerability Title *
              </label>
              <input
                name="title"
                required
                placeholder="e.g., SQL Injection in Login Form"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                CVE ID
              </label>
              <input
                name="cve_id"
                placeholder="CVE-2024-..."
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                CVSS Score
              </label>
              <input
                name="cvss_score"
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="7.5"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Severity
              </label>
              <select
                name="severity"
                defaultValue="medium"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Affected Assets
              </label>
              <input
                name="affected_assets"
                placeholder="e.g., Web Server, Database"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Remediation Plan
              </label>
              <textarea
                name="remediation_plan"
                rows={2}
                placeholder="How will this be fixed?"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Due Date
              </label>
              <input
                name="due_date"
                type="date"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Add Vulnerability
            </button>
            <button
              type="button"
              onClick={() => setShowNewVulnerability(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Vulnerabilities List */}
      {vulnerabilities.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No vulnerabilities reported.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Severity</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {vulnerabilities.map((vuln) => (
                <tr key={vuln.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{vuln.title}</p>
                      {vuln.cve_id && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {vuln.cve_id}
                        </span>
                      )}
                    </div>
                    {vuln.cvss_score && (
                      <p className="text-xs text-muted-foreground mt-1">
                        CVSS: {vuln.cvss_score.toFixed(1)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded inline-block",
                        severityColors[vuln.severity] || severityColors.medium
                      )}
                    >
                      {vuln.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded inline-block bg-slate-100 text-slate-700">
                      {vuln.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {vuln.due_date ? new Date(vuln.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Assessments Tab ───────────────────────────────────────────────────────

function AssessmentsTab({
  clientId,
  assessments,
  onCreateAssessment,
  onRefresh,
}: {
  clientId: string;
  assessments: Assessment[];
  onCreateAssessment: () => void;
  onRefresh: () => void;
}) {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Security and compliance assessments
        </p>
        <button
          onClick={onCreateAssessment}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Start Assessment
        </button>
      </div>

      {/* Assessments List */}
      {assessments.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No assessments started yet. Create one to begin.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {assessments.map((assessment) => (
            <Link
              key={assessment.id}
              href={`/app/assessments/${assessment.id}`}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors group"
            >
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  {assessment.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground capitalize">
                    {assessment.framework_id.replace(/-/g, " ")}
                  </span>
                  {assessment.overall_score !== null && (
                    <span className="text-xs text-muted-foreground">
                      Score: {(assessment.overall_score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                    assessment.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  )}
                >
                  {assessment.status}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
