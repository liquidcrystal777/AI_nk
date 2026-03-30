"use client";

import { Minus, Circle, Plus, ArrowRight, Diamond, CheckCircle2, SkipForward, XCircle } from "lucide-react";
import { WordCard } from "@/components/common/word-card";
import { APP_PURPLE } from "@/lib/utils/constants";
import type { ReviewOutcome } from "@/lib/hooks/use-review-stage";
import type { WordRecord } from "@/types/db";
import type { ReviewAction } from "@/types/review";

type ReviewCardProps = {
  word: WordRecord;
};

type ReviewAuxActionsProps = {
  onForget: () => void;
  onSkip: () => void;
};

function ReviewAuxActions({ onForget, onSkip }: ReviewAuxActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onSkip}
        className="flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-500"
      >
        <SkipForward size={12} />
        跳过
      </button>
      <button
        type="button"
        onClick={onForget}
        className="flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-500"
      >
        <Diamond size={12} />
        遗忘
      </button>
    </div>
  );
}

function getOutcomeMeta(outcome: ReviewOutcome) {
  if (outcome === "success") {
    return {
      label: "回答正确",
      icon: CheckCircle2,
      textClassName: "text-emerald-600",
      panelClassName: "border-emerald-100 bg-emerald-50/70",
    };
  }

  if (outcome === "skip") {
    return {
      label: "本词已跳过",
      icon: SkipForward,
      textClassName: "text-amber-600",
      panelClassName: "border-amber-100 bg-amber-50/70",
    };
  }

  return {
    label: "回答错误",
    icon: XCircle,
    textClassName: "text-rose-500",
    panelClassName: "border-rose-100 bg-rose-50/70",
  };
}

export function ReviewCard({ word }: ReviewCardProps) {
  return <WordCard word={word} />;
}

export function AttitudeScreen({
  word,
  onSelect,
  onForget,
  onSkip,
}: {
  word: WordRecord;
  onSelect: (attitude: "+" | "O" | "-") => void;
  onForget: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-1 pb-4">
        <span className="text-sm font-semibold text-neutral-500">判断正负态度</span>
        <ReviewAuxActions onForget={onForget} onSkip={onSkip} />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="text-5xl font-black tracking-tight text-neutral-900">{word.spell}</div>
          {word.partOfSpeech ? <div className="mt-3 text-base text-neutral-400">{word.partOfSpeech}</div> : null}
        </div>
      </div>

      <div className="flex gap-4 pb-4">
        {(
          [
            { value: "-" as const, icon: Minus, label: "负" },
            { value: "O" as const, icon: Circle, label: "中性" },
            { value: "+" as const, icon: Plus, label: "正" },
          ] as const
        ).map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className="flex flex-1 flex-col items-center gap-2 rounded-3xl border border-neutral-200 bg-white py-5 text-sm font-medium text-neutral-700 shadow-sm"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
              <Icon size={20} />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MeaningScreen({
  word,
  options,
  onSelect,
  onForget,
  onSkip,
}: {
  word: WordRecord;
  options: string[];
  onSelect: (meaning: string) => void;
  onForget: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-1 pb-4">
        <span className="text-sm font-semibold text-neutral-500">判断词意</span>
        <ReviewAuxActions onForget={onForget} onSkip={onSkip} />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="text-5xl font-black tracking-tight text-neutral-900">{word.spell}</div>
          {word.partOfSpeech ? <div className="mt-3 text-base text-neutral-400">{word.partOfSpeech}</div> : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-4">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-left text-sm font-medium text-neutral-800 shadow-sm"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CardResultScreen({
  word,
  outcome,
  onNext,
}: {
  word: WordRecord;
  outcome: ReviewOutcome;
  onNext: () => void;
}) {
  const meta = getOutcomeMeta(outcome);
  const Icon = meta.icon;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <ReviewCard word={word} />

      <div className={`flex items-center justify-between rounded-2xl border px-5 py-4 shadow-sm ${meta.panelClassName}`}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-neutral-500">测试结果：</span>
          <span className={`flex items-center gap-2 text-base font-black ${meta.textClassName}`}>
            <Icon size={18} />
            {meta.label}
          </span>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: APP_PURPLE }}
        >
          下一词
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
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
