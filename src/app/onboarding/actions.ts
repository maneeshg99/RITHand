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
    // Use the bootstrap_organization RPC function which runs as SECURITY DEFINER
    // This bypasses RLS so the first user can create their org + become admin
    const { data: orgId, error: rpcError } = await supabase.rpc(
      "bootstrap_organization",
      {
        org_name: organizationName,
        vendor_ids: selectedVendorIds,
      }
    );

    if (rpcError) {
      // If the RPC doesn't exist yet (migration not run), fall back to direct inserts
      if (rpcError.message.includes("does not exist")) {
        return await createOrganizationFallback(
          supabase,
          user.id,
          organizationName,
          selectedVendorIds
        );
      }
      return { error: rpcError.message };
    }

    if (!orgId) {
      return { error: "Failed to create organization" };
    }

    // Redirect to dashboard
    redirect("/app");
  } catch (error) {
    // redirect() throws a special error in Next.js — let it propagate
    if (
      error instanceof Error &&
      error.message === "NEXT_REDIRECT"
    ) {
      throw error;
    }
    return {
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Fallback for when bootstrap_organization RPC doesn't exist
async function createOrganizationFallback(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
  organizationName: string,
  selectedVendorIds: string[]
) {
  // Create organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: organizationName })
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
      user_id: userId,
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

    await supabase.from("organization_vendors").insert(vendorInserts);
  }

  redirect("/app");
}
