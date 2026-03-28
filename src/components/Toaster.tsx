"use client";

import { useToast } from "@/context/ToastContext";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colorMap = {
  success:
    "bg-green-50 border-green-200 text-green-800 [data-theme='dark']:bg-green-900/30 [data-theme='dark']:border-green-800 [data-theme='dark']:text-green-300",
  error:
    "bg-red-50 border-red-200 text-red-800 [data-theme='dark']:bg-red-900/30 [data-theme='dark']:border-red-800 [data-theme='dark']:text-red-300",
  info: "bg-blue-50 border-blue-200 text-blue-800 [data-theme='dark']:bg-blue-900/30 [data-theme='dark']:border-blue-800 [data-theme='dark']:text-blue-300",
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 shadow-lg",
                colorMap[toast.type]
              )}
            >
              <Icon className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
