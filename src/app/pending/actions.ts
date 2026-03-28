"use server";

import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

/**
 * Bootstrap the current user as app admin.
 * Uses the service role key to bypass RLS entirely.
 * This is for test environments only.
 */
export async function bootstrapAsAppAdmin() {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Not authenticated" };

  // Use service role client to bypass RLS
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await adminClient
    .from("profiles")
    .update({ app_role: "app_admin" })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}
