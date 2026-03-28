"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  AlertTriangle,
  Building2,
  Bookmark,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const commands = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard, keywords: "home" },
  { label: "Clients", href: "/app/clients", icon: FolderOpen, keywords: "client account" },
  { label: "Tasks", href: "/app/tasks", icon: CheckSquare, keywords: "task todo" },
  {
    label: "Vulnerabilities",
    href: "/app/vulnerabilities",
    icon: AlertTriangle,
    keywords: "vuln cve security",
  },
  { label: "Vendors", href: "/app/vendors", icon: Building2, keywords: "vendor tool" },
  { label: "Bookmarks", href: "/app/bookmarks", icon: Bookmark, keywords: "bookmark saved" },
  { label: "Settings", href: "/app/settings", icon: Settings, keywords: "settings preferences" },
  { label: "Admin Panel", href: "/app/admin", icon: ShieldCheck, keywords: "admin manage" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = commands.filter((cmd) => {
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.keywords.includes(q)
    );
  });

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex].href);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
          >
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-64 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  filtered.map((cmd, i) => (
                    <button
                      key={cmd.href}
                      onClick={() => handleSelect(cmd.href)}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors",
                        i === selectedIndex
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <cmd.icon className="h-4 w-4 shrink-0" />
                      {cmd.label}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
                <span>
                  <kbd className="rounded bg-muted px-1 py-0.5 font-mono">
                    ↑↓
                  </kbd>{" "}
                  navigate
                </span>
                <span>
                  <kbd className="rounded bg-muted px-1 py-0.5 font-mono">
                    ↵
                  </kbd>{" "}
                  open
                </span>
                <span>
                  <kbd className="rounded bg-muted px-1 py-0.5 font-mono">
                    esc
                  </kbd>{" "}
                  close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
