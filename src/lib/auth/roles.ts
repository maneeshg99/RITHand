import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

export type OrgRole = "admin" | "member";
export type ClientRole = "editor" | "viewer";
export type EffectiveRole = "app_admin" | "org_admin" | "org_user";

// ─── Low-level auth helpers ──────────────────────────────────────────────────

/**
 * Get the currently authenticated Supabase user.
 * Returns null if not logged in.
 */
export async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Check if the current user is an app-level admin.
 * Uses service role client to bypass RLS on profiles.
 */
export async function isAppAdmin(): Promise<boolean> {
  const user = await getAuthenticatedUser();
  if (!user) return false;

  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .single();

  return data?.app_role === "app_admin";
}

/**
 * Get the current user's organization membership.
 * Returns null if the user is not in any organization.
 * Uses service role client to bypass RLS (avoids recursion from is_app_admin policies).
 */
export async function getOrgMembership(userId: string) {
  const admin = createServiceRoleClient();

  const { data, error } = await admin
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    userId,
    orgId: data.organization_id as string,
    role: data.role as OrgRole,
  };
}

/**
 * Combined helper: get auth user + org membership + app role.
 * Returns null if not authenticated.
 * Returns { user, membership: null, appRole } if authenticated but no org.
 * Uses service role client to read app_role (avoids RLS recursion).
 */
export async function getFullUserContext() {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  // Read app_role with service role client to bypass RLS
  const admin = createServiceRoleClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .single();

  const membership = await getOrgMembership(user.id);
  const appRole = profile?.app_role as "app_admin" | null;

  return { user, membership, appRole };
}

/**
 * Get the current user's effective role for display purposes.
 */
export async function getEffectiveRole(): Promise<EffectiveRole | null> {
  const ctx = await getFullUserContext();
  if (!ctx) return null;

  if (ctx.appRole === "app_admin") return "app_admin";
  if (ctx.membership?.role === "admin") return "org_admin";
  if (ctx.membership) return "org_user";
  return null;
}

// ─── Legacy-compatible wrappers ──────────────────────────────────────────────

/**
 * Get the current user's organization membership.
 * Returns null if the user is not authenticated OR not in any org.
 */
export async function getCurrentUserOrgMembership() {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  return getOrgMembership(user.id);
}

/**
 * Check if the current user is an org admin (or app admin).
 */
export async function isCurrentUserOrgAdmin(): Promise<boolean> {
  const ctx = await getFullUserContext();
  if (!ctx) return false;
  if (ctx.appRole === "app_admin") return true;
  return ctx.membership?.role === "admin";
}

/**
 * Check if the current user is any kind of admin (app or org).
 */
export async function isAnyAdmin(): Promise<boolean> {
  return isCurrentUserOrgAdmin();
}

// ─── Authorization guards ────────────────────────────────────────────────────

/**
 * Require the current user to be authenticated.
 * Throws if not logged in.
 */
export async function requireAuth() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

/**
 * Require the current user to be an app admin.
 */
export async function requireAppAdmin() {
  const user = await requireAuth();
  const admin = await isAppAdmin();
  if (!admin) {
    throw new Error("Unauthorized: app admin access required");
  }
  return user;
}

/**
 * Require the current user to be an org admin (or app admin).
 * Throws an error if not — use in Server Actions/API routes.
 * App admins without org membership get a synthetic membership object.
 */
export async function requireOrgAdmin() {
  const ctx = await getFullUserContext();
  if (!ctx) throw new Error("Not authenticated");

  // App admins always pass — return real membership or synthetic one
  if (ctx.appRole === "app_admin") {
    if (ctx.membership) return ctx.membership;
    // Synthetic membership for app admins with no org
    return { userId: ctx.user.id, orgId: "", role: "admin" as OrgRole };
  }

  if (!ctx.membership || ctx.membership.role !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }
  return ctx.membership;
}

/**
 * Get the current user's role on a specific client.
 * Returns null if the user has no access to that client.
 * Org admins and app admins always get "admin" back.
 */
export async function getClientRoleForCurrentUser(
  clientId: string
): Promise<"admin" | ClientRole | null> {
  const ctx = await getFullUserContext();
  if (!ctx || !ctx.membership) return null;

  // App admins and org admins have full access
  if (ctx.appRole === "app_admin" || ctx.membership.role === "admin")
    return "admin";

  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("client_members")
    .select("role")
    .eq("client_id", clientId)
    .eq("user_id", ctx.user.id)
    .single();

  if (error || !data) return null;
  return data.role as ClientRole;
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
