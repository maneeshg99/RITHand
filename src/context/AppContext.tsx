"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AppState {
  selectedVendorIds: string[];
  readNewsIds: string[];
  bookmarkedNewsIds: string[];
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "rithand_state";

const defaultState: AppState = {
  selectedVendorIds: [],
  readNewsIds: [],
  bookmarkedNewsIds: [],
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
