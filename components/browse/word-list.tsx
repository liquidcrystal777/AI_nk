"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Trash2 } from "lucide-react";
import { WordCard } from "@/components/common/word-card";
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
        "flex h-10 w-10 items-center justify-center rounded-full border bg-white/92 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50",
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
    <div
      className={[
        "transition duration-300 ease-out",
        isActive ? "scale-100 opacity-100" : "scale-[0.97] opacity-75",
      ].join(" ")}
    >
      <WordCard
        word={word}
        compact={!expanded}
        className="rounded-[2rem]"
        headerActions={
          <>
            <ActionButton
              onClick={() => setConfirmingDelete((prev) => !prev)}
              disabled={isDeleting}
              ariaLabel="删除单词"
              tone="danger"
            >
              <Trash2 size={16} />
            </ActionButton>
            <ActionButton
              onClick={() => setExpanded((prev) => !prev)}
              ariaLabel={expanded ? "收起详情" : "展开详情"}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </ActionButton>
          </>
        }
        footer={
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
              <span className="rounded-full bg-neutral-100 px-3 py-1">状态：{statusLabel(word.status)}</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1">年份：{word.year || "-"}</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1">来源：{word.sourceTextId || "-"}</span>
            </div>

            {expanded ? <div className="text-xs text-neutral-500">下次复习：{formatRelativeTime(word.nextReviewTime)}</div> : null}

            {confirmingDelete ? (
              <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-700">
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
          </div>
        }
      />
    </div>
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
    <div className="space-y-4 px-4">
      <div className="flex items-center justify-between rounded-[1.6rem] border border-white/70 bg-white/88 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">Card Flow</div>
          <div className="mt-1 text-sm font-medium text-neutral-600">左右滑动切换词卡</div>
        </div>
        <div className="rounded-full bg-[rgba(102,8,116,0.08)] px-3 py-1 text-sm font-bold" style={{ color: APP_PURPLE }}>
          {progressLabel}
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[8%] pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {words.map((word, index) => (
          <div key={word.id} className="w-[100%] shrink-0 snap-center">
            <WordListItem word={word} isActive={index === activeIndex} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => canGoPrev && scrollToIndex(activeIndex - 1)}
          disabled={!canGoPrev}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white/92 text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="上一张"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={() => canGoNext && scrollToIndex(activeIndex + 1)}
          disabled={!canGoNext}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white/92 text-neutral-600 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="下一张"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
