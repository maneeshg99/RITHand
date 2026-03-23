"use client";

import { useApp } from "@/context/AppContext";
import { vendors } from "@/data/vendors";
import { Settings, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { selectedVendorIds } = useApp();

  const handleClearData = () => {
    if (confirm("This will clear all your saved preferences, bookmarks, and read states. Continue?")) {
      localStorage.removeItem("rithand_state");
      window.location.reload();
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your preferences</p>
      </div>

      <div className="space-y-6">
        {/* Summary */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Account Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg bg-muted p-3">
              <div className="text-2xl font-bold text-foreground">{selectedVendorIds.length}</div>
              <div className="text-muted-foreground">Vendors tracked</div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="text-2xl font-bold text-foreground">
                {vendors.length}
              </div>
              <div className="text-muted-foreground">Available vendors</div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="text-2xl font-bold text-foreground">v0.1</div>
              <div className="text-muted-foreground">POC Version</div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-xl border border-destructive/30 bg-card p-5">
          <h2 className="text-base font-semibold text-destructive mb-3 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Clear all local data including vendor selections, bookmarks, and read states.
          </p>
          <button
            onClick={handleClearData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All Data
          </button>
        </section>

        {/* About */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-card-foreground mb-2">About RITHand</h2>
          <p className="text-sm text-muted-foreground">
            <strong>RITHand (Right IT Hand)</strong> is a vendor intelligence dashboard for IT Directors,
            vCIOs, and vCISOs. It aggregates news, security advisories, and updates from the technology
            vendors in your stack — so you never miss what matters.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            POC v0.1 — Mock data only. Live integrations coming in Phase 2.
          </p>
        </section>
      </div>
    </div>
  );
}
