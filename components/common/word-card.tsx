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

function FocusLabel({ children, suffix }: { children: ReactNode; suffix?: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="font-latex text-sm font-bold tracking-tight text-[var(--card-label-color)]">【{children}】</div>
      {suffix ? <div className="text-sm font-medium text-[var(--card-text-muted)]">{suffix}</div> : null}
    </div>
  );
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
        <FocusLabel suffix={word.partOfSpeech}>释义</FocusLabel>
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
        <FocusLabel suffix={word.partOfSpeech}>熟义 / 僻义</FocusLabel>
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

// 获取记忆内容：分别显示词根记忆和联想记忆
function renderMemorySection(word: WordRecord) {
  const hasRootMemory = word.rootMemory && word.rootMemory !== "无明确词根" && word.rootMemory !== "「无明确词根」";
  const hasAssociationMemory = word.associationMemory && word.associationMemory.trim();

  if (!hasRootMemory && !hasAssociationMemory) {
    // fallback 到旧字段
    if (word.usageExplanation) {
      return (
        <div className="space-y-1.5">
          <p className="text-[15px] font-medium leading-[1.8] tracking-[-0.01em] text-[var(--card-text)]">{word.usageExplanation}</p>
        </div>
      );
    }
    return <p className="text-[var(--card-text-muted)]">暂无记忆内容</p>;
  }

  return (
    <div className="space-y-2">
      {hasRootMemory ? (
        <div className="rounded-lg bg-[var(--card-tag-bg)] px-3 py-2">
          <span className="text-xs font-semibold text-[var(--card-label-color)]">词根：</span>
          <span className="text-[15px] text-[var(--card-text)]">{word.rootMemory}</span>
        </div>
      ) : null}
      {hasAssociationMemory ? (
        <div className="rounded-lg bg-[var(--card-tag-bg)] px-3 py-2">
          <span className="text-xs font-semibold text-[var(--card-label-color)]">联想：</span>
          <span className="text-[15px] text-[var(--card-text)]">{word.associationMemory}</span>
        </div>
      ) : null}
    </div>
  );
}

// 获取记忆内容文本（用于浏览模式的紧凑显示）
function getMemoryContent(word: WordRecord) {
  const lines: string[] = [];

  const hasRootMemory = word.rootMemory && word.rootMemory !== "无明确词根" && word.rootMemory !== "「无明确词根」";
  const hasAssociationMemory = word.associationMemory && word.associationMemory.trim();

  if (hasRootMemory) {
    lines.push(`词根：${word.rootMemory}`);
  }
  if (hasAssociationMemory) {
    lines.push(`联想：${word.associationMemory}`);
  }

  if (lines.length > 0) {
    return lines.join("\n");
  }

  // fallback 到旧字段
  return word.usageExplanation || "";
}

function renderComparisonContent(data: ComparisonContent) {
  return (
    <>
      <div className="space-y-2.5">
        <FocusLabel>辨析对比</FocusLabel>
        <div className="flex gap-6 py-2">
          {/* 左侧：单词A */}
          <div className="flex-1 space-y-1.5">
            <span className="text-xl font-bold text-[var(--card-comparison-word-a)]">{data.wordA.spell}</span>
            <p className="text-[15px] font-medium leading-[1.7] text-[var(--card-text)]">{data.wordA.meaning}</p>
            <p className="text-sm text-[var(--card-text-muted)]">
              <span className="font-medium text-[var(--card-label-color)]">差异点：</span>
              {data.wordA.keyDifference}
            </p>
          </div>

          {/* 中间分隔线 */}
          <div className="flex flex-col items-center justify-center">
            <div className="min-h-[4rem] w-px bg-[var(--card-comparison-divider)]" />
          </div>

          {/* 右侧：单词B */}
          <div className="flex-1 space-y-1.5">
            <span className="text-xl font-bold text-[var(--card-comparison-word-b)]">{data.wordB.spell}</span>
            <p className="text-[15px] font-medium leading-[1.7] text-[var(--card-text)]">{data.wordB.meaning}</p>
            <p className="text-sm text-[var(--card-text-muted)]">
              <span className="font-medium text-[var(--card-label-color)]">差异点：</span>
              {data.wordB.keyDifference}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <FocusLabel>关键搭配</FocusLabel>
        <div className="space-y-1.5 text-[15px]">
          <p className="text-[var(--card-text)]">
            <span className="font-semibold text-[var(--card-comparison-word-a)]">{data.wordA.spell}</span>
            <span className="text-[var(--card-text-muted)]">：{data.wordA.collocation || "暂无"}</span>
          </p>
          <p className="text-[var(--card-text)]">
            <span className="font-semibold text-[var(--card-comparison-word-b)]">{data.wordB.spell}</span>
            <span className="text-[var(--card-text-muted)]">：{data.wordB.collocation || "暂无"}</span>
          </p>
        </div>
      </div>
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

  // 统一 header 样式
  const headerStyle = isBrowseVariant
    ? { background: "var(--card-browse-header-bg)", borderColor: "var(--card-browse-header-border)" }
    : { background: "var(--card-header-bg)" };

  const headerTextStyle = isBrowseVariant
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
                {isRareMeaning ? (
                  <span className="rounded-full bg-amber-500/80 px-2 py-0.5 text-xs font-medium text-amber-50">熟词僻义</span>
                ) : isPhrase ? (
                  <span className="rounded-full bg-sky-500/80 px-2 py-0.5 text-xs font-medium text-sky-50">词组</span>
                ) : null}
                {word.partOfSpeech && !isBrowseVariant ? (
                  <div className="font-serif text-lg" style={{ color: "var(--card-header-text)", opacity: 0.9 }}>{word.partOfSpeech}</div>
                ) : null}
              </div>
              {sourceLabel && !isBrowseVariant ? (
                <div className="mt-2 text-sm" style={{ color: "var(--card-header-text)", opacity: 0.8 }}>{sourceLabel}</div>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              {!isBrowseVariant ? (
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
                  <FocusLabel suffix={word.partOfSpeech}>{isBrowseVariant ? "释义" : "极简释义"}</FocusLabel>
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
                      <div>
                        <InlineLabel>2.记忆：</InlineLabel>
                        <div className="mt-1 whitespace-pre-line">{getMemoryContent(word) || "暂无记忆"}</div>
                      </div>
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
                    <FocusLabel>记忆</FocusLabel>
                    {renderMemorySection(word)}
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