import { useEffect, useMemo, useRef } from "react";
import { APP_PURPLE } from "@/lib/utils/constants";
import type { RecordDraft } from "@/types/db";

const SOURCE_TEXT_OPTIONS = ["TEXT1", "TEXT2", "TEXT3", "TEXT4"] as const;
const YEAR_OPTIONS = Array.from({ length: 26 }, (_, index) => String(1998 + index));
const WHEEL_HEIGHT = 128;
const WHEEL_ITEM_HEIGHT = 40;
const WHEEL_SIDE_PADDING = (WHEEL_HEIGHT - WHEEL_ITEM_HEIGHT) / 2;

type RecordPromptFormProps = {
  draft: RecordDraft;
  error: string;
  isGenerating: boolean;
  canGenerate: boolean;
  onFieldChange: <K extends keyof RecordDraft>(key: K, value: RecordDraft[K]) => void;
  onGenerate: () => void;
};

type WheelOption = {
  value: string;
  label: string;
};

function VintageInputDisplay({ value, onClick }: { value: string; onClick: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[11.5rem] w-full items-center justify-center rounded-[2rem] border px-6 text-center shadow-[0_18px_40px_rgba(102,8,116,0.08)] transition active:scale-[0.99]"
        style={{
          borderColor: "rgba(102,8,116,0.18)",
          backgroundColor: "rgba(102,8,116,0.06)",
        }}
        aria-label="输入单词"
      >
        <div className="font-mono text-[2rem] font-semibold tracking-[0.08em] sm:text-[2.35rem]" style={{ color: APP_PURPLE }}>
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

function WheelPicker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: WheelOption[];
  onChange: (value: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedIndex = useMemo(() => {
    const index = options.findIndex((option) => option.value === value);
    return index >= 0 ? index : 0;
  }, [options, value]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({ top: selectedIndex * WHEEL_ITEM_HEIGHT, behavior: "smooth" });
  }, [selectedIndex]);

  function updateFromScroll(scrollTop: number) {
    const nextIndex = Math.max(0, Math.min(options.length - 1, Math.round(scrollTop / WHEEL_ITEM_HEIGHT)));
    const nextValue = options[nextIndex]?.value;
    if (nextValue && nextValue !== value) {
      onChange(nextValue);
    }
  }

  return (
    <>
      <div className="relative">
        <div
          className="pointer-events-none absolute left-0 right-0 z-10 rounded-[0.95rem] border-y"
          style={{
            top: `${WHEEL_SIDE_PADDING}px`,
            height: `${WHEEL_ITEM_HEIGHT}px`,
            borderColor: "rgba(102,8,116,0.14)",
            backgroundColor: "rgba(102,8,116,0.05)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20"
          style={{
            height: `${WHEEL_SIDE_PADDING}px`,
            background: "linear-gradient(180deg, rgba(246,244,248,0.94) 0%, rgba(246,244,248,0) 100%)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
          style={{
            height: `${WHEEL_SIDE_PADDING}px`,
            background: "linear-gradient(0deg, rgba(246,244,248,0.94) 0%, rgba(246,244,248,0) 100%)",
          }}
        />

        <div
          ref={containerRef}
          onScroll={(event) => updateFromScroll(event.currentTarget.scrollTop)}
          className="wheel-picker overflow-y-scroll snap-y snap-mandatory"
          style={{ height: `${WHEEL_HEIGHT}px` }}
        >
          <div style={{ paddingTop: `${WHEEL_SIDE_PADDING}px`, paddingBottom: `${WHEEL_SIDE_PADDING}px` }}>
            {options.map((option, index) => {
              const distance = Math.abs(index - selectedIndex);
              const isActive = index === selectedIndex;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    containerRef.current?.scrollTo({ top: index * WHEEL_ITEM_HEIGHT, behavior: "smooth" });
                    onChange(option.value);
                  }}
                  className="flex w-full snap-center items-center justify-center bg-transparent px-2 text-center transition-all duration-150"
                  style={{
                    height: `${WHEEL_ITEM_HEIGHT}px`,
                    color: isActive ? APP_PURPLE : "#9ca3af",
                    fontSize: isActive ? "1.18rem" : distance === 1 ? "0.92rem" : "0.78rem",
                    fontWeight: isActive ? 800 : distance === 1 ? 600 : 500,
                    opacity: isActive ? 1 : distance === 1 ? 0.62 : 0.32,
                    transform: `scale(${isActive ? 1 : distance === 1 ? 0.93 : 0.87})`,
                    textShadow: isActive ? "0 1px 0 rgba(255,255,255,0.6)" : "none",
                    fontFamily: '"Times New Roman", "Georgia", serif',
                    letterSpacing: isActive ? "0.14em" : "0.1em",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .wheel-picker {
          scrollbar-width: none;
        }

        .wheel-picker::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}

export function RecordPromptForm({ draft, error, onFieldChange }: RecordPromptFormProps) {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const yearOptions = YEAR_OPTIONS.map((year) => ({ value: year, label: year }));
  const sourceTextOptions: WheelOption[] = [
    { value: "TEXT1", label: "TEXT1" },
    ...SOURCE_TEXT_OPTIONS.slice(1).map((option) => ({ value: option, label: option })),
  ];

  return (
    <div className="flex flex-1 flex-col pt-6">
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

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center">
          <VintageInputDisplay value={draft.spell} onClick={() => hiddenInputRef.current?.focus()} />
        </div>

        <div className="mt-4 flex justify-center">
          <div className="w-1/2 min-w-[9rem]">
            <WheelPicker value={draft.year} options={yearOptions} onChange={(nextValue) => onFieldChange("year", nextValue)} />
          </div>
        </div>

        <div className="mt-auto flex justify-center pt-3">
          <div className="w-1/2 min-w-[9rem]">
            <WheelPicker
              value={draft.sourceTextId}
              options={sourceTextOptions}
              onChange={(nextValue) => onFieldChange("sourceTextId", nextValue)}
            />
          </div>
        </div>

        {error ? <div className="mt-4 rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
      </div>
    </div>
  );
}
