import Link from "next/link";
import { useRef, useState } from "react";
import type { CardType, RecordDraft, RecordMode } from "@/types/db";

const SOURCE_TEXT_OPTIONS = ["TEXT1", "TEXT2", "TEXT3", "TEXT4"] as const;

type RecordPromptFormProps = {
  draft: RecordDraft;
  error: string;
  isGenerating: boolean;
  canGenerate: boolean;
  hasAiSettings: boolean;
  onFieldChange: <K extends keyof RecordDraft>(key: K, value: RecordDraft[K]) => void;
  onGenerate: () => void;
};

type SourceTextOption = {
  value: (typeof SOURCE_TEXT_OPTIONS)[number];
  label: string;
};

const sourceTextOptions: SourceTextOption[] = [
  { value: "TEXT1", label: "1" },
  { value: "TEXT2", label: "2" },
  { value: "TEXT3", label: "3" },
  { value: "TEXT4", label: "4" },
];

const modeOptions: Array<{ value: RecordMode; label: string }> = [
  { value: "reading", label: "阅读模式" },
  { value: "general", label: "通用模式" },
];

const cardTypeOptions: Array<{ value: CardType; label: string; description: string }> = [
  { value: "normal", label: "普通", description: "标准单词卡片" },
  { value: "phrase", label: "词组", description: "搭配、短语" },
  { value: "rare_meaning", label: "僻义", description: "熟词僻义" },
  { value: "comparison", label: "对比", description: "辨析易混词" },
];

function YearInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-2">
      <div className="text-center text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--editor-section-title)" }}>Year</div>
      <input
        type="text"
        inputMode="numeric"
        maxLength={4}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder="2020"
        className="w-full rounded-[1.4rem] px-4 py-3 text-center font-serif text-[1.55rem] font-semibold tracking-[0.16em] shadow-[0_18px_38px_rgba(102,8,116,0.08)] outline-none transition"
        style={{
          borderColor: "var(--theme-accent-soft)",
          background: "var(--card-bg)",
          color: "var(--theme-accent-strong)",
        }}
      />
    </label>
  );
}

function ModeToggle({ value, onChange }: { value: RecordMode; onChange: (value: RecordMode) => void }) {
  return (
    <div className="space-y-3">
      <div className="text-center text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--editor-section-title)" }}>Mode</div>
      <div
        className="grid grid-cols-2 gap-2 rounded-[1.3rem] p-1 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
        style={{
          border: "1px solid var(--theme-accent-soft)",
          backgroundColor: "var(--card-bg)",
        }}
      >
        {modeOptions.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className="rounded-[1rem] px-3 py-3 text-sm font-semibold transition active:scale-[0.99]"
              style={{
                background: isActive ? "var(--theme-accent-strong)" : "transparent",
                color: isActive ? "#ffffff" : "var(--theme-accent-strong)",
                boxShadow: isActive ? "0 10px 24px rgba(102,8,116,0.18)" : "none",
              }}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CardTypeSelector({ value, onChange }: { value: CardType; onChange: (value: CardType) => void }) {
  return (
    <div className="space-y-3">
      <div className="text-center text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--editor-section-title)" }}>Card Type</div>
      <div
        className="grid grid-cols-4 gap-1.5 rounded-[1.3rem] p-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
        style={{
          border: "1px solid var(--theme-accent-soft)",
          backgroundColor: "var(--card-bg)",
        }}
      >
        {cardTypeOptions.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className="rounded-[0.85rem] px-2 py-2.5 text-xs font-semibold transition active:scale-[0.99]"
              style={{
                background: isActive ? "var(--theme-accent-strong)" : "transparent",
                color: isActive ? "#ffffff" : "var(--theme-accent-strong)",
                boxShadow: isActive ? "0 8px 16px rgba(102,8,116,0.18)" : "none",
              }}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ComparisonInput({
  valueA,
  valueB,
  onChangeA,
  onChangeB,
}: {
  valueA: string;
  valueB: string;
  onChangeA: (value: string) => void;
  onChangeB: (value: string) => void;
}) {
  const [editingA, setEditingA] = useState(false);
  const [editingB, setEditingB] = useState(false);
  const [tempA, setTempA] = useState("");
  const [tempB, setTempB] = useState("");

  const handleStartA = () => {
    setTempA(valueA);
    setEditingA(true);
  };

  const handleStartB = () => {
    setTempB(valueB);
    setEditingB(true);
  };

  const handleConfirmA = () => {
    if (tempA.trim()) {
      onChangeA(tempA.trim());
    }
    setEditingA(false);
  };

  const handleConfirmB = () => {
    if (tempB.trim()) {
      onChangeB(tempB.trim());
    }
    setEditingB(false);
  };

  const handleCancelA = () => {
    setEditingA(false);
  };

  const handleCancelB = () => {
    setEditingB(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 单词 A */}
      {editingA ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tempA}
            onChange={(e) => setTempA(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmA();
              if (e.key === "Escape") handleCancelA();
            }}
            autoFocus
            placeholder="输入单词A"
            className="min-h-[3.5rem] min-w-[10rem] rounded-[1.5rem] px-4 text-center text-lg font-semibold outline-none ring-2 ring-[var(--theme-accent-strong)]"
            style={{
              backgroundColor: "var(--card-bg)",
              color: "var(--theme-accent-strong)",
            }}
          />
          <button
            type="button"
            onClick={handleConfirmA}
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm transition"
            style={{
              backgroundColor: "var(--theme-accent-strong)",
              color: "#fff",
            }}
          >
            ✓
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleStartA}
          className="min-h-[3.5rem] min-w-[10rem] rounded-[1.5rem] px-4 text-center text-lg font-semibold shadow-[0_12px_28px_rgba(102,8,116,0.08)] transition active:scale-[0.99]"
          style={{
            borderColor: valueA ? "var(--theme-accent-strong)" : "var(--theme-accent-soft)",
            backgroundColor: valueA ? "var(--theme-accent-muted)" : "var(--theme-accent-faint)",
            color: "var(--theme-accent-strong)",
            border: "1px solid",
          }}
        >
          {valueA || "单词A"}
        </button>
      )}

      {/* vs 分隔 */}
      <div className="flex items-center gap-3">
        <div className="h-px w-8 bg-[var(--theme-accent-soft)]" />
        <span className="text-base font-bold" style={{ color: "var(--theme-accent-strong)" }}>vs</span>
        <div className="h-px w-8 bg-[var(--theme-accent-soft)]" />
      </div>

      {/* 单词 B */}
      {editingB ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tempB}
            onChange={(e) => setTempB(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmB();
              if (e.key === "Escape") handleCancelB();
            }}
            autoFocus
            placeholder="输入单词B"
            className="min-h-[3.5rem] min-w-[10rem] rounded-[1.5rem] px-4 text-center text-lg font-semibold outline-none ring-2 ring-[var(--theme-accent-strong)]"
            style={{
              backgroundColor: "var(--card-bg)",
              color: "var(--theme-accent-strong)",
            }}
          />
          <button
            type="button"
            onClick={handleConfirmB}
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm transition"
            style={{
              backgroundColor: "var(--theme-accent-strong)",
              color: "#fff",
            }}
          >
            ✓
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleStartB}
          className="min-h-[3.5rem] min-w-[10rem] rounded-[1.5rem] px-4 text-center text-lg font-semibold shadow-[0_12px_28px_rgba(102,8,116,0.08)] transition active:scale-[0.99]"
          style={{
            borderColor: valueB ? "var(--theme-accent-strong)" : "var(--theme-accent-soft)",
            backgroundColor: valueB ? "var(--theme-accent-muted)" : "var(--theme-accent-faint)",
            color: "var(--theme-accent-strong)",
            border: "1px solid",
          }}
        >
          {valueB || "单词B"}
        </button>
      )}
    </div>
  );
}

function SourceTextButtons({ value, onChange }: { value: string; onChange: (value: SourceTextOption["value"]) => void }) {
  return (
    <div className="space-y-3">
      <div className="text-center text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--editor-section-title)" }}>Text</div>
      <div className="flex items-center justify-center gap-3">
        {sourceTextOptions.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold transition active:scale-[0.98]"
              style={{
                borderColor: isActive ? "var(--theme-accent-strong)" : "var(--theme-accent-soft)",
                backgroundColor: isActive ? "var(--theme-accent-strong)" : "var(--card-bg)",
                color: isActive ? "#ffffff" : "var(--theme-accent-strong)",
                boxShadow: isActive
                  ? "0 12px 28px rgba(102,8,116,0.18)"
                  : "0 10px 24px rgba(15,23,42,0.06)",
                border: "1px solid",
              }}
              aria-pressed={isActive}
              aria-label={`选择 Text ${option.label}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VintageInputDisplay({ value, onClick }: { value: string; onClick: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[11.5rem] w-full items-center justify-center rounded-[2rem] px-6 text-center shadow-[0_18px_40px_rgba(102,8,116,0.08)] transition active:scale-[0.99]"
        style={{
          borderColor: "var(--theme-accent-soft)",
          backgroundColor: "var(--theme-accent-faint)",
          border: "1px solid",
        }}
        aria-label="输入单词"
      >
        <div className="vintage-input-text font-mono text-[2rem] font-semibold tracking-[0.08em] sm:text-[2.35rem]">
          <span>{value || ""}</span>
          <span className="vintage-caret ml-1 inline-block">|</span>
        </div>
      </button>

      <style jsx>{`
        .vintage-input-text {
          color: var(--theme-accent-strong);
        }

        .vintage-caret {
          color: var(--theme-accent-strong);
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

export function RecordPromptForm({ draft, error, isGenerating, hasAiSettings, onFieldChange }: RecordPromptFormProps) {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const isReadingMode = draft.mode === "reading";
  const isComparison = draft.cardType === "comparison";

  return (
    <div className="flex flex-1 flex-col pt-6">
      {isComparison ? null : (
        <input
          ref={hiddenInputRef}
          value={draft.spell}
          onChange={(event) => onFieldChange("spell", event.target.value)}
          className="pointer-events-none absolute opacity-0"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}

      <div className="flex flex-1 flex-col">
        <div className="mt-4 flex justify-center">
          <div className="w-full max-w-[18rem]">
            <ModeToggle value={draft.mode} onChange={(nextValue) => onFieldChange("mode", nextValue)} />
          </div>
        </div>

        <div className="mt-3 flex justify-center">
          <div className="w-full max-w-[22rem]">
            <CardTypeSelector value={draft.cardType || "normal"} onChange={(nextValue) => onFieldChange("cardType", nextValue)} />
          </div>
        </div>

        {isComparison ? (
          <div className="mt-6 flex flex-1 items-center justify-center">
            <ComparisonInput
              valueA={draft.comparisonWordA || ""}
              valueB={draft.comparisonWordB || ""}
              onChangeA={(v) => onFieldChange("comparisonWordA", v)}
              onChangeB={(v) => onFieldChange("comparisonWordB", v)}
            />
          </div>
        ) : (
          <div className="mt-4 flex flex-1 items-center justify-center">
            <VintageInputDisplay value={draft.spell} onClick={() => hiddenInputRef.current?.focus()} />
          </div>
        )}

        {isReadingMode && !isComparison ? (
          <div className="mt-4 flex justify-center">
            <div className="w-full max-w-[12rem]">
              <YearInput value={draft.year} onChange={(nextValue) => onFieldChange("year", nextValue)} />
            </div>
          </div>
        ) : null}

        {isReadingMode && !isComparison ? (
          <div className="mt-auto flex justify-center pt-4">
            <SourceTextButtons
              value={draft.sourceTextId}
              onChange={(nextValue) => onFieldChange("sourceTextId", nextValue)}
            />
          </div>
        ) : isComparison ? (
          <div className="mt-auto pt-4 text-center text-sm leading-6" style={{ color: "var(--editor-section-title)" }}>
            对比卡片将生成两个易混淆单词的辨析内容，仅供查阅参考，不参与复习流程。
          </div>
        ) : (
          <div className="mt-auto pt-4 text-center text-sm leading-6" style={{ color: "var(--editor-section-title)" }}>
            通用模式将直接生成一个最具代表性的考研例句，不再依赖真题年份与文章来源。
          </div>
        )}

        {!hasAiSettings ? (
          <div
            className="mt-4 rounded-[1.25rem] px-4 py-3 text-sm"
            style={{
              backgroundColor: "rgba(254, 243, 199, 0.9)",
              border: "1px solid rgba(253, 186, 116, 0.8)",
              color: "#92400e",
            }}
          >
            <div className="font-semibold">还没配置 AI 设置</div>
            <div className="mt-1 leading-6" style={{ color: "#b45309" }}>请先填写 AI API Key 和模型名，再回来生成词卡。</div>
            <Link
              href="/settings"
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-[0.95rem] px-3 py-2 text-sm font-semibold shadow-sm"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid rgba(253, 186, 116, 0.9)",
                color: "#78350f",
              }}
            >
              去设置页
            </Link>
          </div>
        ) : null}

        {isGenerating ? (
          <div
            className="mt-4 rounded-[1.25rem] px-4 py-3 text-center text-sm font-medium"
            style={{
              backgroundColor: "var(--theme-accent-muted)",
              border: "1px solid var(--theme-accent-soft)",
              color: "var(--theme-accent-strong)",
            }}
          >
            {isComparison ? "正在生成对比辨析卡片，请稍等..." : isReadingMode ? "正在读取对应真题并生成词卡，请稍等..." : "正在生成通用模式代表句与词卡，请稍等..."}
          </div>
        ) : null}

        {error ? (
          <div
            className="mt-4 rounded-[1.25rem] px-4 py-3 text-sm"
            style={{
              backgroundColor: "rgba(254, 242, 242, 0.9)",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}