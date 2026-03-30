"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { BrowseSearchBar } from "@/components/browse/browse-search-bar";
import { WordList } from "@/components/browse/word-list";
import { useBrowseWords } from "@/lib/hooks/use-browse-words";

export default function BrowsePage() {
  const { filters, setFilters, words, years, sourceTextIds } = useBrowseWords();
  const hasWords = useMemo(() => words.length > 0, [words]);

  return (
    <AppShell>
      <TopBar title="浏览词库" showBack />
      <main className="flex flex-1 flex-col gap-4 bg-[linear-gradient(180deg,#faf5ff_0%,#ffffff_42%)] px-4 py-4">
        <BrowseSearchBar filters={filters} years={years} sourceTextIds={sourceTextIds} onChange={setFilters} />
        {hasWords ? (
          <WordList words={words} />
        ) : (
          <EmptyState title="还没有匹配到单词" description="先去录入新词，或调整年份、文章与搜索条件。" />
        )}
      </main>
    </AppShell>
  );
}
