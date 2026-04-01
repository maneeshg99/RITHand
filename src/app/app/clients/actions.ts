"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { getProfilesByIds, getClientNamesByIds } from "@/lib/supabase/helpers";
import {
  getAuthenticatedUser,
  getOrgMembership,
  getCurrentUserOrgMembership,
} from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

/** Helper: get membership with distinct error messages */
async function requireMembership() {
  const user = await getAuthenticatedUser();
  if (!user) return { membership: null as never, error: "Not authenticated. Please sign in." };
  const membership = await getOrgMembership(user.id);
  if (!membership)
    return {
      membership: null as never,
      error: "No organization membership. Contact your admin to be added to an organization.",
    };
  return { membership, error: null };
}

// ─── Client list (respects access model) ──────────────────────────────────────

export async function getMyClients() {
  const { membership, error: authError } = await requireMembership();
  if (authError) return { data: [], error: authError };

  const supabase = createServiceRoleClient();

  if (membership.role === "admin") {
    // Admins see all clients in their org
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("org_id", membership.orgId)
      .order("name");
    return { data: data || [], error: error?.message };
  } else {
    // Members see only assigned clients
    const { data, error } = await supabase
      .from("clients")
      .select("*, client_members!inner(role)")
      .eq("org_id", membership.orgId)
      .order("name");
    return { data: data || [], error: error?.message };
  }
}

export async function getClientDetail(clientId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();
  if (error) return { data: null, error: error.message };
  return { data };
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getClientTasks(clientId: string) {
  const supabase = createServiceRoleClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error || !tasks) return { data: [], error: error?.message };

  const assignedIds = tasks.map((t) => t.assigned_to).filter(Boolean) as string[];
  const profileMap = await getProfilesByIds(assignedIds);
  const enriched = tasks.map((t) => ({
    ...t,
    profiles: t.assigned_to ? profileMap[t.assigned_to] || null : null,
  }));
  return { data: enriched };
}

export async function getAllMyTasks() {
  const { membership, error: authError } = await requireMembership();
  if (authError) return { data: [], error: authError };
  const supabase = createServiceRoleClient();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("org_id", membership.orgId)
    .order("created_at", { ascending: false });
  if (error || !tasks) return { data: [], error: error?.message };

  const assignedIds = tasks.map((t) => t.assigned_to).filter(Boolean) as string[];
  const clientIds = [...new Set(tasks.map((t) => t.client_id).filter(Boolean))] as string[];
  const [profileMap, clientMap] = await Promise.all([
    getProfilesByIds(assignedIds),
    getClientNamesByIds(clientIds),
  ]);
  const enriched = tasks.map((t) => ({
    ...t,
    profiles: t.assigned_to ? profileMap[t.assigned_to] || null : null,
    clients: t.client_id ? { name: clientMap[t.client_id] || "Unknown" } : null,
  }));
  return { data: enriched };
}

export async function createTask(
  clientId: string,
  taskData: {
    title: string;
    description?: string;
    priority?: string;
    category?: string;
    status?: string;
    due_date?: string;
    assigned_to?: string;
    source_type?: string;
    source_id?: string;
  }
) {
  const { membership, error: authError } = await requireMembership();
  if (authError) return { error: authError };
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      client_id: clientId,
      org_id: membership.orgId,
      title: taskData.title,
      description: taskData.description || null,
      priority: taskData.priority || "medium",
      category: taskData.category || "general",
      status: taskData.status || "backlog",
      due_date: taskData.due_date || null,
      assigned_to: taskData.assigned_to || null,
      source_type: taskData.source_type || "manual",
      source_id: taskData.source_id || null,
      created_by: membership.userId,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/app/clients/${clientId}`);
  revalidatePath("/app/tasks");
  return { data };
}

export async function updateTask(
  taskId: string,
  updates: Record<string, unknown>
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", taskId);
  if (error) return { error: error.message };
  revalidatePath("/app/tasks");
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) return { error: error.message };
  revalidatePath("/app/tasks");
  return { success: true };
}

// ─── Meetings ─────────────────────────────────────────────────────────────────

export async function getClientMeetings(clientId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("client_id", clientId)
    .order("scheduled_date", { ascending: false });
  return { data: data || [], error: error?.message };
}

export async function getMeeting(meetingId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", meetingId)
    .single();
  if (error) return { data: null, error: error.message };
  return { data };
}

export async function createMeeting(
  clientId: string,
  meetingData: {
    title: string;
    meeting_type?: string;
    scheduled_date?: string;
    status?: string;
  }
) {
  const { membership, error: authError } = await requireMembership();
  if (authError) return { error: authError };
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("meetings")
    .insert({
      client_id: clientId,
      org_id: membership.orgId,
      title: meetingData.title,
      meeting_type: meetingData.meeting_type || "ad_hoc",
      scheduled_date: meetingData.scheduled_date || null,
      status: meetingData.status || "upcoming",
      created_by: membership.userId,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/app/clients/${clientId}`);
  return { data };
}

export async function updateMeeting(
  meetingId: string,
  updates: Record<string, unknown>
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("meetings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", meetingId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function getAgendaItems(meetingId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("meeting_agenda_items")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("sort_order");
  return { data: data || [], error: error?.message };
}

export async function addAgendaItem(
  meetingId: string,
  title: string,
  sortOrder: number
) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("meeting_agenda_items")
    .insert({ meeting_id: meetingId, title, sort_order: sortOrder })
    .select()
    .single();
  if (error) return { error: error.message };
  return { data };
}

export async function updateAgendaItem(
  itemId: string,
  updates: Record<string, unknown>
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("meeting_agenda_items")
    .update(updates)
    .eq("id", itemId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteAgendaItem(itemId: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("meeting_agenda_items")
    .delete()
    .eq("id", itemId);
  if (error) return { error: error.message };
  return { success: true };
}

// ─── Vulnerabilities ──────────────────────────────────────────────────────────

export async function getClientVulnerabilities(clientId: string) {
  const supabase = createServiceRoleClient();
  const { data: vulns, error } = await supabase
    .from("client_vulnerabilities")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error || !vulns) return { data: [], error: error?.message };

  const assignedIds = vulns.map((v) => v.assigned_to).filter(Boolean) as string[];
  const profileMap = await getProfilesByIds(assignedIds);
  const enriched = vulns.map((v) => ({
    ...v,
    profiles: v.assigned_to ? profileMap[v.assigned_to] || null : null,
  }));
  return { data: enriched };
}

export async function getAllMyVulnerabilities() {
  const { membership, error: authError } = await requireMembership();
  if (authError) return { data: [], error: authError };
  const supabase = createServiceRoleClient();

  const { data: vulns, error } = await supabase
    .from("client_vulnerabilities")
    .select("*")
    .eq("org_id", membership.orgId)
    .order("created_at", { ascending: false });
  if (error || !vulns) return { data: [], error: error?.message };

  const assignedIds = vulns.map((v) => v.assigned_to).filter(Boolean) as string[];
  const clientIds = [...new Set(vulns.map((v) => v.client_id).filter(Boolean))] as string[];
  const [profileMap, clientMap] = await Promise.all([
    getProfilesByIds(assignedIds),
    getClientNamesByIds(clientIds),
  ]);
  const enriched = vulns.map((v) => ({
    ...v,
    profiles: v.assigned_to ? profileMap[v.assigned_to] || null : null,
    clients: v.client_id ? { name: clientMap[v.client_id] || "Unknown" } : null,
  }));
  return { data: enriched };
}

export async function createVulnerability(
  clientId: string,
  vulnData: {
    title: string;
    cve_id?: string;
    vendor_id?: string;
    severity?: string;
    cvss_score?: number;
    status?: string;
    affected_assets?: string;
    remediation_plan?: string;
    due_date?: string;
    assigned_to?: string;
  }
) {
  const { membership, error: authError } = await requireMembership();
  if (authError) return { error: authError };
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("client_vulnerabilities")
    .insert({
      client_id: clientId,
      org_id: membership.orgId,
      title: vulnData.title,
      cve_id: vulnData.cve_id || null,
      vendor_id: vulnData.vendor_id || null,
      severity: vulnData.severity || "medium",
      cvss_score: vulnData.cvss_score || null,
      status: vulnData.status || "open",
      affected_assets: vulnData.affected_assets || null,
      remediation_plan: vulnData.remediation_plan || null,
      due_date: vulnData.due_date || null,
      assigned_to: vulnData.assigned_to || null,
      discovered_date: new Date().toISOString().split("T")[0],
      created_by: membership.userId,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/app/clients/${clientId}`);
  revalidatePath("/app/vulnerabilities");
  return { data };
}

export async function updateVulnerability(
  vulnId: string,
  updates: Record<string, unknown>
) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("client_vulnerabilities")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", vulnId);
  if (error) return { error: error.message };
  revalidatePath("/app/vulnerabilities");
  return { success: true };
}

export async function deleteVulnerability(vulnId: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("client_vulnerabilities")
    .delete()
    .eq("id", vulnId);
  if (error) return { error: error.message };
  revalidatePath("/app/vulnerabilities");
  return { success: true };
}

// ─── Assessments ──────────────────────────────────────────────────────────────

export async function getClientAssessments(clientId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return { data: data || [], error: error?.message };
}

export async function getAssessment(assessmentId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .single();
  if (error || !data) return { data: null, error: error?.message };

  // Enrich with client name
  if (data.client_id) {
    const clientMap = await getClientNamesByIds([data.client_id]);
    return { data: { ...data, clients: { name: clientMap[data.client_id] || "Unknown" } } };
  }
  return { data: { ...data, clients: null } };
}

export async function createAssessment(
  clientId: string,
  frameworkId: string,
  title?: string
) {
  const { membership, error: authError } = await requireMembership();
  if (authError) return { error: authError };
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      client_id: clientId,
      org_id: membership.orgId,
      framework_id: frameworkId,
      title: title || `${frameworkId} Assessment`,
      status: "draft",
      conducted_by: membership.userId,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/app/clients/${clientId}`);
  return { data };
}

export async function getAssessmentResponses(assessmentId: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("assessment_responses")
    .select("*")
    .eq("assessment_id", assessmentId);
  return { data: data || [], error: error?.message };
}

export async function saveAssessmentResponse(
  assessmentId: string,
  controlId: string,
  sectionId: string,
  responseData: {
    maturity_level: number;
    evidence?: string;
    gap_description?: string;
    remediation_rec?: string;
    priority?: string;
    effort_estimate?: string;
    notes?: string;
  }
) {
  const supabase = createServiceRoleClient();

  const { error } = await supabase.from("assessment_responses").upsert(
    {
      assessment_id: assessmentId,
      control_id: controlId,
      section_id: sectionId,
      maturity_level: responseData.maturity_level,
      evidence: responseData.evidence || null,
      gap_description: responseData.gap_description || null,
      remediation_rec: responseData.remediation_rec || null,
      priority: responseData.priority || null,
      effort_estimate: responseData.effort_estimate || null,
      notes: responseData.notes || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "assessment_id,control_id" }
  );

  if (error) return { error: error.message };
  return { success: true };
}

export async function completeAssessment(assessmentId: string, overallScore: number) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("assessments")
    .update({
      status: "completed",
      overall_score: overallScore,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", assessmentId);
  if (error) return { error: error.message };
  return { success: true };
}

// ─── Upsert helpers for inline-editable tables ───────────────────────────────

export async function upsertTask(taskData: {
  id: string;
  client_id: string;
  title: string;
  status?: string;
  assigned_to_name?: string;
  description?: string;
}) {
  const { membership, error: authError } = await requireMembership();
  if (authError) return { error: authError };
  const supabase = createServiceRoleClient();

  // Map friendly status to DB status
  const statusMap: Record<string, string> = {
    Backlog: "backlog",
    "In Progress": "in_progress",
    "Waiting on Client": "waiting_on_client",
    Done: "done",
    Cancelled: "cancelled",
  };

  const dbStatus = statusMap[taskData.status || "Backlog"] || "backlog";

  const { data, error } = await supabase
    .from("tasks")
    .upsert(
      {
        id: taskData.id,
        client_id: taskData.client_id,
        org_id: membership.orgId,
        title: taskData.title,
        description: taskData.description || null,
        status: dbStatus,
        priority: "medium",
        category: "general",
        created_by: membership.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function upsertVulnerability(vulnData: {
  id: string;
  client_id: string;
  title: string;
  severity?: string;
  status?: string;
  ticket?: string;
  notes?: string;
}) {
  const { membership, error: authError } = await requireMembership();
  if (authError) return { error: authError };
  const supabase = createServiceRoleClient();

  // Map friendly status/severity to DB values
  const statusMap: Record<string, string> = {
    "In Progress": "in_progress",
    Completed: "mitigated",
    "Accepted Risk": "accepted_risk",
    Deferred: "open",
  };
  const severityMap: Record<string, string> = {
    High: "high",
    Medium: "medium",
    Low: "low",
  };

  const { data, error } = await supabase
    .from("client_vulnerabilities")
    .upsert(
      {
        id: vulnData.id,
        client_id: vulnData.client_id,
        org_id: membership.orgId,
        title: vulnData.title,
        severity: severityMap[vulnData.severity || "Medium"] || "medium",
        status: statusMap[vulnData.status || "In Progress"] || "open",
        ticket: vulnData.ticket || null,
        remediation_notes: vulnData.notes || null,
        created_by: membership.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}
