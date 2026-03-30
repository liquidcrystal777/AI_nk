"use client";

import { Minus, Circle, Plus, ArrowRight, Diamond, CheckCircle2, SkipForward, XCircle } from "lucide-react";
import { WordCard } from "@/components/common/word-card";
import { APP_PURPLE } from "@/lib/utils/constants";
import type { MeaningOption, ReviewOutcome } from "@/lib/hooks/use-review-stage";
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
        className="flex items-center gap-1 rounded-full border border-[#eadcf0] bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-500 shadow-sm"
      >
        <SkipForward size={12} />
        跳过
      </button>
      <button
        type="button"
        onClick={onForget}
        className="flex items-center gap-1 rounded-full border border-[#eadcf0] bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-500 shadow-sm"
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
      panelClassName: "border-emerald-100 bg-emerald-50/78",
    };
  }

  if (outcome === "skip") {
    return {
      label: "本词已跳过",
      icon: SkipForward,
      textClassName: "text-amber-600",
      panelClassName: "border-amber-100 bg-amber-50/80",
    };
  }

  return {
    label: "回答错误",
    icon: XCircle,
    textClassName: "text-rose-500",
    panelClassName: "border-rose-100 bg-rose-50/78",
  };
}

function ReviewStagePanel({ title, children, actions }: { title: string; children: React.ReactNode; actions: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(250,244,255,0.92)_100%)] px-4 py-3 shadow-sm backdrop-blur-sm">
      <span className="text-sm font-semibold tracking-[0.04em] text-neutral-500">{title}</span>
      {actions}
    </div>
  );
}

function ReviewSpellHero({ word }: { word: WordRecord }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(247,239,251,0.94)_100%)] px-6 py-9 text-center shadow-sm backdrop-blur-sm">
      <div>
        <div className="bg-[linear-gradient(180deg,#2d1634_0%,#660874_100%)] bg-clip-text text-5xl font-black tracking-tight text-transparent">
          {word.spell}
        </div>
        {word.partOfSpeech ? <div className="mt-3 text-base font-medium text-neutral-400">{word.partOfSpeech}</div> : null}
      </div>
    </div>
  );
}

export function ReviewCard({ word }: ReviewCardProps) {
  return <WordCard word={word} className="shadow-[0_18px_40px_rgba(102,8,116,0.08)]" />;
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
    <div className="flex flex-1 flex-col gap-4">
      <ReviewStagePanel title="判断正负态度" actions={<ReviewAuxActions onForget={onForget} onSkip={onSkip} />}>
        <span />
      </ReviewStagePanel>

      <ReviewSpellHero word={word} />

      <div className="grid grid-cols-3 gap-3 pb-2">
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
            className="flex flex-col items-center gap-2 rounded-[1.7rem] border border-[#eee3f3] bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(250,245,252,0.95)_100%)] py-5 text-sm font-medium text-neutral-700 shadow-sm transition hover:-translate-y-0.5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(102,8,116,0.08)] text-[#660874]">
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
  options: MeaningOption[];
  onSelect: (meaning: MeaningOption) => void;
  onForget: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <ReviewStagePanel title="判断词意" actions={<ReviewAuxActions onForget={onForget} onSkip={onSkip} />}>
        <span />
      </ReviewStagePanel>

      <ReviewSpellHero word={word} />

      <div className="flex flex-col gap-3 pb-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option)}
            className="w-full rounded-[1.6rem] border border-[#eee3f3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(250,245,252,0.95)_100%)] px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c6594]">{option.partOfSpeech || "词义"}</div>
            <div className="mt-2 text-base font-semibold leading-7 text-neutral-900">{option.text}</div>
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

      <div className={`flex items-center justify-between rounded-[1.6rem] border px-5 py-4 shadow-sm ${meta.panelClassName}`}>
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
