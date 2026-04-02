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
      <main className="relative flex flex-1 flex-col gap-3 overflow-hidden bg-[var(--page-surface)] px-0 py-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] transition-colors">
        <div className="pointer-events-none absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[var(--theme-accent-muted)] opacity-60 blur-[100px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[-6rem] h-[12rem] bg-[radial-gradient(circle_at_center,_var(--theme-accent-faint)_0%,_transparent_70%)]" />
        <div className="relative z-10 flex flex-1 flex-col gap-3">
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
        </div>
      </main>
    </AppShell>
  );
}
