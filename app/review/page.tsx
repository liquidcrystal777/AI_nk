"use client";

import { EmptyState } from "@/components/common/empty-state";
import { LoadingCard } from "@/components/common/loading-card";
import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { AttitudeScreen, MeaningScreen, CardResultScreen } from "@/components/review/review-sections";
import { useReviewStage } from "@/lib/hooks/use-review-stage";

export default function ReviewPage() {
  const {
    loading,
    currentWord,
    stage,
    outcome,
    meaningOptions,
    handleAttitude,
    handleForget,
    handleSkip,
    handleMeaning,
    handleNextWord,
  } = useReviewStage();

  return (
    <AppShell>
      <TopBar title="开始复习" showBack backHref="/" />
      <main className="flex flex-1 flex-col bg-[linear-gradient(180deg,#f7f1fb_0%,#fcf8ff_24%,#ffffff_58%)] px-4 py-3">
        {loading ? (
          <LoadingCard text="正在加载待复习单词..." />
        ) : currentWord ? (
          <>
            {stage === "attitude" && (
              <AttitudeScreen word={currentWord} onSelect={handleAttitude} onForget={handleForget} onSkip={handleSkip} />
            )}
            {stage === "meaning" && (
              <MeaningScreen
                word={currentWord}
                options={meaningOptions}
                onSelect={handleMeaning}
                onForget={handleForget}
                onSkip={handleSkip}
              />
            )}
            {stage === "card" && <CardResultScreen word={currentWord} outcome={outcome} onNext={handleNextWord} />}
          </>
        ) : (
          <EmptyState title="当前没有待复习单词" description="你可以先录入新词，或稍后再回来复习。" />
        )}
      </main>
    </AppShell>
  );
}
