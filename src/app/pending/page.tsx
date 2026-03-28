"use client";

import { Shield, Clock, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PendingPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">RITHand</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>

          <h1 className="text-xl font-semibold text-foreground mb-2">
            Waiting for Organization
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your account has been created, but you haven&apos;t been assigned to
            an organization yet. Please contact your administrator to be added.
          </p>

          <div className="rounded-lg bg-muted p-4 text-left text-sm text-muted-foreground mb-6">
            <p className="font-medium text-foreground mb-1">
              What happens next?
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Your admin will add you to an organization</li>
              <li>You&apos;ll be assigned to relevant clients</li>
              <li>You can then access the full dashboard</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.refresh()}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Check Again
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
