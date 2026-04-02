"use client";

import { WordCard } from "@/components/common/word-card";
import { PrimaryButton } from "@/components/common/primary-button";
import type { RecordDraft, WordRecord } from "@/types/db";

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

export function WordEditorForm({ draft, error, isSaving, onFieldChange, onSave }: WordEditorFormProps) {
  const previewWord = buildPreviewWord(draft);
  const sentenceLabel = draft.mode === "general" ? "Representative" : "Original";
  const sentencePlaceholder = draft.mode === "general" ? "代表句" : "原句";

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

      <SectionCard title="基础信息" description="先确认单词本体与核心释义。">
        <EditorSection
          label="Word"
          value={draft.spell}
          placeholder="单词"
          onChange={(value) => onFieldChange("spell", value)}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EditorSection
            label="Part of speech"
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

      <SectionCard title="语境与记忆" description={draft.mode === "general" ? "通用模式下这里展示 AI 生成的代表句。" : "补充原句、记忆线索与感情色彩。"}>
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

        <EditorSection
          label="Memory / Root"
          value={draft.usageExplanation}
          placeholder="记忆/词根"
          multiline
          onChange={(value) => onFieldChange("usageExplanation", value)}
        />

        <EditorSection
          label="Sentiment"
          value={draft.sentiment}
          placeholder="[正+] / [负-] / [中性]"
          onChange={(value) => onFieldChange("sentiment", value)}
        />

        <EditorSection
          label="Plain"
          value={draft.deodorizedMeaning}
          placeholder="去味"
          multiline
          onChange={(value) => onFieldChange("deodorizedMeaning", value)}
        />
      </SectionCard>

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