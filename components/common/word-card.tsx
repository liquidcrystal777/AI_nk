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

function normalizeSentiment(sentiment: string) {
  if (sentiment.includes("正")) return "正向";
  if (sentiment.includes("负")) return "负向";
  return "中性";
}

function FocusLabel({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[12px] font-black tracking-[0.14em]" style={{ color: APP_PURPLE }}>
      <span className="text-sm leading-none">[</span>
      <span>{children}</span>
      <span className="text-sm leading-none">]</span>
    </div>
  );
}

export function WordCard({ word, className = "", compact = false, headerActions, footer }: WordCardProps) {
  const sourceLabel = buildSourceLabel(word);
  const sentimentLabel = normalizeSentiment(word.sentiment || "");

  return (
    <SectionCard
      className={[
        "overflow-hidden border-[1.5px] border-[rgba(102,8,116,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,245,255,0.95))] p-0 shadow-[0_24px_56px_rgba(102,8,116,0.10)]",
        className,
      ].join(" ")}
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(244,234,255,0.92),rgba(255,255,255,0.82))]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(102,8,116,0.12),rgba(255,255,255,0))]" />

        <div className="relative border-b border-[rgba(102,8,116,0.08)] px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-end gap-3">
                <div className="truncate text-[2.25rem] font-black leading-none tracking-tight text-neutral-950 sm:text-[2.5rem]">
                  {word.spell}
                </div>
                {word.partOfSpeech ? <div className="pb-1 text-sm font-semibold text-neutral-500">{word.partOfSpeech}</div> : null}
              </div>
              {sourceLabel ? <div className="mt-2 text-sm font-medium text-neutral-500">{sourceLabel}</div> : null}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <span
                className="rounded-full border border-[rgba(102,8,116,0.12)] bg-white/90 px-3 py-1 text-[11px] font-bold tracking-[0.08em] shadow-sm"
                style={{ color: APP_PURPLE }}
              >
                {sentimentLabel}
              </span>
              {headerActions ? <div className="flex items-center gap-2">{headerActions}</div> : null}
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          <section className="rounded-[1.7rem] border border-white/90 bg-white/94 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
            <div className="space-y-3">
              <FocusLabel>极简释义</FocusLabel>
              <p className="text-[1.45rem] font-bold leading-9 text-neutral-900 sm:text-[1.65rem] sm:leading-[2.6rem]">{word.meaning || "暂无释义"}</p>
            </div>
          </section>

          <section className="rounded-[1.7rem] border border-[rgba(102,8,116,0.08)] bg-[rgba(255,255,255,0.82)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
            <div className="space-y-4 text-[0.98rem] leading-8 text-neutral-800 sm:text-[1.02rem]">
              <FocusLabel>考点 / 逻辑</FocusLabel>

              <div>
                <span className="font-black text-neutral-950">去味：</span>
                <span className="ml-2">{word.deodorizedMeaning || "暂无考点/逻辑"}</span>
              </div>

              {!compact ? (
                <>
                  <div>
                    <span className="font-black text-neutral-950">原句：</span>
                    <span className="ml-2 italic">{word.originalSentence || "暂无原句"}</span>
                  </div>

                  <div>
                    <span className="font-black text-neutral-950">记忆/词根：</span>
                    <span className="ml-2">{word.usageExplanation || "暂无记忆/词根"}</span>
                  </div>
                </>
              ) : null}
            </div>
          </section>

          {footer ? <div>{footer}</div> : null}
        </div>
      </div>
    </SectionCard>
  );
}
