"use client";

import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import type { Vendor } from "@/data/vendors";
import { Check, Plus, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface VendorCardProps {
  vendor: Vendor;
}

export function VendorCard({ vendor }: VendorCardProps) {
  const { isVendorSelected, toggleVendor } = useApp();
  const selected = isVendorSelected(vendor.id);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => toggleVendor(vendor.id)}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-all cursor-pointer",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-muted-foreground/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Vendor Logo */}
          <div className="shrink-0 w-9 h-9 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            {!imgError ? (
              <img
                src={vendor.logoUrl}
                alt={`${vendor.name} logo`}
                className="w-7 h-7 object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <Building2 className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-card-foreground">{vendor.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{vendor.description}</p>
          </div>
        </div>
        <div
          className={cn(
            "shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {selected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </div>
      </div>
    </motion.button>
  );
}
