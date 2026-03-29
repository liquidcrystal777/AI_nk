"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SectionCard } from "@/components/common/section-card";
import { formatRelativeTime } from "@/lib/utils/time";
import type { WordRecord } from "@/types/db";

function statusLabel(status: WordRecord["status"]) {
  if (status === "new") return "新词";
  if (status === "vague") return "模糊";
  if (status === "known") return "认识";
  return "掌握";
}

export function WordListItem({ word }: { word: WordRecord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <SectionCard>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div>
          <div className="text-2xl font-black tracking-tight text-neutral-900">{word.spell}</div>
          <div className="mt-1 text-sm text-neutral-500">{word.pronunciation || "暂无音标"}</div>
          <div className="mt-2 text-sm leading-6 text-neutral-700">{word.meaning}</div>
        </div>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {expanded ? (
        <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4 text-sm text-neutral-700">
          <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
            <span>状态：{statusLabel(word.status)}</span>
            <span>年份：{word.year}</span>
            <span>来源：{word.sourceTextId}</span>
            <span>下次复习：{formatRelativeTime(word.nextReviewTime)}</span>
          </div>
          <div>
            <div className="mb-2 font-semibold text-neutral-900">考点例句</div>
            <ul className="list-decimal space-y-2 pl-5">
              {word.originalSentence.map((sentence, index) => (
                <li key={`${word.id}-${index}`}>{sentence}</li>
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
