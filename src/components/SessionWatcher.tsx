"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SessionWatcher() {
  const [showWarning, setShowWarning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/");
      }
      if (event === "TOKEN_REFRESHED") {
        setShowWarning(false);
      }
    });

    // Check session periodically (every 5 minutes)
    const interval = setInterval(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setShowWarning(true);
      } else {
        // Check if session expires within 5 minutes
        const expiresAt = session.expires_at;
        if (expiresAt) {
          const now = Math.floor(Date.now() / 1000);
          const timeLeft = expiresAt - now;
          if (timeLeft < 300) {
            setShowWarning(true);
          }
        }
      }
    }, 300_000); // 5 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [router]);

  const handleRefresh = async () => {
    const supabase = createClient();
    await supabase.auth.refreshSession();
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 shadow-lg [data-theme='dark']:bg-yellow-900/30 [data-theme='dark']:border-yellow-800">
        <p className="text-sm font-medium text-yellow-800 [data-theme='dark']:text-yellow-300">
          Your session is about to expire
        </p>
        <p className="text-xs text-yellow-700 mt-1 [data-theme='dark']:text-yellow-400">
          Click below to stay signed in.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 text-xs font-medium rounded bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
          >
            Stay Signed In
          </button>
          <button
            onClick={() => setShowWarning(false)}
            className="px-3 py-1.5 text-xs font-medium rounded border border-yellow-300 text-yellow-700 hover:bg-yellow-100 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
