"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { EolProduct, CveAlert } from "@/data/compliance";

interface AppState {
  selectedVendorIds: string[];
  readNewsIds: string[];
  bookmarkedNewsIds: string[];
  // Compliance checklist state
  activeFrameworkIds: string[];
  checkedComplianceItems: Record<string, string[]>; // frameworkId -> checked item ids
  // User-entered EOL items (beyond template data)
  userEolItems: EolProduct[];
  // User-entered CVE alerts (beyond template data)
  userCveAlerts: CveAlert[];
}

interface AppContextType extends AppState {
  toggleVendor: (vendorId: string) => void;
  isVendorSelected: (vendorId: string) => boolean;
  markAsRead: (newsId: string) => void;
  toggleBookmark: (newsId: string) => void;
  isRead: (newsId: string) => boolean;
  isBookmarked: (newsId: string) => boolean;
  selectAllVendorsInCategory: (vendorIds: string[]) => void;
  deselectAllVendorsInCategory: (vendorIds: string[]) => void;
  // Compliance
  addFramework: (frameworkId: string) => void;
  removeFramework: (frameworkId: string) => void;
  toggleComplianceItem: (frameworkId: string, itemId: string) => void;
  isComplianceItemChecked: (frameworkId: string, itemId: string) => boolean;
  // EOL
  addUserEolItem: (item: EolProduct) => void;
  removeUserEolItem: (id: string) => void;
  // CVE
  addUserCveAlert: (alert: CveAlert) => void;
  removeUserCveAlert: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "rithand_state";

const defaultState: AppState = {
  selectedVendorIds: [],
  readNewsIds: [],
  bookmarkedNewsIds: [],
  activeFrameworkIds: [],
  checkedComplianceItems: {},
  userEolItems: [],
  userCveAlerts: [],
};

function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  } catch {
    return defaultState;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, hydrated]);

  const toggleVendor = useCallback((vendorId: string) => {
    setState((prev) => ({
      ...prev,
      selectedVendorIds: prev.selectedVendorIds.includes(vendorId)
        ? prev.selectedVendorIds.filter((id) => id !== vendorId)
        : [...prev.selectedVendorIds, vendorId],
    }));
  }, []);

  const isVendorSelected = useCallback(
    (vendorId: string) => state.selectedVendorIds.includes(vendorId),
    [state.selectedVendorIds]
  );

  const selectAllVendorsInCategory = useCallback((vendorIds: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedVendorIds: [...new Set([...prev.selectedVendorIds, ...vendorIds])],
    }));
  }, []);

  const deselectAllVendorsInCategory = useCallback((vendorIds: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedVendorIds: prev.selectedVendorIds.filter((id) => !vendorIds.includes(id)),
    }));
  }, []);

  const markAsRead = useCallback((newsId: string) => {
    setState((prev) => ({
      ...prev,
      readNewsIds: prev.readNewsIds.includes(newsId)
        ? prev.readNewsIds
        : [...prev.readNewsIds, newsId],
    }));
  }, []);

  const toggleBookmark = useCallback((newsId: string) => {
    setState((prev) => ({
      ...prev,
      bookmarkedNewsIds: prev.bookmarkedNewsIds.includes(newsId)
        ? prev.bookmarkedNewsIds.filter((id) => id !== newsId)
        : [...prev.bookmarkedNewsIds, newsId],
    }));
  }, []);

  const isRead = useCallback(
    (newsId: string) => state.readNewsIds.includes(newsId),
    [state.readNewsIds]
  );

  const isBookmarked = useCallback(
    (newsId: string) => state.bookmarkedNewsIds.includes(newsId),
    [state.bookmarkedNewsIds]
  );

  // Compliance
  const addFramework = useCallback((frameworkId: string) => {
    setState((prev) => ({
      ...prev,
      activeFrameworkIds: prev.activeFrameworkIds.includes(frameworkId)
        ? prev.activeFrameworkIds
        : [...prev.activeFrameworkIds, frameworkId],
    }));
  }, []);

  const removeFramework = useCallback((frameworkId: string) => {
    setState((prev) => {
      const { [frameworkId]: _removed, ...remainingChecked } = prev.checkedComplianceItems;
      return {
        ...prev,
        activeFrameworkIds: prev.activeFrameworkIds.filter((id) => id !== frameworkId),
        checkedComplianceItems: remainingChecked,
      };
    });
  }, []);

  const toggleComplianceItem = useCallback((frameworkId: string, itemId: string) => {
    setState((prev) => {
      const current = prev.checkedComplianceItems[frameworkId] ?? [];
      const updated = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];
      return {
        ...prev,
        checkedComplianceItems: {
          ...prev.checkedComplianceItems,
          [frameworkId]: updated,
        },
      };
    });
  }, []);

  const isComplianceItemChecked = useCallback(
    (frameworkId: string, itemId: string) =>
      (state.checkedComplianceItems[frameworkId] ?? []).includes(itemId),
    [state.checkedComplianceItems]
  );

  // EOL
  const addUserEolItem = useCallback((item: EolProduct) => {
    setState((prev) => ({
      ...prev,
      userEolItems: [...prev.userEolItems, item],
    }));
  }, []);

  const removeUserEolItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      userEolItems: prev.userEolItems.filter((e) => e.id !== id),
    }));
  }, []);

  // CVE
  const addUserCveAlert = useCallback((alert: CveAlert) => {
    setState((prev) => ({
      ...prev,
      userCveAlerts: [...prev.userCveAlerts, alert],
    }));
  }, []);

  const removeUserCveAlert = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      userCveAlerts: prev.userCveAlerts.filter((c) => c.id !== id),
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        toggleVendor,
        isVendorSelected,
        markAsRead,
        toggleBookmark,
        isRead,
        isBookmarked,
        selectAllVendorsInCategory,
        deselectAllVendorsInCategory,
        addFramework,
        removeFramework,
        toggleComplianceItem,
        isComplianceItemChecked,
        addUserEolItem,
        removeUserEolItem,
        addUserCveAlert,
        removeUserCveAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
