"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SectionCard } from "@/components/common/section-card";
import { APP_PURPLE } from "@/lib/utils/constants";
import { formatRelativeTime } from "@/lib/utils/time";
import type { WordRecord } from "@/types/db";

function statusLabel(status: WordRecord["status"]) {
  if (status === "new") return "新词";
  if (status === "vague") return "模糊";
  if (status === "known") return "认识";
  return "掌握";
}

function ConfusingMeaningList({ word }: { word: WordRecord }) {
  const meanings = [word.confusingMeaning1, word.confusingMeaning2, word.confusingMeaning3].filter(Boolean);

  if (!meanings.length) {
    return <span className="text-neutral-500">暂无易混淆含义</span>;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {meanings.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function WordListItem({ word }: { word: WordRecord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <SectionCard className="border-[1.5px] p-0 shadow-[0_10px_24px_rgba(102,8,116,0.06)]">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="text-3xl font-black tracking-tight text-neutral-900">{word.spell}</div>
            {word.partOfSpeech ? (
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                {word.partOfSpeech}
              </span>
            ) : null}
          </div>
          <div className="mt-3 inline-flex rounded-xl bg-[rgba(102,8,116,0.08)] px-3 py-1 text-xs font-bold" style={{ color: APP_PURPLE }}>
            【极简释义】
          </div>
          <div className="mt-2 text-sm leading-7 text-neutral-700">{word.meaning}</div>
        </div>
        {expanded ? <ChevronUp size={18} className="mt-1 shrink-0" /> : <ChevronDown size={18} className="mt-1 shrink-0" />}
      </button>

      {expanded ? (
        <div className="space-y-4 border-t border-neutral-100 px-5 pb-5 pt-4 text-sm text-neutral-700">
          <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
            <span>状态：{statusLabel(word.status)}</span>
            <span>年份：{word.year}</span>
            <span>来源：{word.sourceTextId}</span>
            <span>下次复习：{formatRelativeTime(word.nextReviewTime)}</span>
          </div>

          <div>
            <div className="inline-flex rounded-xl bg-[rgba(102,8,116,0.08)] px-3 py-1 text-xs font-bold" style={{ color: APP_PURPLE }}>
              【易混淆含义】
            </div>
            <ConfusingMeaningList word={word} />
          </div>

          <div>
            <div className="inline-flex rounded-xl bg-[rgba(102,8,116,0.08)] px-3 py-1 text-xs font-bold" style={{ color: APP_PURPLE }}>
              【考点/逻辑】
            </div>
            <div className="mt-3 space-y-3 text-sm leading-7 text-neutral-700">
              <div>
                <span className="font-semibold text-neutral-900">原句：</span>
                <span className="ml-2 italic">{word.originalSentence || "暂无原句"}</span>
                <span className="ml-2 text-neutral-500">({word.year}-{word.sourceTextId})</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-900">记忆/词根：</span>
                <span className="ml-2">{word.usageExplanation || "暂无记忆/词根"}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-900">态度：</span>
                <span className="ml-2">{word.sentiment || "[中性]"}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-900">去味：</span>
                <span className="ml-2">{word.deodorizedMeaning || "暂无去味"}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}

export function WordList({ words }: { words: WordRecord[] }) {
  return (
    <div className="space-y-3">
      {words.map((word) => (
        <WordListItem key={word.id} word={word} />
      ))}
    </div>
  );
}
