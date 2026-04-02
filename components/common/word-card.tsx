import type { CSSProperties, ReactNode } from "react";
import { SectionCard } from "@/components/common/section-card";
import { formatDisplayYear, formatSourceTextLabel, formatWordSpell } from "@/lib/utils/text";
import type { CardType, ComparisonContent, WordRecord } from "@/types/db";

type WordCardProps = {
  word: WordRecord;
  className?: string;
  compact?: boolean;
  headerActions?: ReactNode;
  footer?: ReactNode;
  variant?: "default" | "browse";
  contentClassName?: string;
};

const printTextStyle: CSSProperties = {
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  textRendering: "optimizeLegibility",
};

function buildSourceLabel(word: WordRecord) {
  if (word.mode === "general") {
    return "通用模式";
  }

  if (!word.year && !word.sourceTextId) {
    return "";
  }

  return [formatDisplayYear(word.year), formatSourceTextLabel(word.sourceTextId)].filter(Boolean).join(" · ");
}

function normalizeSentiment(sentiment: string) {
  if (sentiment.includes("正")) return "正向";
  if (sentiment.includes("负")) return "负向";
  return "中性";
}

function FocusLabel({ children }: { children: ReactNode }) {
  return <div className="font-latex text-sm font-bold tracking-tight text-[var(--card-label-color)]">【{children}】</div>;
}

function InlineLabel({ children }: { children: ReactNode }) {
  return <span className="font-latex text-sm font-bold tracking-tight text-[var(--card-label-color)]">{children}</span>;
}

function splitDeodorizedMeaning(input: string) {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    plain: lines[0] ?? "",
    exam: lines[1] ?? "",
  };
}

function parseRareMeaning(meaning: string) {
  const match = meaning.match(/熟义[：:]\s*([^;；]+)[;；]?\s*僻义[：:]\s*(.+)/);
  if (match) {
    return { common: match[1].trim(), rare: match[2].trim() };
  }
  return { common: "", rare: meaning };
}

function renderPhraseContent(word: WordRecord) {
  return (
    <>
      <div className="space-y-2.5">
        <FocusLabel>释义</FocusLabel>
        <p className="text-[15px] font-semibold leading-[1.8] tracking-[-0.01em] text-[var(--card-text)]">
          {word.meaning || "暂无释义"}
        </p>
      </div>

      <div className="space-y-2.5">
        <FocusLabel>考点逻辑</FocusLabel>
        <div className="space-y-1.5 text-[15px] font-medium leading-[1.8] tracking-[-0.01em] text-[var(--card-text)]">
          {word.structureAnalysis ? (
            <p>
              <InlineLabel>结构拆解：</InlineLabel>
              <span>{word.structureAnalysis}</span>
            </p>
          ) : null}
          {word.collocationTrap ? (
            <p>
              <InlineLabel>搭配陷阱：</InlineLabel>
              <span>{word.collocationTrap}</span>
            </p>
          ) : null}
          {word.typicalContext ? (
            <p>
              <InlineLabel>典型语境：</InlineLabel>
              <span>{word.typicalContext}</span>
            </p>
          ) : null}
          {word.originalSentence ? (
            <p className="line-clamp-3">
              <InlineLabel>原句：</InlineLabel>
              <span className="font-serif italic tracking-wide">{word.originalSentence}</span>
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}

function renderRareMeaningContent(word: WordRecord) {
  const { common, rare } = parseRareMeaning(word.meaning || "");
  const trapAnalysis = splitDeodorizedMeaning(word.deodorizedMeaning || "");

  return (
    <>
      <div className="space-y-2.5">
        <FocusLabel>熟义 / 僻义</FocusLabel>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--card-rare-meaning-common-bg)] p-3">
            <div className="text-xs text-[var(--card-text-muted)]">熟义</div>
            <p className="mt-1 font-medium text-[var(--card-text)]">{common || "—"}</p>
          </div>
          <div className="rounded-lg border border-[var(--card-rare-meaning-rare-border)] bg-[var(--card-rare-meaning-rare-bg)] p-3">
            <div className="text-xs text-[var(--card-label-color)]">僻义</div>
            <p className="mt-1 font-medium text-[var(--card-text)]">{rare || word.meaning || "—"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <FocusLabel>僻义陷阱</FocusLabel>
        <div className="space-y-1.5 text-[15px] font-medium leading-[1.8] text-[var(--card-text)]">
          {trapAnalysis.exam ? (
            <p>
              <InlineLabel>识别要点：</InlineLabel>
              <span>{trapAnalysis.exam}</span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2.5">
        <FocusLabel>僻义语境</FocusLabel>
        <p className="line-clamp-3 font-serif text-[15px] italic leading-[1.8] tracking-wide text-[var(--card-text)]">
          {word.originalSentence || "暂无语境"}
        </p>
      </div>

      {word.usageExplanation ? (
        <div className="space-y-2.5">
          <FocusLabel>记忆抓手</FocusLabel>
          <p className="text-[15px] font-medium leading-[1.8] text-[var(--card-text)]">{word.usageExplanation}</p>
        </div>
      ) : null}
    </>
  );
}

function renderComparisonContent(data: ComparisonContent) {
  return (
    <>
      <div className="space-y-2.5">
        <FocusLabel>核心差异</FocusLabel>
        <p className="text-[15px] font-semibold leading-[1.8] text-[var(--card-text)]">{data.contrastSummary}</p>
      </div>

      <div className="space-y-2.5">
        <FocusLabel>辨析对比</FocusLabel>
        <div className="grid grid-cols-2 divide-x divide-[var(--card-comparison-divider)] rounded-lg border border-[var(--card-border)] bg-[var(--card-surface)]">
          {/* 左栏：单词A */}
          <div className="space-y-2 p-4">
            <div className="text-xl font-bold text-[var(--card-comparison-word-a)]">{data.wordA.spell}</div>
            <div className="text-sm text-[var(--card-text-muted)]">{data.wordA.partOfSpeech}</div>
            <div className="mt-2 font-medium text-[var(--card-text)]">{data.wordA.meaning}</div>
            <div className="mt-2 rounded bg-[var(--card-tag-bg)] p-2 text-sm">
              <span className="font-medium text-[var(--card-label-color)]">核心差异：</span>
              <span className="text-[var(--card-text)]">{data.wordA.keyDifference}</span>
            </div>
            {data.wordA.usageExplanation ? (
              <div className="text-xs text-[var(--card-text-muted)]">{data.wordA.usageExplanation}</div>
            ) : null}
          </div>

          {/* 右栏：单词B */}
          <div className="space-y-2 p-4">
            <div className="text-xl font-bold text-[var(--card-comparison-word-b)]">{data.wordB.spell}</div>
            <div className="text-sm text-[var(--card-text-muted)]">{data.wordB.partOfSpeech}</div>
            <div className="mt-2 font-medium text-[var(--card-text)]">{data.wordB.meaning}</div>
            <div className="mt-2 rounded bg-[var(--card-tag-bg)] p-2 text-sm">
              <span className="font-medium text-[var(--card-label-color)]">核心差异：</span>
              <span className="text-[var(--card-text)]">{data.wordB.keyDifference}</span>
            </div>
            {data.wordB.usageExplanation ? (
              <div className="text-xs text-[var(--card-text-muted)]">{data.wordB.usageExplanation}</div>
            ) : null}
          </div>
        </div>
      </div>

      {data.commonContext ? (
        <div className="space-y-2.5">
          <FocusLabel>易混场景</FocusLabel>
          <p className="text-[15px] leading-[1.8] text-[var(--card-text)]">{data.commonContext}</p>
        </div>
      ) : null}
    </>
  );
}

export function WordCard({
  word,
  className = "",
  headerActions,
  footer,
  variant = "default",
  contentClassName = "",
}: WordCardProps) {
  const sourceLabel = buildSourceLabel(word);
  const sentimentLabel = normalizeSentiment(word.sentiment || "");
  const displaySpell = formatWordSpell(word.spell);
  const deodorizedMeaning = splitDeodorizedMeaning(word.deodorizedMeaning || "");
  const isBrowseVariant = variant === "browse";
  const cardType = word.cardType || "normal";

  const isComparison = cardType === "comparison";
  const isPhrase = cardType === "phrase";
  const isRareMeaning = cardType === "rare_meaning";

  // Determine header styles based on variant and card type
  const headerStyle = isComparison
    ? { background: "var(--card-header-bg)" }
    : isBrowseVariant
      ? { background: "var(--card-browse-header-bg)", borderColor: "var(--card-browse-header-border)" }
      : { background: "var(--card-header-bg)" };

  const headerTextStyle = isComparison
    ? { color: "var(--card-header-text)" }
    : isBrowseVariant
      ? { color: "var(--card-browse-header-text)" }
      : { color: "var(--card-header-text)" };

  return (
    <SectionCard className={[
      "overflow-hidden rounded-[1.1rem] border p-0 shadow-md",
      isBrowseVariant ? "shadow-[0_16px_38px_rgba(102,8,116,0.10)]" : "",
      className,
    ].join(" ")} style={{ backgroundColor: "var(--card-surface)", borderColor: "var(--card-border)" }}>
      <div className="overflow-hidden rounded-[1.1rem]" style={{ backgroundColor: "var(--card-surface)" }}>
        <div
          className="border-b px-5 py-4 sm:px-6"
          style={headerStyle}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className="truncate font-serif text-2xl font-bold tracking-[-0.01em] drop-shadow-[0_1px_1px_rgba(102,8,116,0.2)]"
                  style={headerTextStyle}
                >
                  {displaySpell}
                </div>
                {isComparison ? (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium" style={{ color: "var(--card-header-text)" }}>对比记忆</span>
                ) : isRareMeaning ? (
                  <span className="rounded-full bg-amber-500/80 px-2 py-0.5 text-xs font-medium text-amber-50">熟词僻义</span>
                ) : isPhrase ? (
                  <span className="rounded-full bg-sky-500/80 px-2 py-0.5 text-xs font-medium text-sky-50">词组</span>
                ) : null}
                {word.partOfSpeech && !isBrowseVariant && !isComparison ? (
                  <div className="font-serif text-lg" style={{ color: "var(--card-header-text)", opacity: 0.9 }}>{word.partOfSpeech}</div>
                ) : null}
              </div>
              {sourceLabel && !isBrowseVariant && !isComparison ? (
                <div className="mt-2 text-sm" style={{ color: "var(--card-header-text)", opacity: 0.8 }}>{sourceLabel}</div>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              {word.partOfSpeech && !isBrowseVariant && !isComparison ? (
                <div className="font-serif text-lg" style={{ color: "var(--card-header-text)", opacity: 0.9 }}>{word.partOfSpeech}</div>
              ) : null}
              {!isBrowseVariant && !isComparison ? (
                <span
                  className="rounded-md px-2 py-1 text-xs font-semibold"
                  style={{ border: "1px solid rgba(255,255,255,0.3)", color: "var(--card-header-text)", opacity: 0.95 }}
                >
                  {sentimentLabel}
                </span>
              ) : null}
              {headerActions ? <div className="flex items-center gap-2">{headerActions}</div> : null}
            </div>
          </div>
        </div>

        <div
          className={[
            "grid grid-rows-[1fr_auto]",
            isComparison ? "min-h-[20rem]" : isBrowseVariant ? "min-h-[31rem]" : "min-h-[26rem]",
          ].join(" ")}
        >
          <div
            style={printTextStyle}
            className={[
              "font-latex overflow-y-auto px-5 py-6 text-[15px] font-medium leading-[1.8] tracking-[-0.01em] text-justify sm:px-6",
              isBrowseVariant || isComparison ? "space-y-4" : "space-y-7",
              contentClassName,
            ].join(" ")}
          >
            {isComparison && word.comparisonData ? (
              renderComparisonContent(word.comparisonData)
            ) : isPhrase ? (
              renderPhraseContent(word)
            ) : isRareMeaning ? (
              renderRareMeaningContent(word)
            ) : (
              <>
                <div className="space-y-2.5">
                  <FocusLabel>{isBrowseVariant ? "释义" : "极简释义"}</FocusLabel>
                  <p
                    className={[
                      "text-[15px] font-semibold leading-[1.8] tracking-[-0.01em] text-[var(--card-text)]",
                      isBrowseVariant ? "line-clamp-4" : "text-base",
                    ].join(" ")}
                  >
                    {word.meaning || "暂无释义"}
                  </p>
                </div>

                <div className={isBrowseVariant ? "space-y-2.5" : "space-y-3"}>
                  <FocusLabel>{isBrowseVariant ? "考点逻辑" : "去味 / 考点"}</FocusLabel>

                  {isBrowseVariant ? (
                    <div className="space-y-1.5 text-[15px] font-medium leading-[1.8] tracking-[-0.01em] text-[var(--card-text)]">
                      <p className="line-clamp-3">
                        <InlineLabel>1.原句：</InlineLabel>
                        <span className="font-serif italic tracking-wide">{word.originalSentence || "暂无原句"}</span>
                      </p>
                      <p>
                        <InlineLabel>2.记忆词根：</InlineLabel>
                        <span>{word.usageExplanation || "暂无记忆/词根"}</span>
                      </p>
                      <p>
                        <InlineLabel>3.去味：</InlineLabel>
                        <span>{deodorizedMeaning.plain || word.deodorizedMeaning || "暂无去味"}</span>
                      </p>
                      <p>
                        <InlineLabel>4.考点：</InlineLabel>
                        <span>{deodorizedMeaning.exam || "暂无考点"}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <InlineLabel>白话解释</InlineLabel>
                        <p className="text-[15px] font-medium leading-[1.8] tracking-[-0.01em] text-[var(--card-text)]">{deodorizedMeaning.plain || word.deodorizedMeaning || "暂无去味"}</p>
                      </div>

                      <div className="space-y-1.5">
                        <InlineLabel>考研常考法</InlineLabel>
                        <p className="text-[15px] font-medium leading-[1.8] tracking-[-0.01em] text-[var(--card-text)]">{deodorizedMeaning.exam || "暂无考点提示"}</p>
                      </div>
                    </div>
                  )}
                </div>

                {!isBrowseVariant ? (
                  <div className="space-y-3">
                    <FocusLabel>辅助记忆</FocusLabel>

                    <div className="space-y-1.5">
                      <InlineLabel>记忆 / 词根</InlineLabel>
                      <p className="text-[15px] font-medium leading-[1.8] tracking-[-0.01em] text-[var(--card-text)]">{word.usageExplanation || "暂无记忆/词根"}</p>
                    </div>

                    <div className="space-y-1.5">
                      <InlineLabel>最短语境</InlineLabel>
                      <p className="font-serif text-[15px] font-medium leading-[1.8] italic tracking-wide text-[var(--card-text)]">{word.originalSentence || "暂无原文"}</p>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {footer ? <div className="border-t px-5 py-4 sm:px-6" style={{ borderColor: "var(--card-footer-border)" }}>{footer}</div> : null}
        </div>
      </div>
    </SectionCard>
  );
}