"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const labelMap: Record<string, string> = {
  app: "Dashboard",
  clients: "Clients",
  tasks: "Tasks",
  vulnerabilities: "Vulnerabilities",
  vendors: "Vendors",
  bookmarks: "Bookmarks",
  settings: "Settings",
  admin: "Admin",
  assessments: "Assessments",
  eol: "End of Life",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Only show breadcrumbs within the app area
  if (!pathname.startsWith("/app")) return null;

  const segments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on the dashboard itself
  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label =
      labelMap[segment] || (segment.length > 8 ? segment.slice(0, 8) + "..." : segment);
    const isLast = i === segments.length - 1;

    return { href, label, isLast, segment };
  });

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground px-4 md:px-6 py-2 border-b border-border bg-card/50">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {i === 0 ? (
                <Home className="h-3 w-3" />
              ) : (
                crumb.label
              )}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
