"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createOrganization(
  organizationName: string,
  selectedVendorIds: string[]
) {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  try {
    // Create organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: organizationName,
      })
      .select()
      .single();

    if (orgError || !org) {
      return { error: orgError?.message || "Failed to create organization" };
    }

    // Create organization member (user as admin)
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: "admin",
      });

    if (memberError) {
      return { error: memberError.message };
    }

    // Add selected vendors
    if (selectedVendorIds.length > 0) {
      const vendorInserts = selectedVendorIds.map((vendorId) => ({
        organization_id: org.id,
        vendor_id: vendorId,
      }));

      const { error: vendorError } = await supabase
        .from("organization_vendors")
        .insert(vendorInserts);

      if (vendorError) {
        return { error: vendorError.message };
      }
    }

    // Redirect to dashboard
    redirect("/app");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
