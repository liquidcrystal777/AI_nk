"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { WordCard } from "@/components/common/word-card";
import { deleteWord } from "@/lib/db/mutations";
import { APP_PURPLE } from "@/lib/utils/constants";
import { formatDisplayYear, formatSourceTextLabel, formatWordSpell } from "@/lib/utils/text";
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

function ActionButton({
  onClick,
  disabled = false,
  ariaLabel,
  tone = "neutral",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  tone?: "neutral" | "danger";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={[
        "flex h-10 w-10 items-center justify-center rounded-md border bg-white transition disabled:cursor-not-allowed disabled:opacity-50",
        tone === "danger"
          ? "border-rose-200 text-rose-500 hover:bg-rose-50"
          : "border-neutral-200 text-neutral-600 hover:bg-neutral-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function WordListItem({ word, isActive }: WordListItemProps) {
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
    <div
      className={[
        "transition duration-300 ease-out",
        isActive ? "scale-100 opacity-100" : "scale-[0.97] opacity-75",
      ].join(" ")}
    >
      <WordCard
        word={word}
        compact
        className="rounded-[1.1rem]"
        headerActions={
          <ActionButton
            onClick={() => setConfirmingDelete((prev) => !prev)}
            disabled={isDeleting}
            ariaLabel="删除单词"
            tone="danger"
          >
            <Trash2 size={16} />
          </ActionButton>
        }
        footer={
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
              <span className="rounded-md bg-neutral-100 px-3 py-1">状态：{statusLabel(word.status)}</span>
              <span className="rounded-md bg-neutral-100 px-3 py-1">年份：{formatDisplayYear(word.year) || "-"}</span>
              <span className="rounded-md bg-neutral-100 px-3 py-1">来源：{formatSourceTextLabel(word.sourceTextId) || "-"}</span>
            </div>

            <div className="text-xs text-neutral-500">下次复习：{formatRelativeTime(word.nextReviewTime)}</div>

            {confirmingDelete ? (
              <div className="rounded-md border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-700">
                <div className="font-semibold">确认删除 {formatWordSpell(word.spell)}？</div>
                <div className="mt-1 text-xs text-rose-500">删除后不会恢复。</div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? "删除中..." : "确认删除"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={isDeleting}
                    className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        }
      />
    </div>
  );
}

export function WordList({ words }: { words: WordRecord[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const boundedActiveIndex = words.length ? Math.min(activeIndex, words.length - 1) : 0;

  const canGoPrev = boundedActiveIndex > 0;
  const canGoNext = boundedActiveIndex < words.length - 1;
  const activeWord = words[boundedActiveIndex];

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    const boundedIndex = Math.max(0, Math.min(index, words.length - 1));
    if (!track) {
      setActiveIndex(boundedIndex);
      return;
    }

    const card = track.children[boundedIndex] as HTMLElement | undefined;
    if (!card) {
      setActiveIndex(boundedIndex);
      return;
    }

    card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setActiveIndex(boundedIndex);
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
    return `${boundedActiveIndex + 1} / ${words.length}`;
  }, [activeWord, boundedActiveIndex, words.length]);

  return (
    <div className="space-y-3 px-4">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[6%] pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {words.map((word, index) => (
          <div key={word.id} className="w-full shrink-0 snap-center">
            <WordListItem word={word} isActive={index === boundedActiveIndex} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => canGoPrev && scrollToIndex(boundedActiveIndex - 1)}
          disabled={!canGoPrev}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="上一张"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="min-w-[84px] rounded-full bg-[rgba(102,8,116,0.08)] px-4 py-1.5 text-center text-sm font-bold" style={{ color: APP_PURPLE }}>
          {progressLabel}
        </div>

        <button
          type="button"
          onClick={() => canGoNext && scrollToIndex(boundedActiveIndex + 1)}
          disabled={!canGoNext}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="下一张"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
