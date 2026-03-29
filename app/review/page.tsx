"use client";

import { EmptyState } from "@/components/common/empty-state";
import { LoadingCard } from "@/components/common/loading-card";
import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { ReviewActions, ReviewCard } from "@/components/review/review-sections";
import { useReviewQueue } from "@/lib/hooks/use-review-queue";

export default function ReviewPage() {
  const { loading, currentWord, handleAction } = useReviewQueue();

  return (
    <AppShell>
      <TopBar title="开始复习" showBack />
      <main className="flex flex-1 flex-col justify-between gap-6 px-4 py-4">
        {loading ? (
          <LoadingCard text="正在加载待复习单词..." />
        ) : currentWord ? (
          <>
            <ReviewCard word={currentWord} />
            <ReviewActions onAction={handleAction} />
          </>
        ) : (
          <EmptyState title="当前没有待复习单词" description="你可以先录入新词，或稍后再回来复习。" />
        )}
      </main>
    </AppShell>
  );
}
