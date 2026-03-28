"use client";

import { useState } from "react";
import { vendors } from "@/data/vendors";
import { Shield, ChevronRight, CheckCircle, ArrowRight, Building2 } from "lucide-react";
import { completeOnboarding } from "./actions";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

const vendorCategories = [...new Set(vendors.map((v) => v.category))];

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleVendor = (vendorId: string) => {
    const newSelected = new Set(selectedVendors);
    if (newSelected.has(vendorId)) {
      newSelected.delete(vendorId);
    } else {
      newSelected.add(vendorId);
    }
    setSelectedVendors(newSelected);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError("");

    const result = await completeOnboarding(Array.from(selectedVendors));

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, the action will redirect
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">RITHand</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Step {step} of 3</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="border-b border-border bg-card/50 px-4 py-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  s <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to RITHand
              </h1>
              <p className="text-muted-foreground">
                Let&apos;s get your account set up. We&apos;ll start by selecting
                the vendors in your technology stack so we can personalize your
                experience.
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">
                What you&apos;ll get:
              </p>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Personalized vendor news and updates</li>
                <li>Security vulnerability tracking</li>
                <li>Task and client management</li>
                <li>Compliance assessments</li>
              </ul>
            </div>

            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-lg font-medium transition flex items-center gap-2"
            >
              Get Started
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Select Vendors */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Select your vendors
              </h1>
              <p className="text-muted-foreground">
                Choose the vendors in your stack. You can always change these
                later.
              </p>
            </div>

            {vendorCategories.map((category) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
                  {vendors
                    .filter((v) => v.category === category)
                    .map((vendor) => {
                      const selected = selectedVendors.has(vendor.id);
                      return (
                        <button
                          key={vendor.id}
                          onClick={() => toggleVendor(vendor.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                            selected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/30"
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {vendor.logoUrl ? (
                              <img
                                src={vendor.logoUrl}
                                alt={vendor.name}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                  (
                                    e.target as HTMLImageElement
                                  ).nextElementSibling?.classList.remove(
                                    "hidden"
                                  );
                                }}
                              />
                            ) : null}
                            <Building2
                              className={cn(
                                "h-4 w-4 text-muted-foreground",
                                vendor.logoUrl && "hidden"
                              )}
                            />
                          </div>
                          <span className="text-xs font-medium text-foreground text-center leading-tight">
                            {vendor.name}
                          </span>
                          {selected ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <span className="text-[10px] text-muted-foreground">
                              + Add
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-4 sticky bottom-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-border hover:bg-muted text-foreground rounded-lg font-medium transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-lg font-medium transition flex items-center gap-2"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6 max-w-md">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                You&apos;re all set!
              </h1>
              <p className="text-muted-foreground">
                Your preferences have been saved. Let&apos;s get started.
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Account ready</p>
                  <p className="text-sm text-muted-foreground">
                    Your profile has been set up
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">
                    Vendors selected
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedVendors.size} vendor
                    {selectedVendors.size !== 1 ? "s" : ""} added
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-border hover:bg-muted text-foreground rounded-lg font-medium transition"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="px-6 py-3 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-lg font-medium transition flex items-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? "Setting up..." : "Go to Dashboard"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
