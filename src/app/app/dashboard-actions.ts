"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { getClientNamesByIds } from "@/lib/supabase/helpers";
import { getCurrentUserOrgMembership, isCurrentUserOrgAdmin, isAppAdmin } from "@/lib/auth/roles";

export interface DashboardData {
  clientsCount: number;
  openTasksCount: number;
  openTasksCriticalHigh: number;
  openVulnsCount: number;
  openVulnsCritical: number;
  upcomingMeetingsCount: number;
  recentTasks: Array<{
    id: string;
    title: string;
    clientName: string;
    status: string;
    priority: string;
  }>;
  topVulnerabilities: Array<{
    id: string;
    cveId: string | null;
    title: string;
    clientName: string;
    severity: string;
  }>;
  nextMeetings: Array<{
    id: string;
    title: string;
    clientName: string;
    scheduledDate: string | null;
    meetingType: string;
  }>;
  isAdmin: boolean;
  hasOrg: boolean;
}

export async function getDashboardData(): Promise<DashboardData> {
  const membership = await getCurrentUserOrgMembership();

  // If no org membership, check if app admin
  if (!membership) {
    const appAdmin = await isAppAdmin();
    return {
      clientsCount: 0,
      openTasksCount: 0,
      openTasksCriticalHigh: 0,
      openVulnsCount: 0,
      openVulnsCritical: 0,
      upcomingMeetingsCount: 0,
      recentTasks: [],
      topVulnerabilities: [],
      nextMeetings: [],
      isAdmin: appAdmin,
      hasOrg: false,
    };
  }

  const supabase = createServiceRoleClient();
  const isAdmin = await isCurrentUserOrgAdmin();

  // Fetch clients count
  const { count: clientsCount } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("org_id", membership.orgId);

  // Fetch total open task counts (no limit)
  const { count: totalOpenTasks } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("org_id", membership.orgId)
    .in("status", ["backlog", "in_progress", "review"]);

  const { count: totalCritHighTasks } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("org_id", membership.orgId)
    .in("status", ["backlog", "in_progress", "review"])
    .in("priority", ["critical", "high"]);

  // Fetch recent tasks for display (top 5)
  const { data: tasksData } = await supabase
    .from("tasks")
    .select("id, title, status, priority, client_id")
    .eq("org_id", membership.orgId)
    .in("status", ["backlog", "in_progress", "review"])
    .order("created_at", { ascending: false })
    .limit(5);

  const taskClientIds = [...new Set((tasksData || []).map((t: any) => t.client_id).filter(Boolean))];
  const taskClientMap = await getClientNamesByIds(taskClientIds);

  const recentTasks = (tasksData || []).map((task: any) => ({
    id: task.id,
    title: task.title,
    clientName: taskClientMap[task.client_id] || "Unknown",
    status: task.status,
    priority: task.priority,
  }));

  const openTasksCount = totalOpenTasks || 0;
  const openTasksCriticalHigh = totalCritHighTasks || 0;

  // Fetch total open vulnerability counts
  const { count: totalOpenVulns } = await supabase
    .from("client_vulnerabilities")
    .select("id", { count: "exact", head: true })
    .eq("org_id", membership.orgId)
    .in("status", ["open", "in_progress"]);

  const { count: totalCritVulns } = await supabase
    .from("client_vulnerabilities")
    .select("id", { count: "exact", head: true })
    .eq("org_id", membership.orgId)
    .eq("severity", "critical")
    .in("status", ["open", "in_progress"]);

  // Fetch top vulnerabilities for display (top 5)
  const { data: vulnsData } = await supabase
    .from("client_vulnerabilities")
    .select("id, cve_id, title, severity, client_id")
    .eq("org_id", membership.orgId)
    .in("status", ["open", "in_progress"])
    .order("severity", { ascending: false })
    .limit(5);

  const vulnClientIds = [...new Set((vulnsData || []).map((v: any) => v.client_id).filter(Boolean))];
  const vulnClientMap = await getClientNamesByIds(vulnClientIds);

  const topVulnerabilities = (vulnsData || []).map((vuln: any) => ({
    id: vuln.id,
    cveId: vuln.cve_id,
    title: vuln.title,
    clientName: vulnClientMap[vuln.client_id] || "Unknown",
    severity: vuln.severity,
  }));

  const openVulnsCount = totalOpenVulns || 0;
  const openVulnsCritical = totalCritVulns || 0;

  // Fetch upcoming meetings (next 7 days)
  const today = new Date();
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const todayStr = today.toISOString().split("T")[0];
  const in7DaysStr = in7Days.toISOString().split("T")[0];

  const { data: meetingsData } = await supabase
    .from("meetings")
    .select("id, title, scheduled_date, meeting_type, client_id")
    .eq("org_id", membership.orgId)
    .gte("scheduled_date", todayStr)
    .lte("scheduled_date", in7DaysStr)
    .order("scheduled_date", { ascending: true })
    .limit(3);

  const meetingClientIds = [...new Set((meetingsData || []).map((m: any) => m.client_id).filter(Boolean))];
  const meetingClientMap = await getClientNamesByIds(meetingClientIds);

  const nextMeetings = (meetingsData || []).map((meeting: any) => ({
    id: meeting.id,
    title: meeting.title,
    clientName: meetingClientMap[meeting.client_id] || "Unknown",
    scheduledDate: meeting.scheduled_date,
    meetingType: meeting.meeting_type,
  }));

  const upcomingMeetingsCount = meetingsData?.length || 0;

  return {
    clientsCount: clientsCount || 0,
    openTasksCount,
    openTasksCriticalHigh,
    openVulnsCount,
    openVulnsCritical,
    upcomingMeetingsCount,
    recentTasks,
    topVulnerabilities,
    nextMeetings,
    isAdmin,
    hasOrg: true,
  };
}
