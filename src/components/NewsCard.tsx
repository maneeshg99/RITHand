"use client";

import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { vendors } from "@/data/vendors";
import type { NewsItem } from "@/data/news";
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  AlertTriangle,
  ShieldAlert,
  Info,
  ArrowUpCircle,
  WifiOff,
  Clock,
  CircleDot,
} from "lucide-react";
import { motion } from "framer-motion";

const severityConfig: Record<string, { color: string; label: string }> = {
  critical: { color: "bg-red-600 text-white", label: "Critical" },
  high: { color: "bg-orange-600 text-white", label: "High" },
  medium: { color: "bg-yellow-600 text-white", label: "Medium" },
  low: { color: "bg-blue-600 text-white", label: "Low" },
  info: { color: "bg-gray-500 text-white", label: "Info" },
};

const typeIcons: Record<string, React.ElementType> = {
  security: ShieldAlert,
  update: ArrowUpCircle,
  outage: WifiOff,
  eol: Clock,
  general: Info,
  patch: AlertTriangle,
};

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  const { isRead, markAsRead, isBookmarked, toggleBookmark } = useApp();
  const read = isRead(item.id);
  const bookmarked = isBookmarked(item.id);
  const vendor = vendors.find((v) => v.id === item.vendorId);
  const severity = severityConfig[item.severity];
  const TypeIcon = typeIcons[item.type] || Info;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md",
        read && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", severity.color)}>
              {severity.label}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <TypeIcon className="h-3 w-3" />
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </span>
            {vendor && (
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {vendor.name}
              </span>
            )}
            {!read && (
              <CircleDot className="h-3 w-3 text-blue-500" />
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-card-foreground leading-snug mb-1.5">
            {item.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {item.summary}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <span className="text-border">|</span>
            <span>{item.sourceName}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={() => toggleBookmark(item.id)}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              bookmarked
                ? "text-yellow-500 hover:text-yellow-600"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
          {!read && (
            <button
              onClick={() => markAsRead(item.id)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              title="Mark as read"
            >
              <CircleDot className="h-4 w-4" />
            </button>
          )}
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title="View source"
            onClick={() => markAsRead(item.id)}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
