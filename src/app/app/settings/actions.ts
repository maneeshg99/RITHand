"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, getEffectiveRole } from "@/lib/auth/roles";
import type { EffectiveRole } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

/**
 * Switch the current user's role for testing.
 * Uses service role client to bypass RLS.
 */
export async function switchTestRole(targetRole: EffectiveRole) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Not authenticated" };

  const db = createServiceRoleClient();

  switch (targetRole) {
    case "app_admin":
      await db
        .from("profiles")
        .update({ app_role: "app_admin" })
        .eq("id", user.id);
      await db
        .from("organization_members")
        .update({ role: "admin" })
        .eq("user_id", user.id);
      break;
    case "org_admin":
      await db
        .from("profiles")
        .update({ app_role: null })
        .eq("id", user.id);
      await db
        .from("organization_members")
        .update({ role: "admin" })
        .eq("user_id", user.id);
      break;
    case "org_user":
      await db
        .from("profiles")
        .update({ app_role: null })
        .eq("id", user.id);
      await db
        .from("organization_members")
        .update({ role: "member" })
        .eq("user_id", user.id);
      break;
  }

  revalidatePath("/app", "layout");
  return { success: true };
}

export async function getCurrentRole(): Promise<{
  role: EffectiveRole | null;
  error?: string;
}> {
  const role = await getEffectiveRole();
  return { role };
}
