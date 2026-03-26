"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { vendors } from "@/data/vendors";
import { VendorCard } from "@/components/VendorCard";
import { Shield, ChevronRight, CheckCircle, ArrowRight } from "lucide-react";
import { createOrganization } from "./actions";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [organizationName, setOrganizationName] = useState("");
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const toggleVendor = (vendorId: string) => {
    const newSelected = new Set(selectedVendors);
    if (newSelected.has(vendorId)) {
      newSelected.delete(vendorId);
    } else {
      newSelected.add(vendorId);
    }
    setSelectedVendors(newSelected);
  };

  const handleStep1Submit = async () => {
    if (!organizationName.trim()) {
      setError("Organization name is required");
      return;
    }

    setError("");
    setStep(2);
  };

  const handleStep2Submit = () => {
    setError("");
    setStep(3);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError("");

    const result = await createOrganization(organizationName, Array.from(selectedVendors));

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, the action will redirect
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-bold text-white">RITHand</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Step {step} of 3</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-blue-600" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Step 1: Organization Name */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Let's set up your organization
              </h1>
              <p className="text-slate-400">
                What's the name of your organization or MSP?
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Acme IT Solutions"
              className="w-full max-w-md px-4 py-3 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-lg"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleStep1Submit();
                }
              }}
            />

            <button
              onClick={handleStep1Submit}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Select Vendors */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Select your vendors
              </h1>
              <p className="text-slate-400">
                Choose the vendors you use. You can add more later.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((vendor) => (
                <button
                  key={vendor.id}
                  onClick={() => toggleVendor(vendor.id)}
                  className={`p-4 rounded-lg border transition text-left ${
                    selectedVendors.has(vendor.id)
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{vendor.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{vendor.category}</p>
                    </div>
                    {selectedVendors.has(vendor.id) && (
                      <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-slate-600 hover:border-slate-400 text-white rounded-lg font-medium transition"
              >
                Back
              </button>
              <button
                onClick={handleStep2Submit}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
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
              <h1 className="text-3xl font-bold text-white mb-2">
                You're all set!
              </h1>
              <p className="text-slate-400">
                Your organization "{organizationName}" is ready. Let's get started.
              </p>
            </div>

            <div className="space-y-3 bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Organization created</p>
                  <p className="text-sm text-slate-400">{organizationName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Vendors selected</p>
                  <p className="text-sm text-slate-400">
                    {selectedVendors.size} vendor{selectedVendors.size !== 1 ? "s" : ""} added
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-slate-600 hover:border-slate-400 text-white rounded-lg font-medium transition"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:cursor-not-allowed"
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
