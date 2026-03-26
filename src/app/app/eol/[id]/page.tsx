"use client";

import { useParams } from "next/navigation";
import { eolProducts } from "@/data/compliance";
import { vendors } from "@/data/vendors";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import {
  FileWarning,
  ArrowLeft,
  ExternalLink,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import Link from "next/link";

export default function EolDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const { userEolItems } = useApp();
  const allEolItems = [...eolProducts, ...userEolItems];
  const eol = allEolItems.find((e) => e.id === id);

  if (!eol) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <FileWarning className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-xl font-bold text-foreground mb-2">EOL Item Not Found</h1>
          <p className="text-muted-foreground text-sm mb-4">
            This EOL record doesn&apos;t exist or may have been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const vendor = vendors.find((v) => v.id === eol.vendorId);
  const eolDate = new Date(eol.eolDate);
  const eosDate = new Date(eol.eosDate);
  const today = new Date();
  const daysUntilEol = Math.ceil((eolDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isPastEol = daysUntilEol <= 0;

  const statusColor = isPastEol
    ? "text-red-600 bg-red-50 border-red-200"
    : daysUntilEol <= 90
    ? "text-red-600 bg-red-50 border-red-200"
    : daysUntilEol <= 365
    ? "text-yellow-700 bg-yellow-50 border-yellow-200"
    : "text-green-700 bg-green-50 border-green-200";

  const replacementOptions = eol.remediationOptions.filter((r) => r.type === "replacement");
  const supportOptions = eol.remediationOptions.filter((r) => r.type === "eol-support");

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileWarning className="h-5 w-5 text-orange-500" />
            <div>
              <h1 className="text-lg font-bold text-foreground">{eol.product}</h1>
              {vendor && (
                <p className="text-sm text-muted-foreground">{vendor.name}</p>
              )}
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">

        {/* Status Banner */}
        <div className={cn("rounded-xl border px-4 py-3 flex items-center gap-3", statusColor)}>
          {isPastEol ? (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          ) : daysUntilEol <= 365 ? (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          ) : (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          )}
          <div>
            <p className="text-sm font-semibold">
              {isPastEol
                ? "This product has reached end-of-life"
                : `End-of-life in ${daysUntilEol} day${daysUntilEol !== 1 ? "s" : ""}`}
            </p>
            <p className="text-xs mt-0.5">
              {isPastEol
                ? "Immediate action is recommended. Continued use introduces security and support risk."
                : "Plan your migration or support renewal before the EOL date to avoid service disruption."}
            </p>
          </div>
        </div>

        {/* EOL Details */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Product Details</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Product</p>
              <p className="font-medium text-foreground">{eol.product}</p>
            </div>
            {vendor && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Vendor</p>
                <p className="font-medium text-foreground">{vendor.name}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> End-of-Life Date
              </p>
              <p className={cn("font-medium", isPastEol ? "text-red-600" : "text-foreground")}>
                {eolDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> End-of-Support Date
              </p>
              <p className="font-medium text-foreground">
                {eosDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Affected Assets</p>
              <p className="font-medium text-foreground">
                {eol.affectedAssets} asset{eol.affectedAssets !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Replacement Options */}
        {replacementOptions.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-foreground">Replacement Options</h2>
            </div>
            <div className="space-y-3">
              {replacementOptions.map((opt, i) => (
                <div key={i} className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                        Replacement
                      </span>
                      <span className="text-sm font-medium text-foreground">{opt.title}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">{opt.description}</p>
                  {opt.url && (
                    <a
                      href={opt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View vendor page
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EOL Support Options */}
        {supportOptions.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-semibold text-foreground">Extended Support Options</h2>
            </div>
            <div className="space-y-3">
              {supportOptions.map((opt, i) => (
                <div key={i} className="rounded-lg border border-orange-100 bg-orange-50/40 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                      EOL Support
                    </span>
                    <span className="text-sm font-medium text-foreground">{opt.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">{opt.description}</p>
                  {opt.url && (
                    <a
                      href={opt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View support details
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-xs text-muted-foreground text-center pb-4">
          All information on this page was entered manually. Verify details directly with the vendor before taking action.
        </p>
      </div>
    </div>
  );
}
