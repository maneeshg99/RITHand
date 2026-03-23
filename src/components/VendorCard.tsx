"use client";

import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import type { Vendor } from "@/data/vendors";
import { Check, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface VendorCardProps {
  vendor: Vendor;
}

export function VendorCard({ vendor }: VendorCardProps) {
  const { isVendorSelected, toggleVendor } = useApp();
  const selected = isVendorSelected(vendor.id);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => toggleVendor(vendor.id)}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-all",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-muted-foreground/30"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-card-foreground">{vendor.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{vendor.description}</p>
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
