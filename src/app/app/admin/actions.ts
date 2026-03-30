"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  requireOrgAdmin,
  requireAppAdmin,
  getFullUserContext,
  isAppAdmin,
} from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

// ─── Client CRUD (org admin) ─────────────────────────────────────────────────

export async function createClient(formData: FormData) {
  const membership = await requireOrgAdmin();
  if (!membership.orgId) return { error: "No organization. Create one first and assign yourself." };

  const supabase = createServiceRoleClient();

  const { error } = await supabase.from("clients").insert({
    org_id: membership.orgId,
    name: formData.get("name") as string,
    industry: (formData.get("industry") as string) || null,
    primary_contact: (formData.get("primary_contact") as string) || null,
    contact_email: (formData.get("contact_email") as string) || null,
    notes: (formData.get("notes") as string) || null,
    status: (formData.get("status") as string) || "active",
  });

  if (error) return { error: error.message };

  revalidatePath("/app/admin");
  return { success: true };
}

export async function updateClient(clientId: string, formData: FormData) {
  const membership = await requireOrgAdmin();
  if (!membership.orgId) return { error: "No organization. Assign yourself to one first." };
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("clients")
    .update({
      name: formData.get("name") as string,
      industry: (formData.get("industry") as string) || null,
      primary_contact: (formData.get("primary_contact") as string) || null,
      contact_email: (formData.get("contact_email") as string) || null,
      notes: (formData.get("notes") as string) || null,
      status: (formData.get("status") as string) || "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId)
    .eq("org_id", membership.orgId);

  if (error) return { error: error.message };

  revalidatePath("/app/admin");
  revalidatePath(`/app/admin/clients/${clientId}`);
  return { success: true };
}

export async function deleteClient(clientId: string) {
  const membership = await requireOrgAdmin();
  if (!membership.orgId) return { error: "No organization. Assign yourself to one first." };
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("org_id", membership.orgId);

  if (error) return { error: error.message };

  revalidatePath("/app/admin");
  return { success: true };
}

// ─── Client Member Management ────────────────────────────────────────────────

export async function assignUserToClient(
  clientId: string,
  userId: string,
  role: "editor" | "viewer"
) {
  const { userId: adminId } = await requireOrgAdmin();
  const supabase = createServiceRoleClient();

  const { error } = await supabase.from("client_members").upsert(
    {
      client_id: clientId,
      user_id: userId,
      role,
      assigned_by: adminId,
      assigned_at: new Date().toISOString(),
    },
    { onConflict: "client_id,user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath(`/app/admin/clients/${clientId}`);
  return { success: true };
}

export async function updateClientMemberRole(
  clientId: string,
  userId: string,
  role: "editor" | "viewer"
) {
  await requireOrgAdmin();
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("client_members")
    .update({ role })
    .eq("client_id", clientId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath(`/app/admin/clients/${clientId}`);
  return { success: true };
}

export async function removeUserFromClient(clientId: string, userId: string) {
  await requireOrgAdmin();
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("client_members")
    .delete()
    .eq("client_id", clientId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath(`/app/admin/clients/${clientId}`);
  return { success: true };
}

// ─── Data Fetching (org-level) ───────────────────────────────────────────────

export async function getClients() {
  const ctx = await getFullUserContext();
  if (!ctx) return { error: "Not authenticated", data: [] };

  const supabase = createServiceRoleClient();

  if (ctx.membership) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("org_id", ctx.membership.orgId)
      .order("name");
    if (error) return { error: error.message, data: [] };
    return { data: data || [] };
  }

  return { data: [] };
}

export async function getClient(clientId: string) {
  await requireOrgAdmin();
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (error) return { error: error.message, data: null };
  return { data };
}

export async function getClientMembers(clientId: string) {
  await requireOrgAdmin();
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("client_members")
    .select(
      `
      client_id,
      user_id,
      role,
      assigned_at,
      profiles:user_id (id, full_name, username)
    `
    )
    .eq("client_id", clientId);

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function getOrgMembers() {
  const ctx = await getFullUserContext();
  if (!ctx) return { error: "Not authenticated", data: [] };
  if (!ctx.membership && ctx.appRole !== "app_admin")
    return { error: "No org membership", data: [] };

  const supabase = createServiceRoleClient();

  if (ctx.membership) {
    const { data, error } = await supabase
      .from("organization_members")
      .select(
        `
        user_id,
        role,
        profiles:user_id (id, full_name, username)
      `
      )
      .eq("organization_id", ctx.membership.orgId);

    if (error) return { error: error.message, data: [] };
    return { data: data || [] };
  }

  return { data: [] };
}

// ─── App Admin: Organization Management ──────────────────────────────────────
// All app-admin operations use service role client to bypass RLS recursion.

export async function getAllOrganizations() {
  await requireAppAdmin();
  const db = createServiceRoleClient();

  const { data, error } = await db
    .from("organizations")
    .select("*, organization_members(count)")
    .order("name");

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function createOrganizationAsAdmin(name: string) {
  await requireAppAdmin();
  const db = createServiceRoleClient();

  const { data: org, error } = await db
    .from("organizations")
    .insert({ name })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/app/admin");
  return { data: org };
}

export async function deleteOrganization(orgId: string) {
  await requireAppAdmin();
  const db = createServiceRoleClient();

  const { error } = await db
    .from("organizations")
    .delete()
    .eq("id", orgId);

  if (error) return { error: error.message };

  revalidatePath("/app/admin");
  return { success: true };
}

export async function getAllUsers() {
  // Allow app admins and org admins to see the user list
  const ctx = await getFullUserContext();
  if (!ctx) return { error: "Not authenticated", data: [] };
  if (ctx.appRole !== "app_admin" && ctx.membership?.role !== "admin") {
    return { error: "Unauthorized", data: [] };
  }

  const db = createServiceRoleClient();

  const { data, error } = await db
    .from("profiles")
    .select("id, full_name, app_role, onboarded, created_at")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function assignUserToOrg(
  userId: string,
  orgId: string,
  role: "admin" | "member"
) {
  // Allow app admins, or org admins assigning to their own org
  const ctx = await getFullUserContext();
  if (!ctx) return { error: "Not authenticated" };
  if (ctx.appRole !== "app_admin" && ctx.membership?.orgId !== orgId) {
    return { error: "Unauthorized: you can only add users to your own organization" };
  }
  if (ctx.appRole !== "app_admin" && ctx.membership?.role !== "admin") {
    return { error: "Unauthorized: admin access required" };
  }

  const db = createServiceRoleClient();

  const { error } = await db.from("organization_members").upsert(
    {
      organization_id: orgId,
      user_id: userId,
      role,
    },
    { onConflict: "organization_id,user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/app/admin");
  return { success: true };
}

export async function removeUserFromOrg(userId: string, orgId: string) {
  // Allow app admins or org admins removing from their own org
  const ctx = await getFullUserContext();
  if (!ctx) return { error: "Not authenticated" };
  if (ctx.appRole !== "app_admin" && ctx.membership?.orgId !== orgId) {
    return { error: "Unauthorized" };
  }
  if (ctx.appRole !== "app_admin" && ctx.membership?.role !== "admin") {
    return { error: "Unauthorized: admin access required" };
  }
  const db = createServiceRoleClient();

  const { error } = await db
    .from("organization_members")
    .delete()
    .eq("user_id", userId)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };

  revalidatePath("/app/admin");
  return { success: true };
}

export async function getAdminLevel(): Promise<{
  level: "app_admin" | "org_admin" | null;
  hasOrg: boolean;
  orgId: string | null;
}> {
  const ctx = await getFullUserContext();
  if (!ctx) return { level: null, hasOrg: false, orgId: null };

  const hasOrg = !!ctx.membership;
  const orgId = ctx.membership?.orgId || null;

  if (ctx.appRole === "app_admin") return { level: "app_admin", hasOrg, orgId };
  if (ctx.membership?.role === "admin") return { level: "org_admin", hasOrg, orgId };

  return { level: null, hasOrg: false, orgId: null };
}

// ─── Organization Detail Actions ─────────────────────────────────────────────
// These accept an explicit orgId so app admins can manage any org.

export async function getOrganization(orgId: string) {
  const ctx = await getFullUserContext();
  if (!ctx) return { error: "Not authenticated", data: null };

  // App admins can view any org; org admins can only view their own
  if (ctx.appRole !== "app_admin" && ctx.membership?.orgId !== orgId) {
    return { error: "Unauthorized", data: null };
  }

  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  if (error) return { error: error.message, data: null };
  return { data };
}

export async function getOrgMembersForOrg(orgId: string) {
  const ctx = await getFullUserContext();
  if (!ctx) return { error: "Not authenticated", data: [] };
  if (ctx.appRole !== "app_admin" && ctx.membership?.orgId !== orgId) {
    return { error: "Unauthorized", data: [] };
  }

  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("organization_members")
    .select("user_id, role, profiles:user_id (id, full_name, username)")
    .eq("organization_id", orgId);

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function getClientsForOrg(orgId: string) {
  const ctx = await getFullUserContext();
  if (!ctx) return { error: "Not authenticated", data: [] };
  if (ctx.appRole !== "app_admin" && ctx.membership?.orgId !== orgId) {
    return { error: "Unauthorized", data: [] };
  }

  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("clients")
    .select("*")
    .eq("org_id", orgId)
    .order("name");

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function createClientForOrg(orgId: string, formData: FormData) {
  const ctx = await getFullUserContext();
  if (!ctx) return { error: "Not authenticated" };
  if (ctx.appRole !== "app_admin" && ctx.membership?.orgId !== orgId) {
    return { error: "Unauthorized" };
  }

  const db = createServiceRoleClient();
  const { error } = await db.from("clients").insert({
    org_id: orgId,
    name: formData.get("name") as string,
    industry: (formData.get("industry") as string) || null,
    primary_contact: (formData.get("primary_contact") as string) || null,
    contact_email: (formData.get("contact_email") as string) || null,
    notes: (formData.get("notes") as string) || null,
    status: (formData.get("status") as string) || "active",
    created_by: ctx.user.id,
  });

  if (error) return { error: error.message };
  revalidatePath(`/app/admin/organizations/${orgId}`);
  return { success: true };
}

export async function updateMemberRole(
  orgId: string,
  userId: string,
  role: "admin" | "member"
) {
  const ctx = await getFullUserContext();
  if (!ctx) return { error: "Not authenticated" };
  if (ctx.appRole !== "app_admin" && ctx.membership?.orgId !== orgId) {
    return { error: "Unauthorized" };
  }

  const db = createServiceRoleClient();
  const { error } = await db
    .from("organization_members")
    .update({ role })
    .eq("organization_id", orgId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  revalidatePath(`/app/admin/organizations/${orgId}`);
  return { success: true };
}

export async function removeMemberFromOrg(orgId: string, userId: string) {
  const ctx = await getFullUserContext();
  if (!ctx) return { error: "Not authenticated" };
  if (ctx.appRole !== "app_admin" && ctx.membership?.orgId !== orgId) {
    return { error: "Unauthorized" };
  }

  const db = createServiceRoleClient();
  const { error } = await db
    .from("organization_members")
    .delete()
    .eq("organization_id", orgId)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  revalidatePath(`/app/admin/organizations/${orgId}`);
  return { success: true };
}

export async function getClientMembersForOrg(orgId: string, clientId: string) {
  const ctx = await getFullUserContext();
  if (!ctx) return { error: "Not authenticated", data: [] };
  if (ctx.appRole !== "app_admin" && ctx.membership?.orgId !== orgId) {
    return { error: "Unauthorized", data: [] };
  }

  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("client_members")
    .select("client_id, user_id, role, profiles:user_id (id, full_name, username)")
    .eq("client_id", clientId);

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}
