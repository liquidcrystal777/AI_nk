"use client";

import { Minus, Circle, Plus, ArrowRight } from "lucide-react";
import { SectionCard } from "@/components/common/section-card";
import { APP_PURPLE } from "@/lib/utils/constants";
import type { WordRecord } from "@/types/db";
import type { ReviewAction } from "@/types/review";

type ReviewCardProps = {
  word: WordRecord;
};

function extractPartOfSpeech(meaning: string) {
  const match = meaning.match(/(?:^|】)\s*([a-z]{1,5}\.)/i);
  return match?.[1]?.toLowerCase() ?? "";
}

function buildSourceLabel(word: WordRecord) {
  if (!word.year && !word.sourceTextId) {
    return "";
  }

  return `(${word.year}-${word.sourceTextId})`;
}

function splitMeaning(meaning: string) {
  const cleaned = meaning.replace(/【[^】]+】\s*/g, "").trim();
  return cleaned || meaning;
}

export function ReviewCard({ word }: ReviewCardProps) {
  const partOfSpeech = extractPartOfSpeech(word.meaning);
  const sourceLabel = buildSourceLabel(word);
  const primarySentence = word.originalSentence[0] ?? "暂无原句";
  const extraSentences = word.originalSentence.slice(1);

  return (
    <SectionCard className="overflow-hidden border-[1.5px] p-0 shadow-[0_12px_32px_rgba(102,8,116,0.08)]">
      <div className="flex items-start justify-between gap-4 px-6 py-4 text-white" style={{ backgroundColor: APP_PURPLE }}>
        <div>
          <div className="text-[2rem] font-black leading-none tracking-tight">{word.spell}</div>
          <div className="mt-2 text-sm text-white/85">{word.pronunciation || "暂无音标"}</div>
        </div>
        {partOfSpeech ? (
          <div className="rounded-2xl border border-white/30 px-3 py-1 text-xl font-bold leading-none text-white">[{partOfSpeech}]</div>
        ) : null}
      </div>

      <div className="space-y-5 border-2 border-t-0 border-[rgba(102,8,116,0.85)] bg-white px-6 py-5 text-left text-neutral-900">
        <section className="space-y-2">
          <div className="text-[1.7rem] font-black leading-none text-black">【极简释义】</div>
          <p className="text-[1.9rem] font-semibold leading-[1.7] text-neutral-800">{splitMeaning(word.meaning)}</p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[1.7rem] font-black leading-none text-black">
            <span>【考点/逻辑】</span>
            <span className="text-lg" style={{ color: APP_PURPLE }}>🔗</span>
          </div>

          <div className="space-y-4 text-[1.85rem] leading-[1.8] text-neutral-900">
            <div className="flex gap-3">
              <span className="shrink-0 font-black">1.</span>
              <div>
                <span className="font-black">原句：</span>
                <span className="ml-2 font-medium italic">{primarySentence}</span>
                {sourceLabel ? <span className="ml-2 font-medium italic text-neutral-700">{sourceLabel}</span> : null}
              </div>
            </div>

            {extraSentences.length ? (
              <div className="pl-9">
                <ul className="list-disc space-y-2 pl-6 text-[1.1rem] leading-8 text-neutral-700">
                  {extraSentences.map((sentence, index) => (
                    <li key={`${word.id ?? word.spell}-extra-${index}`}>{sentence}</li>
                  ))}
                </ul>
              </div>
            ) : null}
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
