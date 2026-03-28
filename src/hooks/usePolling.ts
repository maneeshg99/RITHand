"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook that polls a fetch function on an interval.
 * Pauses polling when the tab is hidden and resumes when visible.
 *
 * @param fetchFn - The async function to call
 * @param intervalMs - Polling interval in milliseconds (default: 1 hour)
 */
export function usePolling(
  fetchFn: () => Promise<void>,
  intervalMs: number = 3_600_000
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchRef = useRef(fetchFn);

  // Keep the ref up to date
  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      fetchRef.current();
    }, intervalMs);
  }, [intervalMs]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchRef.current();

    // Start polling
    startPolling();

    // Pause/resume on visibility change
    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Fetch immediately when tab becomes visible again
        fetchRef.current();
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [startPolling, stopPolling]);
}
