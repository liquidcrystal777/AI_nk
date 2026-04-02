"use client";

import { WordCard } from "@/components/common/word-card";
import { PrimaryButton } from "@/components/common/primary-button";
import type { CardType, ComparisonContent, RecordDraft, WordRecord } from "@/types/db";

type WordEditorFormProps = {
  draft: RecordDraft;
  error: string;
  isSaving: boolean;
  onFieldChange: <K extends keyof RecordDraft>(key: K, value: RecordDraft[K]) => void;
  onSave: () => void;
};

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section
      className="space-y-4 rounded-[1.75rem] p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-sm"
      style={{
        backgroundColor: "var(--editor-section-bg)",
        border: "1px solid var(--editor-section-border)",
      }}
    >
      <div className="space-y-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--editor-section-title)" }}>{title}</div>
        {description ? <div className="text-sm leading-6" style={{ color: "var(--editor-section-desc)" }}>{description}</div> : null}
      </div>
      {children}
    </section>
  );
}

function EditorSection(props: {
  label: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  if (props.multiline) {
    return (
      <label className="block space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--editor-label)" }}>{props.label}</div>
        <textarea
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          placeholder={props.placeholder}
          className="min-h-28 w-full rounded-[1.25rem] px-4 py-3 text-sm leading-7 outline-none transition"
          style={{
            backgroundColor: "var(--editor-input-bg)",
            border: "1px solid var(--editor-input-border)",
            color: "var(--editor-input-text)",
          }}
        />
      </label>
    );
  }

  return (
    <label className="block space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--editor-label)" }}>{props.label}</div>
      <input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder={props.placeholder}
        className="w-full rounded-[1.25rem] px-4 py-3 text-sm outline-none transition"
        style={{
          backgroundColor: "var(--editor-input-bg)",
          border: "1px solid var(--editor-input-border)",
          color: "var(--editor-input-text)",
        }}
      />
    </label>
  );
}

function buildPreviewWord(draft: RecordDraft): WordRecord {
  return {
    spell: draft.spell,
    partOfSpeech: draft.partOfSpeech,
    meaning: draft.meaning,
    originalSentence: draft.originalSentence,
    representativeSentence: draft.representativeSentence,
    usageExplanation: draft.usageExplanation,
    rootMemory: draft.rootMemory,
    associationMemory: draft.associationMemory,
    sentiment: draft.sentiment,
    deodorizedMeaning: draft.deodorizedMeaning,
    year: draft.year,
    sourceTextId: draft.sourceTextId,
    mode: draft.mode,
    status: "new",
    reviewCount: 0,
    nextReviewTime: 0,
    cardType: draft.cardType || "normal",
    excludeFromReview: draft.excludeFromReview || false,
    comparisonData: draft.comparisonData,
    structureAnalysis: draft.structureAnalysis,
    collocationTrap: draft.collocationTrap,
    typicalContext: draft.typicalContext,
  };
}

// 普通词汇卡片的编辑区域
function NormalCardEditor({ draft, onFieldChange }: { draft: RecordDraft; onFieldChange: <K extends keyof RecordDraft>(key: K, value: RecordDraft[K]) => void }) {
  const sentenceLabel = draft.mode === "general" ? "Representative" : "Original";
  const sentencePlaceholder = draft.mode === "general" ? "代表句" : "原句";

  return (
    <>
      <SectionCard title="基础信息" description="单词本体与核心释义">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <EditorSection
            label="Word"
            value={draft.spell}
            placeholder="单词"
            onChange={(value) => onFieldChange("spell", value)}
          />
          <EditorSection
            label="词性"
            value={draft.partOfSpeech}
            placeholder="如 n. / v. / adj."
            onChange={(value) => onFieldChange("partOfSpeech", value)}
          />
          <EditorSection
            label="Meaning"
            value={draft.meaning}
            placeholder="极简释义"
            onChange={(value) => onFieldChange("meaning", value)}
          />
        </div>
      </SectionCard>

      <SectionCard title="语境与记忆" description={draft.mode === "general" ? "通用模式代表句与记忆方式" : "原句、记忆方式与感情色彩"}>
        <EditorSection
          label={sentenceLabel}
          value={draft.originalSentence}
          placeholder={sentencePlaceholder}
          multiline
          onChange={(value) => {
            onFieldChange("originalSentence", value);
            if (draft.mode === "general") {
              onFieldChange("representativeSentence", value);
            }
          }}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EditorSection
            label="词根记忆"
            value={draft.rootMemory || ""}
            placeholder="词根/词缀拆解"
            onChange={(value) => onFieldChange("rootMemory", value)}
          />
          <EditorSection
            label="联想记忆"
            value={draft.associationMemory || ""}
            placeholder="画面/谐音联想"
            onChange={(value) => onFieldChange("associationMemory", value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EditorSection
            label="Sentiment"
            value={draft.sentiment}
            placeholder="[正+] / [负-] / [中性]"
            onChange={(value) => onFieldChange("sentiment", value)}
          />
        </div>

        <EditorSection
          label="去味 / 考点"
          value={draft.deodorizedMeaning}
          placeholder="第一行：白话解释；第二行：考研考法"
          multiline
          onChange={(value) => onFieldChange("deodorizedMeaning", value)}
        />
      </SectionCard>
    </>
  );
}

// 词组卡片的编辑区域
function PhraseCardEditor({ draft, onFieldChange }: { draft: RecordDraft; onFieldChange: <K extends keyof RecordDraft>(key: K, value: RecordDraft[K]) => void }) {
  return (
    <>
      <SectionCard title="词组信息" description="词组本体与核心释义">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <EditorSection
            label="Phrase"
            value={draft.spell}
            placeholder="词组"
            onChange={(value) => onFieldChange("spell", value)}
          />
          <EditorSection
            label="Type"
            value={draft.partOfSpeech}
            placeholder="如 phr. / v.phr."
            onChange={(value) => onFieldChange("partOfSpeech", value)}
          />
          <EditorSection
            label="Meaning"
            value={draft.meaning}
            placeholder="释义"
            onChange={(value) => onFieldChange("meaning", value)}
          />
        </div>
      </SectionCard>

      <SectionCard title="考点逻辑" description="词组结构拆解与常见陷阱">
        <EditorSection
          label="结构拆解"
          value={draft.structureAnalysis || ""}
          placeholder="如 take off = take(拿) + off(离开) → 起飞"
          onChange={(value) => onFieldChange("structureAnalysis", value)}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EditorSection
            label="搭配陷阱"
            value={draft.collocationTrap || ""}
            placeholder="常见误用场景"
            onChange={(value) => onFieldChange("collocationTrap", value)}
          />
          <EditorSection
            label="典型语境"
            value={draft.typicalContext || ""}
            placeholder="如学术、商务、日常"
            onChange={(value) => onFieldChange("typicalContext", value)}
          />
        </div>
        <EditorSection
          label="原句"
          value={draft.originalSentence}
          placeholder="语境例句"
          multiline
          onChange={(value) => onFieldChange("originalSentence", value)}
        />
      </SectionCard>
    </>
  );
}

// 熟词僻义卡片的编辑区域
function RareMeaningCardEditor({ draft, onFieldChange }: { draft: RecordDraft; onFieldChange: <K extends keyof RecordDraft>(key: K, value: RecordDraft[K]) => void }) {
  return (
    <>
      <SectionCard title="熟词僻义" description="揭示熟义与僻义的对比">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <EditorSection
            label="Word"
            value={draft.spell}
            placeholder="单词"
            onChange={(value) => onFieldChange("spell", value)}
          />
          <EditorSection
            label="词性"
            value={draft.partOfSpeech}
            placeholder="僻义词性"
            onChange={(value) => onFieldChange("partOfSpeech", value)}
          />
          <EditorSection
            label="Meaning"
            value={draft.meaning}
            placeholder="格式：熟义:xxx; 僻义:xxx"
            onChange={(value) => onFieldChange("meaning", value)}
          />
        </div>
      </SectionCard>

      <SectionCard title="僻义分析" description="帮助识别和记忆僻义">
        <EditorSection
          label="记忆抓手"
          value={draft.usageExplanation || ""}
          placeholder="从熟义到僻义的记忆桥梁"
          onChange={(value) => onFieldChange("usageExplanation", value)}
        />
        <EditorSection
          label="僻义陷阱"
          value={draft.deodorizedMeaning}
          placeholder="第一行：容易被忽略的原因；第二行：识别方法"
          multiline
          onChange={(value) => onFieldChange("deodorizedMeaning", value)}
        />
        <EditorSection
          label="僻义语境"
          value={draft.originalSentence}
          placeholder="体现僻义用法的例句"
          multiline
          onChange={(value) => onFieldChange("originalSentence", value)}
        />
      </SectionCard>
    </>
  );
}

// 对比卡片的编辑区域
function ComparisonCardEditor({ draft, onFieldChange }: { draft: RecordDraft; onFieldChange: <K extends keyof RecordDraft>(key: K, value: RecordDraft[K]) => void }) {
  const comparisonData = draft.comparisonData;

  const updateComparisonField = (field: keyof ComparisonContent, value: string) => {
    onFieldChange("comparisonData", {
      wordA: comparisonData?.wordA ?? { spell: "", partOfSpeech: "", meaning: "", usageExplanation: "", keyDifference: "" },
      wordB: comparisonData?.wordB ?? { spell: "", partOfSpeech: "", meaning: "", usageExplanation: "", keyDifference: "" },
      commonContext: comparisonData?.commonContext ?? "",
      contrastSummary: comparisonData?.contrastSummary ?? "",
      [field]: value,
    });
  };

  const updateWordField = (wordKey: "wordA" | "wordB", field: string, value: string) => {
    const defaultWord = { spell: "", partOfSpeech: "", meaning: "", usageExplanation: "", keyDifference: "" };
    onFieldChange("comparisonData", {
      wordA: comparisonData?.wordA ?? defaultWord,
      wordB: comparisonData?.wordB ?? defaultWord,
      commonContext: comparisonData?.commonContext ?? "",
      contrastSummary: comparisonData?.contrastSummary ?? "",
      [wordKey]: {
        ...(comparisonData?.[wordKey] ?? defaultWord),
        [field]: value,
      },
    });
  };

  return (
    <>
      <SectionCard title="对比概览" description="两个易混淆单词的辨析">
        <EditorSection
          label="核心差异"
          value={comparisonData?.contrastSummary || ""}
          placeholder="一句话辨析总结"
          onChange={(value) => updateComparisonField("contrastSummary", value)}
        />
        <EditorSection
          label="易混场景"
          value={comparisonData?.commonContext || ""}
          placeholder="两词共同出现的典型场景"
          onChange={(value) => updateComparisonField("commonContext", value)}
        />
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SectionCard title={`单词 A: ${comparisonData?.wordA?.spell || ""}`}>
          <EditorSection
            label="拼写"
            value={comparisonData?.wordA?.spell || ""}
            placeholder="单词A"
            onChange={(value) => updateWordField("wordA", "spell", value)}
          />
          <EditorSection
            label="词性"
            value={comparisonData?.wordA?.partOfSpeech || ""}
            placeholder="如 n. / v."
            onChange={(value) => updateWordField("wordA", "partOfSpeech", value)}
          />
          <EditorSection
            label="释义"
            value={comparisonData?.wordA?.meaning || ""}
            placeholder="核心释义"
            onChange={(value) => updateWordField("wordA", "meaning", value)}
          />
          <EditorSection
            label="核心差异"
            value={comparisonData?.wordA?.keyDifference || ""}
            placeholder="该词的独特之处"
            onChange={(value) => updateWordField("wordA", "keyDifference", value)}
          />
          <EditorSection
            label="记忆抓手"
            value={comparisonData?.wordA?.usageExplanation || ""}
            placeholder="帮助记忆的方法"
            onChange={(value) => updateWordField("wordA", "usageExplanation", value)}
          />
        </SectionCard>

        <SectionCard title={`单词 B: ${comparisonData?.wordB?.spell || ""}`}>
          <EditorSection
            label="拼写"
            value={comparisonData?.wordB?.spell || ""}
            placeholder="单词B"
            onChange={(value) => updateWordField("wordB", "spell", value)}
          />
          <EditorSection
            label="词性"
            value={comparisonData?.wordB?.partOfSpeech || ""}
            placeholder="如 n. / v."
            onChange={(value) => updateWordField("wordB", "partOfSpeech", value)}
          />
          <EditorSection
            label="释义"
            value={comparisonData?.wordB?.meaning || ""}
            placeholder="核心释义"
            onChange={(value) => updateWordField("wordB", "meaning", value)}
          />
          <EditorSection
            label="核心差异"
            value={comparisonData?.wordB?.keyDifference || ""}
            placeholder="该词的独特之处"
            onChange={(value) => updateWordField("wordB", "keyDifference", value)}
          />
          <EditorSection
            label="记忆抓手"
            value={comparisonData?.wordB?.usageExplanation || ""}
            placeholder="帮助记忆的方法"
            onChange={(value) => updateWordField("wordB", "usageExplanation", value)}
          />
        </SectionCard>
      </div>
    </>
  );
}

export function WordEditorForm({ draft, error, isSaving, onFieldChange, onSave }: WordEditorFormProps) {
  const previewWord = buildPreviewWord(draft);
  const cardType: CardType = draft.cardType || "normal";

  const renderEditor = () => {
    switch (cardType) {
      case "phrase":
        return <PhraseCardEditor draft={draft} onFieldChange={onFieldChange} />;
      case "rare_meaning":
        return <RareMeaningCardEditor draft={draft} onFieldChange={onFieldChange} />;
      case "comparison":
        return <ComparisonCardEditor draft={draft} onFieldChange={onFieldChange} />;
      default:
        return <NormalCardEditor draft={draft} onFieldChange={onFieldChange} />;
    }
  };

  return (
    <div className="space-y-4 py-1">
      <section
        className="space-y-3 rounded-[2rem] p-4 shadow-[0_18px_38px_rgba(102,8,116,0.07)]"
        style={{
          background: "var(--editor-preview-bg)",
          border: "1px solid var(--editor-preview-border)",
        }}
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--editor-preview-title)" }}>Preview</div>
        <WordCard word={previewWord} variant="browse" />
      </section>

      {renderEditor()}

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

      <PrimaryButton
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="min-h-14 rounded-[1.4rem] text-base font-bold shadow-[0_16px_30px_rgba(102,8,116,0.18)]"
      >
        {isSaving ? "保存中..." : "保存到词库"}
      </PrimaryButton>
    </div>
  );
}