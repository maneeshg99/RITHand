"use client";

import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { mockNews } from "@/data/news";
import { NewsCard } from "@/components/NewsCard";
import { Bookmark } from "lucide-react";

export default function BookmarksPage() {
  const { bookmarkedNewsIds } = useApp();

  const bookmarkedNews = useMemo(
    () => mockNews.filter((n) => bookmarkedNewsIds.includes(n.id)),
    [bookmarkedNewsIds]
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Bookmarks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {bookmarkedNews.length} saved item{bookmarkedNews.length !== 1 ? "s" : ""}
        </p>
      </div>

      {bookmarkedNews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bookmark className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">
            No bookmarked items yet. Bookmark news items from the dashboard to save them here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarkedNews.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
