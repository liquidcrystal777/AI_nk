"use client";

import { useEffect, useRef } from "react";
import { Minus, Circle, Plus, ArrowRight, Diamond, CheckCircle2, XCircle } from "lucide-react";
import { WordCard } from "@/components/common/word-card";
import type { ReviewOutcome } from "@/lib/hooks/use-review-stage";
import type { WordRecord } from "@/types/db";
import type { ReviewAction } from "@/types/review";

type ReviewCardProps = {
  word: WordRecord;
};

type ReviewAuxActionsProps = {
  onForget: () => void;
};

function ReviewAuxActions({ onForget }: ReviewAuxActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onForget}
        className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm"
        style={{
          backgroundColor: "var(--review-btn-bg)",
          border: "1px solid var(--review-btn-border)",
          color: "var(--review-panel-text)",
        }}
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
      panelBg: "rgba(209, 250, 229, 0.78)",
      panelBorder: "rgba(16, 185, 129, 0.25)",
    };
  }

  return {
    label: "回答错误",
    icon: XCircle,
    textClassName: "text-rose-500",
    panelBg: "rgba(254, 242, 242, 0.78)",
    panelBorder: "rgba(251, 113, 133, 0.25)",
  };
}

function ReviewStagePanel({ title, children, actions }: { title: string; children: React.ReactNode; actions: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between rounded-[1.75rem] px-4 py-3 shadow-sm backdrop-blur-sm"
      style={{
        background: "var(--review-panel-bg)",
        border: "1px solid var(--review-panel-border)",
      }}
    >
      <span className="text-sm font-semibold tracking-[0.04em]" style={{ color: "var(--review-panel-text)" }}>{title}</span>
      {actions}
    </div>
  );
}

function ReviewSpellHero({ word }: { word: WordRecord }) {
  return (
    <div
      className="flex flex-1 items-center justify-center rounded-[2rem] px-6 py-10 text-center shadow-[0_16px_36px_rgba(102,8,116,0.07)] backdrop-blur-sm"
      style={{
        background: "var(--review-hero-bg)",
        border: "1px solid var(--review-hero-border)",
      }}
    >
      <div>
        <div className="text-5xl font-black tracking-[-0.03em] sm:text-6xl" style={{ color: "var(--review-hero-text)" }}>{word.spell}</div>
        {word.partOfSpeech ? <div className="mt-3 text-sm font-medium tracking-[0.08em]" style={{ color: "var(--review-hero-pos)" }}>{word.partOfSpeech}</div> : null}
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
          borderColor: "var(--theme-accent-soft)",
          backgroundColor: "var(--theme-accent-faint)",
        }}
        aria-label="输入词义"
      >
        <div className="font-mono text-[1.45rem] font-semibold tracking-[0.08em] text-[var(--foreground)] sm:text-[1.75rem]">
          <span>{value || ""}</span>
          <span className="ml-1 inline-block text-[var(--theme-accent-strong)] vintage-caret">|</span>
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
}: {
  word: WordRecord;
  onSelect: (attitude: "+" | "O" | "-") => void;
  onForget: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <ReviewStagePanel title="判断正负态度" actions={<ReviewAuxActions onForget={onForget} />}>
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
            className="flex flex-col items-center gap-2 rounded-[1.7rem] py-5 text-sm font-medium shadow-sm transition hover:-translate-y-0.5"
            style={{
              background: "var(--review-action-bg)",
              border: "1px solid var(--review-action-border)",
              color: "var(--review-btn-label)",
            }}
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{
                backgroundColor: "var(--review-action-icon-bg)",
                color: "var(--review-btn-text)",
              }}
            >
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
}: {
  word: WordRecord;
  value: string;
  error: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onForget: () => void;
}) {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    hiddenInputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <ReviewStagePanel title="输入你理解的词义" actions={<ReviewAuxActions onForget={onForget} />}>
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

        <div
          className="rounded-[1.5rem] px-4 py-3 text-sm leading-6 shadow-sm"
          style={{
            backgroundColor: "var(--panel-bg)",
            border: "1px solid var(--panel-border)",
            color: "var(--muted-foreground)",
          }}
        >
          不用写得很标准，写出你心里的中文理解即可，AI 会按核心语义判定。
        </div>

        {error ? (
          <div
            className="rounded-[1.4rem] px-4 py-3 text-sm"
            style={{
              backgroundColor: "rgba(254, 242, 242, 0.9)",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex min-h-14 w-full items-center justify-center rounded-[1.5rem] px-5 text-base font-bold text-white shadow-[0_16px_30px_rgba(102,8,116,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: "var(--theme-accent-strong)" }}
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

      <div
        className="flex items-center justify-between rounded-[1.6rem] px-5 py-4 shadow-sm"
        style={{
          backgroundColor: meta.panelBg,
          border: `1px solid ${meta.panelBorder}`,
        }}
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span style={{ color: "var(--review-panel-text)" }}>测试结果：</span>
          <span className={`flex items-center gap-2 text-base font-black ${meta.textClassName}`}>
            <Icon size={18} />
            {meta.label}
          </span>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: "var(--theme-accent-strong)" }}
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
];

export function ReviewActions({ onAction }: { onAction: (action: ReviewAction) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map(({ action, label, icon: Icon }) => (
        <button
          key={action}
          type="button"
          onClick={() => onAction(action)}
          className="flex flex-col items-center gap-2 rounded-3xl px-3 py-4 text-sm font-medium shadow-sm"
          style={{
            backgroundColor: "var(--review-action-bg)",
            border: "1px solid var(--review-action-border)",
            color: "var(--review-action-text)",
          }}
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--review-action-icon-bg)" }}
          >
            <Icon size={18} />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}