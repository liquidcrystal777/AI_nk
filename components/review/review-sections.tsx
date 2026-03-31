"use client";

import { useEffect, useRef } from "react";
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
    <div className="flex flex-1 items-center justify-center rounded-[2rem] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(247,239,251,0.92)_100%)] px-6 py-10 text-center shadow-[0_16px_36px_rgba(102,8,116,0.07)] backdrop-blur-sm">
      <div>
        <div className="text-5xl font-black tracking-[-0.03em] text-[#2d1634] sm:text-6xl">{word.spell}</div>
        {word.partOfSpeech ? <div className="mt-3 text-sm font-medium tracking-[0.08em] text-neutral-400">{word.partOfSpeech}</div> : null}
      </div>
    </div>
  );
}

function VintageMeaningInput({ value, onFocus }: { value: string; onFocus: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onFocus}
        className="flex min-h-[11.5rem] w-full items-center justify-center rounded-[2rem] border px-6 text-center shadow-[0_18px_40px_rgba(102,8,116,0.08)] transition active:scale-[0.99]"
        style={{
          borderColor: "rgba(102,8,116,0.18)",
          backgroundColor: "rgba(102,8,116,0.06)",
        }}
        aria-label="输入词义"
      >
        <div className="font-mono text-[1.45rem] font-semibold tracking-[0.08em] text-[#660874] sm:text-[1.75rem]">
          <span>{value || ""}</span>
          <span className="ml-1 inline-block vintage-caret">|</span>
        </div>
      </button>

      <style jsx>{`
        .vintage-caret {
          animation: vintage-caret-blink 1s steps(1, end) infinite;
        }

        @keyframes vintage-caret-blink {
          0%,
          49% {
            opacity: 1;
          }

          50%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

export function ReviewCard({ word }: ReviewCardProps) {
  return <WordCard word={word} variant="browse" className="shadow-[0_18px_40px_rgba(102,8,116,0.08)]" />;
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
  value,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  onForget,
  onSkip,
}: {
  word: WordRecord;
  value: string;
  error: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onForget: () => void;
  onSkip: () => void;
}) {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    hiddenInputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <ReviewStagePanel title="输入你理解的词义" actions={<ReviewAuxActions onForget={onForget} onSkip={onSkip} />}>
        <span />
      </ReviewStagePanel>

      <input
        ref={hiddenInputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pointer-events-none absolute opacity-0"
        autoCorrect="off"
        spellCheck={false}
        aria-hidden="true"
        tabIndex={-1}
      />

      <ReviewSpellHero word={word} />

      <div className="space-y-3 pb-2">
        <VintageMeaningInput value={value} onFocus={() => hiddenInputRef.current?.focus()} />

        <div className="rounded-[1.5rem] border border-white/80 bg-white/85 px-4 py-3 text-sm leading-6 text-neutral-500 shadow-sm">
          不用写得很标准，写出你心里的中文理解即可，AI 会按核心语义判定。
        </div>

        {error ? <div className="rounded-[1.4rem] bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex min-h-14 w-full items-center justify-center rounded-[1.5rem] px-5 text-base font-bold text-white shadow-[0_16px_30px_rgba(102,8,116,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: APP_PURPLE }}
        >
          {isSubmitting ? "AI 判定中..." : "提交判定"}
        </button>
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
