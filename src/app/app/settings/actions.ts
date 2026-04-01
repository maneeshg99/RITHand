"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, getOrgMembership, getEffectiveRole } from "@/lib/auth/roles";
import type { EffectiveRole } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

/**
 * Switch the current user's role for testing.
 * Uses service role client to bypass RLS.
 * Auto-assigns user to first available org if they have no membership.
 */
export async function switchTestRole(targetRole: EffectiveRole) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Not authenticated" };

  const db = createServiceRoleClient();

  // For org_admin and org_user, ensure user has an org membership
  if (targetRole === "org_admin" || targetRole === "org_user") {
    let membership = await getOrgMembership(user.id);

    if (!membership) {
      // Auto-assign to first available org
      const { data: orgs } = await db
        .from("organizations")
        .select("id")
        .limit(1)
        .single();

      if (!orgs) {
        return {
          error: `Cannot switch to ${targetRole}: no organizations exist. Create one from the Admin Panel first.`,
        };
      }

      // Insert the user into the org
      const { error: insertError } = await db
        .from("organization_members")
        .insert({
          organization_id: orgs.id,
          user_id: user.id,
          role: targetRole === "org_admin" ? "admin" : "member",
        });

      if (insertError) {
        return { error: `Failed to assign to org: ${insertError.message}` };
      }

      membership = await getOrgMembership(user.id);
      if (!membership) {
        return { error: "Failed to verify org membership after assignment." };
      }
    }
  }

  // Now apply the role change
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
