"use client";

import { Minus, Circle, Plus, ArrowRight } from "lucide-react";
import { SectionCard } from "@/components/common/section-card";
import { APP_PURPLE } from "@/lib/utils/constants";
import type { WordRecord } from "@/types/db";
import type { ReviewAction } from "@/types/review";

type ReviewCardProps = {
  word: WordRecord;
};

function buildSourceLabel(word: WordRecord) {
  if (!word.year && !word.sourceTextId) {
    return "";
  }

  return `(${word.year}-${word.sourceTextId})`;
}

function ConfusingMeaningList({ word }: { word: WordRecord }) {
  const meanings = [word.confusingMeaning1, word.confusingMeaning2, word.confusingMeaning3].filter(Boolean);

  if (!meanings.length) {
    return <p className="text-base text-neutral-500">暂无易混淆含义</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {meanings.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm font-medium text-neutral-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function ReviewCard({ word }: ReviewCardProps) {
  const sourceLabel = buildSourceLabel(word);

  return (
    <SectionCard className="overflow-hidden border-[1.5px] p-0 shadow-[0_12px_32px_rgba(102,8,116,0.08)]">
      <div className="flex items-start justify-between gap-4 px-6 py-4 text-white" style={{ backgroundColor: APP_PURPLE }}>
        <div>
          <div className="text-[2rem] font-black leading-none tracking-tight">{word.spell}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/85">
            {word.partOfSpeech ? <span>{word.partOfSpeech}</span> : null}
            {sourceLabel ? <span>{sourceLabel}</span> : null}
          </div>
        </div>
      </div>

      <div className="space-y-5 border-2 border-t-0 border-[rgba(102,8,116,0.85)] bg-white px-6 py-5 text-left text-neutral-900">
        <section className="space-y-2">
          <div className="text-[1.7rem] font-black leading-none text-black">【极简释义】</div>
          <p className="text-[1.9rem] font-semibold leading-[1.7] text-neutral-800">{word.meaning}</p>
        </section>

        <section className="space-y-3">
          <div className="text-[1.7rem] font-black leading-none text-black">【易混淆含义】</div>
          <ConfusingMeaningList word={word} />
        </section>

        <section className="space-y-3">
          <div className="text-[1.7rem] font-black leading-none text-black">【考点/逻辑】</div>

          <div className="space-y-4 text-[1.05rem] leading-8 text-neutral-900">
            <div>
              <span className="font-black">原句：</span>
              <span className="ml-2 italic">{word.originalSentence || "暂无原句"}</span>
            </div>

            <div>
              <span className="font-black">记忆/词根：</span>
              <span className="ml-2">{word.usageExplanation || "暂无记忆/词根"}</span>
            </div>

            <div>
              <span className="font-black">态度：</span>
              <span className="ml-2">{word.sentiment || "[中性]"}</span>
            </div>

            <div>
              <span className="font-black">去味：</span>
              <span className="ml-2">{word.deodorizedMeaning || "暂无去味"}</span>
            </div>
          </div>
        </section>
      </div>
    </SectionCard>
  );
}

const actions: Array<{ action: ReviewAction; label: string; icon: typeof Minus }> = [
  { action: "fail", label: "不认识", icon: Minus },
  { action: "again", label: "模糊", icon: Circle },
  { action: "success", label: "认识", icon: Plus },
  { action: "skip", label: "跳过", icon: ArrowRight },
];

export function ReviewActions({ onAction }: { onAction: (action: ReviewAction) => void }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map(({ action, label, icon: Icon }) => (
        <button
          key={action}
          type="button"
          onClick={() => onAction(action)}
          className="flex flex-col items-center gap-2 rounded-3xl border border-neutral-200 bg-white px-3 py-4 text-sm font-medium text-neutral-800 shadow-sm"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
            <Icon size={18} />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
