"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireOrgAdmin } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

// ─── Client CRUD ──────────────────────────────────────────────────────────────

export async function createClient(formData: FormData) {
  const { orgId } = await requireOrgAdmin();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("clients").insert({
    org_id: orgId,
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
  await requireOrgAdmin();
  const supabase = await createServerSupabaseClient();

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
    .eq("id", clientId);

  if (error) return { error: error.message };

  revalidatePath("/app/admin");
  revalidatePath(`/app/admin/clients/${clientId}`);
  return { success: true };
}

export async function deleteClient(clientId: string) {
  await requireOrgAdmin();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId);

  if (error) return { error: error.message };

  revalidatePath("/app/admin");
  return { success: true };
}

// ─── Client Member Management ─────────────────────────────────────────────────

export async function assignUserToClient(
  clientId: string,
  userId: string,
  role: "editor" | "viewer"
) {
  const { userId: adminId } = await requireOrgAdmin();
  const supabase = await createServerSupabaseClient();

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
  const supabase = await createServerSupabaseClient();

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
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("client_members")
    .delete()
    .eq("client_id", clientId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath(`/app/admin/clients/${clientId}`);
  return { success: true };
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

export async function getClients() {
  await requireOrgAdmin();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function getClient(clientId: string) {
  await requireOrgAdmin();
  const supabase = await createServerSupabaseClient();

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
  const supabase = await createServerSupabaseClient();

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
  await requireOrgAdmin();
  const supabase = await createServerSupabaseClient();

  // Get the admin's org
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", data: [] };

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) return { error: "No org found", data: [] };

  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `
      user_id,
      role,
      profiles:user_id (id, full_name, username)
    `
    )
    .eq("organization_id", membership.organization_id);

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}
