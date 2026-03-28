"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, getEffectiveRole } from "@/lib/auth/roles";
import type { EffectiveRole } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

export async function switchTestRole(targetRole: EffectiveRole) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = await createServerSupabaseClient();

  // Use the DB function for atomic role switching
  const { error } = await supabase.rpc("switch_test_role", {
    target_role: targetRole,
  });

  if (error) {
    // Fallback: do it manually if the function doesn't exist yet
    if (error.message.includes("does not exist")) {
      return await switchRoleManually(user.id, targetRole, supabase);
    }
    return { error: error.message };
  }

  revalidatePath("/app", "layout");
  return { success: true };
}

async function switchRoleManually(
  userId: string,
  targetRole: EffectiveRole,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
) {
  try {
    switch (targetRole) {
      case "app_admin":
        await supabase
          .from("profiles")
          .update({ app_role: "app_admin" })
          .eq("id", userId);
        await supabase
          .from("organization_members")
          .update({ role: "admin" })
          .eq("user_id", userId);
        break;
      case "org_admin":
        await supabase
          .from("profiles")
          .update({ app_role: null })
          .eq("id", userId);
        await supabase
          .from("organization_members")
          .update({ role: "admin" })
          .eq("user_id", userId);
        break;
      case "org_user":
        await supabase
          .from("profiles")
          .update({ app_role: null })
          .eq("id", userId);
        await supabase
          .from("organization_members")
          .update({ role: "member" })
          .eq("user_id", userId);
        break;
    }
    revalidatePath("/app", "layout");
    return { success: true };
  } catch {
    return { error: "Failed to switch role" };
  }
}

export async function getCurrentRole(): Promise<{
  role: EffectiveRole | null;
  error?: string;
}> {
  const role = await getEffectiveRole();
  return { role };
}
