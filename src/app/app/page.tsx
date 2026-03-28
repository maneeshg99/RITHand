"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CheckSquare,
  Clock,
  AlertCircle,
  ChevronRight,
  Plus,
  Loader,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardData, type DashboardData } from "./dashboard-actions";

const severityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

const statusColors: Record<string, string> = {
  backlog: "bg-slate-100 text-slate-700",
  "in_progress": "bg-blue-100 text-blue-700",
  review: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

const meetingTypeColors: Record<string, string> = {
  "kickoff": "bg-green-100 text-green-700",
  "check_in": "bg-blue-100 text-blue-700",
  "assessment": "bg-orange-100 text-orange-700",
  "review": "bg-purple-100 text-purple-700",
  "ad_hoc": "bg-slate-100 text-slate-700",
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-6 w-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  // No org — app admins see admin prompt, regular users see onboarding
  if (!data?.hasOrg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to RITHand</h1>
        {data?.isAdmin ? (
          <>
            <p className="text-muted-foreground max-w-md mb-6">
              You&apos;re signed in as an Application Admin. Create an organization from the Admin Panel to get started, then assign yourself to it.
            </p>
            <Link
              href="/app/admin"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Go to Admin Panel
            </Link>
          </>
        ) : (
          <>
            <p className="text-muted-foreground max-w-md mb-6">
              Let&apos;s get you set up with your organization. Complete the onboarding process to get started.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Start Onboarding
            </Link>
          </>
        )}
      </div>
    );
  }

  // Has org but no clients
  if (data.clientsCount === 0) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to RITHand</h1>
          <p className="text-muted-foreground max-w-md mb-8">
            {data.isAdmin
              ? "Get started by creating your first client. You can then manage tasks, vulnerabilities, and assessments for your clients."
              : "Ask your organization admin to create clients and assign you to get started."}
          </p>

          {/* Summary cards - all zeros */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full">
            <StatCard label="Clients" value="0" />
            <StatCard label="Open Tasks" value="0" />
            <StatCard label="Open Vulnerabilities" value="0" />
            <StatCard label="Upcoming Meetings" value="0" />
          </div>

          {data.isAdmin && (
            <Link
              href="/app/admin"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Create Your First Client
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Has clients with data
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.clientsCount} client{data.clientsCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Clients" value={data.clientsCount.toString()} />
        <StatCard
          label="Open Tasks"
          value={data.openTasksCount.toString()}
          subtext={
            data.openTasksCriticalHigh > 0
              ? `${data.openTasksCriticalHigh} critical/high`
              : undefined
          }
          subtextColor="text-orange-600"
        />
        <StatCard
          label="Open Vulnerabilities"
          value={data.openVulnsCount.toString()}
          subtext={
            data.openVulnsCritical > 0 ? `${data.openVulnsCritical} critical` : undefined
          }
          subtextColor="text-red-600"
        />
        <StatCard
          label="Upcoming Meetings"
          value={data.upcomingMeetingsCount.toString()}
          subtext="Next 7 days"
        />
      </div>

      {/* Recent Tasks Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Tasks</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest tasks across all clients</p>
          </div>
          <Link
            href="/app/tasks"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {data.recentTasks.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
            <p className="text-sm">No tasks yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{task.clientName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase px-2 py-1 rounded",
                      statusColors[task.status] || statusColors.backlog
                    )}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase px-2 py-1 rounded",
                      priorityColors[task.priority] || priorityColors.medium
                    )}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open Vulnerabilities Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Open Vulnerabilities</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Top vulnerabilities by severity
            </p>
          </div>
          <Link
            href="/app/vulnerabilities"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {data.topVulnerabilities.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
            <p className="text-sm">No open vulnerabilities.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.topVulnerabilities.map((vuln) => (
              <div
                key={vuln.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {vuln.cveId && (
                      <span className="text-xs font-mono font-semibold text-foreground">
                        {vuln.cveId}
                      </span>
                    )}
                    <span className="text-sm font-medium text-foreground">{vuln.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{vuln.clientName}</p>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase px-2 py-1 rounded shrink-0 ml-4",
                    severityColors[vuln.severity] || severityColors.medium
                  )}
                >
                  {vuln.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Meetings Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Upcoming Meetings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Next 7 days</p>
          </div>
        </div>

        {data.nextMeetings.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
            <p className="text-sm">No upcoming meetings.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.nextMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{meeting.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{meeting.clientName}</span>
                    {meeting.scheduledDate && (
                      <>
                        <span>·</span>
                        <span>
                          {new Date(meeting.scheduledDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase px-2 py-1 rounded shrink-0 ml-4",
                    meetingTypeColors[meeting.meetingType] || meetingTypeColors.ad_hoc
                  )}
                >
                  {meeting.meetingType.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionButton
            label="New Task"
            icon={CheckSquare}
            href="/app/tasks"
            disabled={data.clientsCount === 0}
          />
          <QuickActionButton
            label="New Meeting"
            icon={Clock}
            href="/app/clients"
            disabled={data.clientsCount === 0}
          />
          <QuickActionButton
            label="New Vulnerability"
            icon={AlertTriangle}
            href="/app/vulnerabilities"
            disabled={data.clientsCount === 0}
          />
          <QuickActionButton
            label="Start Assessment"
            icon={Building2}
            href="/app/clients"
            disabled={data.clientsCount === 0}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  subtextColor,
}: {
  label: string;
  value: string;
  subtext?: string;
  subtextColor?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
      {subtext && (
        <p className={cn("text-xs mt-1", subtextColor || "text-muted-foreground")}>
          {subtext}
        </p>
      )}
    </div>
  );
}

function QuickActionButton({
  label,
  icon: Icon,
  href,
  disabled,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  disabled?: boolean;
}) {
  const buttonClass = cn(
    "flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors",
    disabled
      ? "border-border bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50"
      : "border-border bg-card hover:bg-muted/30 text-foreground hover:text-primary"
  );

  if (disabled) {
    return (
      <div className={buttonClass} title="Select a client first">
        <Icon className="h-5 w-5" />
        <span className="text-xs font-medium text-center">{label}</span>
      </div>
    );
  }

  return (
    <Link href={href} className={buttonClass}>
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium text-center">{label}</span>
    </Link>
  );
}
