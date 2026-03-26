"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/** Resolves a username to its email. If the input already looks like an
 *  email address it is returned as-is. Otherwise we look up the username
 *  in the profiles table and return the matching auth.users email. */
async function resolveEmail(emailOrUsername: string): Promise<string | null> {
  // Simple heuristic — real emails always contain "@"
  if (emailOrUsername.includes("@")) return emailOrUsername;

  const supabase = await createServerSupabaseClient();

  // profiles.id == auth.users.id, so join through to get the email
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", emailOrUsername.toLowerCase().trim())
    .single();

  if (error || !data) return null;

  // Fetch the email from auth.users via the admin client isn't available
  // from the anon key, so we store it in raw_user_meta_data at signup.
  // Fall back: query auth schema directly isn't possible client-side.
  // Instead, we rely on the service-role admin client.
  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: userData, error: userError } =
    await admin.auth.admin.getUserById(data.id);

  if (userError || !userData?.user?.email) return null;
  return userData.user.email;
}

export async function signIn(emailOrUsername: string, password: string) {
  const supabase = await createServerSupabaseClient();

  const email = await resolveEmail(emailOrUsername);
  if (!email) {
    return { error: "No account found for that email or username." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/app");
}

export async function signInWithMagicLink(emailOrUsername: string) {
  const email = await resolveEmail(emailOrUsername);
  if (!email) {
    return { error: "No account found for that email or username." };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
