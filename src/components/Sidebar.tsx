"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  FolderOpen,
  CheckSquare,
  AlertTriangle,
  Bookmark,
  Settings,
  Shield,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const baseNavItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/clients", label: "Clients", icon: FolderOpen },
  { href: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/app/vulnerabilities", label: "Vulnerabilities", icon: AlertTriangle },
  { href: "/app/vendors", label: "Vendors", icon: Building2 },
  { href: "/app/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

const adminNavItem = {
  href: "/app/admin",
  label: "Admin",
  icon: ShieldCheck,
};

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const navItems = isAdmin
    ? [...baseNavItems, adminNavItem]
    : baseNavItems;
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const isActive =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border bg-sidebar h-screen sticky top-0">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">RITHand</span>
        </div>
        {navContent}
        <div className="mt-auto border-t border-border p-4">
          <p className="text-xs text-muted-foreground">Right IT Hand v0.1</p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border bg-sidebar px-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-base font-bold text-foreground">RITHand</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md hover:bg-accent"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: -240 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -240 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-30 bg-sidebar pt-14"
          >
            {navContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
