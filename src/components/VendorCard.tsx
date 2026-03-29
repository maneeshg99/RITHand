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
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => toggleVendor(vendor.id)}
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border p-5 transition-all cursor-pointer w-full",
        selected
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
          : "border-border bg-card hover:border-primary/30 hover:bg-accent/30 hover:shadow-sm"
      )}
    >
      {/* Vendor Logo */}
      <div
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden transition-colors",
          selected ? "bg-primary/10" : "bg-muted"
        )}
      >
        {!imgError ? (
          <img
            src={vendor.logoUrl}
            alt={`${vendor.name} logo`}
            className="w-10 h-10 object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <Building2
            className={cn(
              "h-6 w-6",
              selected ? "text-primary" : "text-muted-foreground"
            )}
          />
        )}
      </div>

      {/* Vendor Name */}
      <span
        className={cn(
          "text-sm font-semibold text-center leading-tight",
          selected ? "text-primary" : "text-card-foreground"
        )}
      >
        {vendor.name}
      </span>

      {/* Add/Remove Button */}
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {selected ? (
          <>
            <Check className="h-3 w-3" />
            Added
          </>
        ) : (
          <>
            <Plus className="h-3 w-3" />
            Add
          </>
        )}
      </div>
    </motion.button>
  );
}
