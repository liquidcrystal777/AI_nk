"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { BrowseSearchBar } from "@/components/browse/browse-search-bar";
import { WordList } from "@/components/browse/word-list";
import { useBrowseWords } from "@/lib/hooks/use-browse-words";

export default function BrowsePage() {
  const { filters, setFilters, words } = useBrowseWords();
  const hasWords = useMemo(() => words.length > 0, [words]);

  return (
    <AppShell>
      <TopBar title="浏览词库" showBack backHref="/" />
      <main className="flex flex-1 flex-col gap-3 bg-[linear-gradient(180deg,#faf5ff_0%,#ffffff_42%)] px-0 py-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
        <div className="px-3">
          <BrowseSearchBar filters={filters} onChange={setFilters} />
        </div>
        {hasWords ? (
          <WordList words={words} />
        ) : (
          <div className="px-3">
            <EmptyState title="还没有匹配到单词" description="先去录入新词，或调整搜索条件。" />
          </div>
        )}
      </main>
    </AppShell>
  );
}
