"use client";

import { Minus, Circle, Plus, ArrowRight } from "lucide-react";
import { SectionCard } from "@/components/common/section-card";
import type { WordRecord } from "@/types/db";
import type { ReviewAction } from "@/types/review";

type ReviewCardProps = {
  word: WordRecord;
};

export function ReviewCard({ word }: ReviewCardProps) {
  return (
    <SectionCard className="space-y-4 py-8 text-center">
      <div className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">开始复习</div>
      <div className="text-5xl font-black tracking-tight text-neutral-900">{word.spell}</div>
      <div className="text-base text-neutral-500">{word.pronunciation || "暂无音标"}</div>
      <div className="rounded-2xl bg-neutral-50 px-4 py-4 text-left text-sm leading-7 text-neutral-700">{word.meaning}</div>
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
