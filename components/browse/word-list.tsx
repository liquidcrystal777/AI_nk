"use client";

import { useState } from "react";
import { BrowseWordCard } from "@/components/browse/browse-word-card";
import { deleteWord } from "@/lib/db/mutations";
import type { WordRecord } from "@/types/db";

type WordListItemProps = {
  word: WordRecord;
  isActive: boolean;
};

function formatIndicatorNumber(value: number) {
  return value.toString().padStart(2, "0");
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
        isActive ? "scale-100 opacity-100" : "scale-[0.985] opacity-78",
      ].join(" ")}
    >
      <BrowseWordCard
        word={word}
        confirmingDelete={confirmingDelete}
        isDeleting={isDeleting}
        onToggleDelete={() => setConfirmingDelete((prev) => !prev)}
        onConfirmDelete={handleDelete}
        onCancelDelete={() => setConfirmingDelete(false)}
      />
    </div>
  );
}

export function WordList({ words }: { words: WordRecord[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const boundedActiveIndex = words.length ? Math.min(activeIndex, words.length - 1) : 0;

  return (
    <div className="space-y-3 px-2">
      <div
        onScroll={(event) => {
          const track = event.currentTarget;
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
        }}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {words.map((word, index) => (
          <div key={word.id} className="w-[99%] shrink-0 snap-center first:ml-[0.5%] last:mr-[0.5%]">
            <WordListItem word={word} isActive={index === boundedActiveIndex} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center px-3 pb-1 text-[0.95rem] font-semibold tracking-[0.12em]" style={{ color: "var(--theme-accent-strong)" }}>
        {formatIndicatorNumber(boundedActiveIndex + 1)} / {formatIndicatorNumber(words.length)}
      </div>
    </div>
  );
}
