import type { ReactNode } from "react";
import { SectionCard } from "@/components/common/section-card";
import { APP_PURPLE } from "@/lib/utils/constants";
import type { WordRecord } from "@/types/db";

type WordCardProps = {
  word: WordRecord;
  className?: string;
  compact?: boolean;
  headerActions?: ReactNode;
  footer?: ReactNode;
};

function buildSourceLabel(word: WordRecord) {
  if (!word.year && !word.sourceTextId) {
    return "";
  }

  return [word.year, word.sourceTextId].filter(Boolean).join(" · ");
}

export function WordCard({ word, className = "", compact = false, headerActions, footer }: WordCardProps) {
  const sourceLabel = buildSourceLabel(word);

  return (
    <SectionCard
      className={[
        "overflow-hidden border-[1.5px] border-[rgba(102,8,116,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,245,255,0.92))] p-0 shadow-[0_24px_56px_rgba(102,8,116,0.10)]",
        className,
      ].join(" ")}
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(243,232,255,0.9),rgba(255,255,255,0.75))]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(102,8,116,0.10),rgba(255,255,255,0))]" />

        <div className="relative flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="truncate text-[2.15rem] font-black leading-none tracking-tight text-neutral-950 sm:text-[2.4rem]">
                {word.spell}
              </div>
              {word.partOfSpeech ? (
                <span className="rounded-full bg-white/88 px-3 py-1 text-xs font-semibold text-neutral-600 shadow-sm ring-1 ring-neutral-200/70">
                  {word.partOfSpeech}
                </span>
              ) : null}
            </div>

            {sourceLabel ? <div className="mt-3 text-sm font-medium text-neutral-500">{sourceLabel}</div> : null}
          </div>

          {headerActions ? <div className="flex shrink-0 items-center gap-2">{headerActions}</div> : null}
        </div>

        <div className="mx-4 rounded-[1.8rem] border border-white/80 bg-white/92 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:mx-6 sm:px-6 sm:py-6">
          <section className="space-y-3">
            <div className="inline-flex rounded-full bg-[rgba(102,8,116,0.08)] px-3 py-1 text-[11px] font-bold tracking-[0.18em]" style={{ color: APP_PURPLE }}>
              极简释义
            </div>
            <p className="text-xl font-semibold leading-9 text-neutral-900 sm:text-[1.7rem] sm:leading-[2.6rem]">{word.meaning}</p>
          </section>

          {!compact ? (
            <section className="mt-6 space-y-4 border-t border-neutral-100 pt-5 text-[0.98rem] leading-8 text-neutral-800 sm:text-[1.02rem]">
              <div>
                <span className="font-black text-neutral-950">原句：</span>
                <span className="ml-2 italic">{word.originalSentence || "暂无原句"}</span>
              </div>

              <div>
                <span className="font-black text-neutral-950">记忆/词根：</span>
                <span className="ml-2">{word.usageExplanation || "暂无记忆/词根"}</span>
              </div>

              <div>
                <span className="font-black text-neutral-950">态度：</span>
                <span className="ml-2">{word.sentiment || "[中性]"}</span>
              </div>

              <div>
                <span className="font-black text-neutral-950">去味：</span>
                <span className="ml-2">{word.deodorizedMeaning || "暂无去味"}</span>
              </div>
            </section>
          ) : null}

          {footer ? <div className="mt-5">{footer}</div> : null}
        </div>
      </div>
    </SectionCard>
  );
}
