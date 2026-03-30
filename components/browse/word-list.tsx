"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Trash2 } from "lucide-react";
import { SectionCard } from "@/components/common/section-card";
import { deleteWord } from "@/lib/db/mutations";
import { APP_PURPLE } from "@/lib/utils/constants";
import { formatRelativeTime } from "@/lib/utils/time";
import type { WordRecord } from "@/types/db";

function statusLabel(status: WordRecord["status"]) {
  if (status === "new") return "新词";
  if (status === "vague") return "模糊";
  if (status === "known") return "认识";
  return "掌握";
}

type WordListItemProps = {
  word: WordRecord;
  isActive: boolean;
};

export function WordListItem({ word, isActive }: WordListItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (typeof word.id !== "number") {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteWord(word.id);
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <SectionCard
      className={[
        "relative h-full rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.9))] p-0 shadow-[0_22px_48px_rgba(102,8,116,0.12)] transition duration-300",
        isActive ? "scale-100" : "scale-[0.96] opacity-75",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-20 rounded-b-[2rem] bg-[linear-gradient(180deg,rgba(216,180,254,0.28),rgba(255,255,255,0))]" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="text-3xl font-black tracking-tight text-neutral-900">{word.spell}</div>
              {word.partOfSpeech ? (
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                  {word.partOfSpeech}
                </span>
              ) : null}
            </div>
            <div className="mt-3 inline-flex rounded-full bg-[rgba(102,8,116,0.08)] px-3 py-1 text-[11px] font-bold" style={{ color: APP_PURPLE }}>
              极简释义
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete((prev) => !prev)}
              disabled={isDeleting}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="删除单词"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50"
              aria-label={expanded ? "收起详情" : "展开详情"}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 pt-3">
          <div className="text-base leading-8 text-neutral-700">{word.meaning}</div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-500">
            <span className="rounded-full bg-neutral-100 px-3 py-1">状态：{statusLabel(word.status)}</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1">年份：{word.year || "-"}</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1">来源：{word.sourceTextId || "-"}</span>
          </div>

          {confirmingDelete ? (
            <div className="mt-4 rounded-[1.4rem] border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-700">
              <div className="font-semibold">确认删除这个单词？</div>
              <div className="mt-1 text-xs text-rose-500">删除后不会恢复。</div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? "删除中..." : "确认删除"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={isDeleting}
                  className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  取消
                </button>
              </div>
            </div>
          ) : null}

          {expanded ? (
            <div className="mt-4 space-y-4 border-t border-neutral-100 pt-4 text-sm text-neutral-700">
              <div className="text-xs text-neutral-500">下次复习：{formatRelativeTime(word.nextReviewTime)}</div>

              <div>
                <div className="inline-flex rounded-full bg-[rgba(102,8,116,0.08)] px-3 py-1 text-[11px] font-bold" style={{ color: APP_PURPLE }}>
                  考点 / 逻辑
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
        </div>
      </div>
    </SectionCard>
  );
}

export function WordList({ words }: { words: WordRecord[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeIndex > words.length - 1) {
      setActiveIndex(Math.max(words.length - 1, 0));
    }
  }, [activeIndex, words.length]);

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < words.length - 1;
  const activeWord = words[activeIndex];

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const card = track.children[index] as HTMLElement | undefined;
    if (!card) {
      return;
    }

    card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setActiveIndex(index);
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
    let nextIndex = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    Array.from(track.children).forEach((child, index) => {
      const rect = (child as HTMLElement).getBoundingClientRect();
      const childCenter = rect.left + rect.width / 2;
      const distance = Math.abs(childCenter - trackCenter);
      if (distance < minDistance) {
        minDistance = distance;
        nextIndex = index;
      }
    });

    setActiveIndex(nextIndex);
  }

  const progressLabel = useMemo(() => {
    if (!activeWord) {
      return "0 / 0";
    }
    return `${activeIndex + 1} / ${words.length}`;
  }, [activeIndex, activeWord, words.length]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">Card Flow</div>
          <div className="mt-1 text-sm font-medium text-neutral-600">左右滑动切换词卡</div>
        </div>
        <div className="rounded-full bg-[rgba(102,8,116,0.08)] px-3 py-1 text-sm font-bold" style={{ color: APP_PURPLE }}>
          {progressLabel}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => canGoPrev && scrollToIndex(activeIndex - 1)}
          disabled={!canGoPrev}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="上一张"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[8%] pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {words.map((word, index) => (
            <div key={word.id} className="w-[84%] max-w-[21rem] shrink-0 snap-center">
              <WordListItem word={word} isActive={index === activeIndex} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => canGoNext && scrollToIndex(activeIndex + 1)}
          disabled={!canGoNext}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="下一张"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
