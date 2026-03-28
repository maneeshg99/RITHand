"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

/**
 * Bootstrap the current user as app admin.
 * This is for test environments only — allows the first user
 * to become an app admin when no other admin exists.
 */
export async function bootstrapAsAppAdmin() {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = await createServerSupabaseClient();

  // Set app_role to app_admin on the user's profile
  const { error } = await supabase
    .from("profiles")
    .update({ app_role: "app_admin" })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}
