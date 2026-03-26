"use client";

import { useApp } from "@/context/AppContext";
import { vendors, vendorCategories } from "@/data/vendors";
import { VendorCard } from "@/components/VendorCard";
import { CheckCheck, XCircle } from "lucide-react";

export default function VendorsPage() {
  const { selectAllVendorsInCategory, deselectAllVendorsInCategory, selectedVendorIds } = useApp();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Vendors</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select the vendors you work with to personalize your news feed.
          <span className="font-medium text-foreground ml-1">
            {selectedVendorIds.length} selected
          </span>
        </p>
      </div>

      <div className="space-y-8">
        {vendorCategories.map((category) => {
          const categoryVendors = vendors.filter((v) => v.category === category);
          const categoryVendorIds = categoryVendors.map((v) => v.id);
          const allSelected = categoryVendorIds.every((id) => selectedVendorIds.includes(id));

          return (
            <section key={category}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">{category}</h2>
                <button
                  onClick={() =>
                    allSelected
                      ? deselectAllVendorsInCategory(categoryVendorIds)
                      : selectAllVendorsInCategory(categoryVendorIds)
                  }
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {allSelected ? (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <CheckCheck className="h-3.5 w-3.5" />
                      Select All
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryVendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
