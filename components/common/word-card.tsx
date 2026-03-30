import type { ReactNode } from "react";
import { SectionCard } from "@/components/common/section-card";
import { formatDisplayYear, formatSourceTextLabel, formatWordSpell } from "@/lib/utils/text";
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

  return [formatDisplayYear(word.year), formatSourceTextLabel(word.sourceTextId)].filter(Boolean).join(" · ");
}

function normalizeSentiment(sentiment: string) {
  if (sentiment.includes("正")) return "正向";
  if (sentiment.includes("负")) return "负向";
  return "中性";
}

function FocusLabel({ children }: { children: ReactNode }) {
  return <div className="text-lg font-black tracking-[0.02em] text-gray-950">【{children}】</div>;
}

function splitDeodorizedMeaning(input: string) {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    plain: lines[0] ?? "",
    exam: lines[1] ?? "",
  };
}

export function WordCard({ word, className = "", headerActions, footer }: WordCardProps) {
  const sourceLabel = buildSourceLabel(word);
  const sentimentLabel = normalizeSentiment(word.sentiment || "");
  const displaySpell = formatWordSpell(word.spell);
  const deodorizedMeaning = splitDeodorizedMeaning(word.deodorizedMeaning || "");

  return (
    <SectionCard className={[
      "overflow-hidden rounded-[1.1rem] border border-neutral-200 bg-white p-0 shadow-md",
      className,
    ].join(" ")}>
      <div className="overflow-hidden rounded-[1.1rem] bg-white">
        <div className="border-b border-[#660874] bg-[linear-gradient(135deg,#5f0b71_0%,#7d2e8e_100%)] px-5 py-4 text-white sm:px-6">
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

        <div className="grid min-h-[26rem] grid-rows-[1fr_auto]">
          <div className="space-y-6 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="space-y-3 text-base text-neutral-800">
              <FocusLabel>极简释义</FocusLabel>
              <p className="text-[1.2rem] font-semibold leading-8 text-neutral-950">{word.meaning || "暂无释义"}</p>
            </div>

            <div className="space-y-3 rounded-[1.15rem] border border-[rgba(102,8,116,0.08)] bg-[rgba(102,8,116,0.03)] px-4 py-4">
              <FocusLabel>去味 / 考点</FocusLabel>

              <div>
                <span className="text-sm font-bold text-neutral-900">白话解释</span>
                <p className="mt-2 text-[1.02rem] leading-8 text-neutral-900">{deodorizedMeaning.plain || word.deodorizedMeaning || "暂无去味"}</p>
              </div>

              <div>
                <span className="text-sm font-bold text-neutral-900">考研常考法</span>
                <p className="mt-2 text-[0.98rem] leading-7 text-neutral-700">{deodorizedMeaning.exam || "暂无考点提示"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <FocusLabel>辅助记忆</FocusLabel>

              <div>
                <span className="text-sm font-bold text-gray-900">记忆 / 词根</span>
                <p className="mt-1.5 text-[1.02rem] leading-8 text-neutral-800">{word.usageExplanation || "暂无记忆/词根"}</p>
              </div>

              <div>
                <span className="text-sm font-bold text-gray-900">最短语境</span>
                <p className="mt-1.5 font-serif text-[0.96rem] leading-7 italic text-gray-700">{word.originalSentence || "暂无原文"}</p>
              </div>
            </div>
          </div>

          {footer ? <div className="border-t border-neutral-100 px-5 py-4 sm:px-6">{footer}</div> : null}
        </div>
      </div>
    </SectionCard>
  );
}
