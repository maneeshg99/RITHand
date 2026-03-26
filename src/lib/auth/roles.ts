import { createServerSupabaseClient } from "@/lib/supabase/server";

export type OrgRole = "admin" | "member";
export type ClientRole = "editor" | "viewer";

/**
 * Get the current user's organization membership.
 * Returns null if the user is not in any organization.
 */
export async function getCurrentUserOrgMembership() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;

  return {
    userId: user.id,
    orgId: data.organization_id as string,
    role: data.role as OrgRole,
  };
}

/**
 * Check if the current user is an org admin.
 */
export async function isCurrentUserOrgAdmin(): Promise<boolean> {
  const membership = await getCurrentUserOrgMembership();
  return membership?.role === "admin";
}

/**
 * Get the current user's role on a specific client.
 * Returns null if the user has no access to that client.
 * Org admins always get "admin" back (they can do everything).
 */
export async function getClientRoleForCurrentUser(
  clientId: string
): Promise<"admin" | ClientRole | null> {
  const membership = await getCurrentUserOrgMembership();
  if (!membership) return null;

  // Org admins have full access to all clients
  if (membership.role === "admin") return "admin";

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("client_members")
    .select("role")
    .eq("client_id", clientId)
    .eq("user_id", membership.userId)
    .single();

  if (error || !data) return null;
  return data.role as ClientRole;
}

/**
 * Require the current user to be an org admin.
 * Throws an error if not — use in Server Actions/API routes.
 */
export async function requireOrgAdmin() {
  const membership = await getCurrentUserOrgMembership();
  if (!membership || membership.role !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }
  return membership;
}

/**
 * Require the current user to have at least viewer access to a client.
 * Returns the user's effective role.
 */
export async function requireClientAccess(clientId: string) {
  const role = await getClientRoleForCurrentUser(clientId);
  if (!role) {
    throw new Error("Unauthorized: no access to this client");
  }
  return role;
}

/**
 * Require the current user to have editor access to a client.
 */
export async function requireClientEditor(clientId: string) {
  const role = await getClientRoleForCurrentUser(clientId);
  if (!role || role === "viewer") {
    throw new Error("Unauthorized: editor access required");
  }
  return role;
}
