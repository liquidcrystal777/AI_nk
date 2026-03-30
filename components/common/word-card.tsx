import type { ReactNode } from "react";
import { SectionCard } from "@/components/common/section-card";
import { formatSourceTextLabel, formatWordSpell } from "@/lib/utils/text";
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

  return [word.year, formatSourceTextLabel(word.sourceTextId)].filter(Boolean).join(" · ");
}

function normalizeSentiment(sentiment: string) {
  if (sentiment.includes("正")) return "正向";
  if (sentiment.includes("负")) return "负向";
  return "中性";
}

function FocusLabel({ children }: { children: ReactNode }) {
  return <div className="font-bold text-gray-900">【{children}】</div>;
}

export function WordCard({ word, className = "", headerActions, footer }: WordCardProps) {
  const sourceLabel = buildSourceLabel(word);
  const sentimentLabel = normalizeSentiment(word.sentiment || "");
  const displaySpell = formatWordSpell(word.spell);

  return (
    <SectionCard className={["overflow-hidden rounded-md border border-neutral-200 bg-white p-0 shadow-md", className].join(" ")}>
      <div className="overflow-hidden rounded-md bg-white">
        <div className="border-b border-[#660874] bg-[#660874] px-5 py-4 text-white sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="truncate font-serif text-3xl text-white">{displaySpell}</div>
                {word.partOfSpeech ? <div className="font-serif text-xl text-white/90">{word.partOfSpeech}</div> : null}
              </div>
              {sourceLabel ? <div className="mt-2 text-sm text-white/80">{sourceLabel}</div> : null}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className="rounded-md border border-white/30 px-2 py-1 text-xs font-semibold text-white/95">{sentimentLabel}</span>
              {headerActions ? <div className="flex items-center gap-2">{headerActions}</div> : null}
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5 leading-relaxed sm:px-6 sm:py-6">
          <div className="space-y-4 text-base text-neutral-800">
            <div className="space-y-2">
              <FocusLabel>极简释义</FocusLabel>
              <p className="text-lg font-semibold text-neutral-900">{word.meaning || "暂无释义"}</p>
            </div>

            <div className="space-y-4">
              <FocusLabel>考点/逻辑</FocusLabel>

              <div>
                <span className="font-bold text-gray-900">1. 原文</span>
                <p className="mt-1 font-serif italic text-gray-800">{word.originalSentence || "暂无原文"}</p>
              </div>

              <div>
                <span className="font-bold text-gray-900">2. 记忆/词根</span>
                <p className="mt-1 text-neutral-800">{word.usageExplanation || "暂无记忆/词根"}</p>
              </div>

              <div>
                <span className="font-bold text-gray-900">3. 去味</span>
                <p className="mt-1 text-neutral-800">{word.deodorizedMeaning || "暂无去味"}</p>
              </div>
            </div>
          </div>

          {footer ? <div>{footer}</div> : null}
        </div>
      </div>
    </SectionCard>
  );
}
