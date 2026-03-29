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

function extractPartOfSpeech(meaning: string) {
  const match = meaning.match(/(?:^|】)\s*([a-z]{1,5}\.)/i);
  return match?.[1]?.toLowerCase() ?? "";
}

function splitMeaning(meaning: string) {
  const cleaned = meaning.replace(/【[^】]+】\s*/g, "").trim();
  return cleaned || meaning;
}

export function WordListItem({ word }: { word: WordRecord }) {
  const [expanded, setExpanded] = useState(false);
  const partOfSpeech = extractPartOfSpeech(word.meaning);

  return (
    <SectionCard className="border-[1.5px] p-0 shadow-[0_10px_24px_rgba(102,8,116,0.06)]">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-3">
            <div className="text-3xl font-black tracking-tight text-neutral-900">{word.spell}</div>
            {partOfSpeech ? (
              <span
                className="rounded-xl px-2.5 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: APP_PURPLE }}
              >
                [{partOfSpeech}]
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-sm text-neutral-500">{word.pronunciation || "暂无音标"}</div>
          <div className="mt-3 inline-flex rounded-xl bg-[rgba(102,8,116,0.08)] px-3 py-1 text-xs font-bold" style={{ color: APP_PURPLE }}>
            【极简释义】
          </div>
          <div className="mt-2 text-sm leading-7 text-neutral-700">{splitMeaning(word.meaning)}</div>
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
              【考点/逻辑】
            </div>
            <ul className="mt-3 space-y-3 text-sm leading-7 text-neutral-700">
              {word.originalSentence.map((sentence, index) => (
                <li key={`${word.id}-${index}`} className="flex gap-3">
                  <span className="font-bold text-neutral-900">{index + 1}.</span>
                  <div className="min-w-0">
                    <span className="font-semibold text-neutral-900">原句：</span>
                    <span className="ml-2 italic">{sentence}</span>
                    {index === 0 ? <span className="ml-2 text-neutral-500">({word.year}-{word.sourceTextId})</span> : null}
                  </div>
                </li>
              ))}
            </ul>
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
