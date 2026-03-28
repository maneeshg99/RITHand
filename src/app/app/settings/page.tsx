"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { vendors } from "@/data/vendors";
import {
  Settings,
  Trash2,
  Shield,
  User,
  Building2,
  Wrench,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { switchTestRole, getCurrentRole } from "./actions";
import type { EffectiveRole } from "@/lib/auth/roles";

const roleOptions: {
  value: EffectiveRole;
  label: string;
  description: string;
  icon: typeof Shield;
}[] = [
  {
    value: "app_admin",
    label: "App Admin",
    description: "Full application access. Manage all organizations and users.",
    icon: Shield,
  },
  {
    value: "org_admin",
    label: "Org Admin",
    description:
      "Manage your organization's clients, users, and settings.",
    icon: Building2,
  },
  {
    value: "org_user",
    label: "Org User",
    description: "Access only assigned clients. Read and edit based on role.",
    icon: User,
  },
];

export default function SettingsPage() {
  const { selectedVendorIds } = useApp();
  const [currentRole, setCurrentRole] = useState<EffectiveRole | null>(null);
  const [switching, setSwitching] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [roleSuccess, setRoleSuccess] = useState(false);

  useEffect(() => {
    getCurrentRole().then((res) => {
      if (res.role) setCurrentRole(res.role);
    });
  }, []);

  const handleRoleSwitch = async (role: EffectiveRole) => {
    if (role === currentRole) return;
    setSwitching(true);
    setRoleError(null);
    setRoleSuccess(false);

    const result = await switchTestRole(role);
    if (result.error) {
      setRoleError(result.error);
    } else {
      setCurrentRole(role);
      setRoleSuccess(true);
      setTimeout(() => setRoleSuccess(false), 2000);
      // Force a full page reload to update layout and sidebar
      window.location.reload();
    }
    setSwitching(false);
  };

  const handleClearData = () => {
    if (
      confirm(
        "This will clear all your saved preferences, bookmarks, and read states. Continue?"
      )
    ) {
      localStorage.removeItem("rithand_state");
      window.location.reload();
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your preferences
        </p>
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
              <div className="text-2xl font-bold text-foreground">
                {selectedVendorIds.length}
              </div>
              <div className="text-muted-foreground">Vendors tracked</div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="text-2xl font-bold text-foreground">
                {vendors.length}
              </div>
              <div className="text-muted-foreground">Available vendors</div>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="text-2xl font-bold text-foreground">v0.2</div>
              <div className="text-muted-foreground">Version</div>
            </div>
          </div>
        </section>

        {/* Developer Tools — Role Switcher */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-card-foreground mb-1 flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Developer Tools
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Test environment only. Switch your access level to test different
            permission views.
          </p>

          {roleError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {roleError}
            </div>
          )}

          {roleSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
              <Check className="h-4 w-4" />
              Role switched successfully. Reloading...
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {roleOptions.map((option) => {
              const isActive = currentRole === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleRoleSwitch(option.value)}
                  disabled={switching || isActive}
                  className={cn(
                    "relative rounded-lg border p-4 text-left transition-all",
                    isActive
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/30",
                    switching && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  <Icon
                    className={cn(
                      "h-5 w-5 mb-2",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <div className="text-sm font-semibold text-foreground">
                    {option.label}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-xl border border-destructive/30 bg-card p-5">
          <h2 className="text-base font-semibold text-destructive mb-3 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Clear all local data including vendor selections, bookmarks, and read
            states.
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
          <h2 className="text-base font-semibold text-card-foreground mb-2">
            About RITHand
          </h2>
          <p className="text-sm text-muted-foreground">
            <strong>RITHand (Right IT Hand)</strong> is a vendor intelligence
            dashboard for IT Directors, vCIOs, and vCISOs. It aggregates news,
            security advisories, and updates from the technology vendors in your
            stack — so you never miss what matters.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            v0.2 — Test environment.
          </p>
        </section>
      </div>
    </div>
  );
}
