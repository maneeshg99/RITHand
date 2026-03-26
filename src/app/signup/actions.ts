"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(
  fullName: string,
  email: string,
  password: string,
  organizationName: string
) {
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        organization_name: organizationName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/onboarding");
}
