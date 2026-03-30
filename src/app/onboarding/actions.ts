"use server";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getOrgMembership } from "@/lib/auth/roles";

export async function completeOnboarding(selectedVendorIds: string[]) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated" };
  }

  const db = createServiceRoleClient();

  // Mark profile as onboarded
  await db
    .from("profiles")
    .update({ onboarded: true })
    .eq("id", user.id);

  // Store vendor preferences in localStorage via redirect
  // (The actual vendor selection state is managed client-side in AppContext)

  // Check if user has an org membership
  const membership = await getOrgMembership(user.id);

  if (membership) {
    // If they have a vendor list, save org vendors
    if (selectedVendorIds.length > 0) {
      const vendorInserts = selectedVendorIds.map((vendorId) => ({
        organization_id: membership.orgId,
        vendor_id: vendorId,
      }));

      await db
        .from("organization_vendors")
        .upsert(vendorInserts, { onConflict: "organization_id,vendor_id" });
    }

    redirect("/app");
  } else {
    // No org — go to pending page
    redirect("/pending");
  }
}
