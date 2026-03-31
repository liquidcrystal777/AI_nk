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
    <section className="space-y-4 rounded-[1.75rem] border border-white/85 bg-white/94 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <div className="space-y-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8c6594]">{title}</div>
        {description ? <div className="text-sm leading-6 text-neutral-500">{description}</div> : null}
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
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">{props.label}</div>
        <textarea
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          placeholder={props.placeholder}
          className="min-h-28 w-full rounded-[1.25rem] border border-neutral-200 bg-[#fcfbff] px-4 py-3 text-sm leading-7 text-neutral-800 outline-none transition placeholder:text-neutral-300 focus:border-[#d6b8dd]"
        />
      </label>
    );
  }

  return (
    <label className="block space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">{props.label}</div>
      <input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder={props.placeholder}
        className="w-full rounded-[1.25rem] border border-neutral-200 bg-[#fcfbff] px-4 py-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-300 focus:border-[#d6b8dd]"
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
    usageExplanation: draft.usageExplanation,
    sentiment: draft.sentiment,
    deodorizedMeaning: draft.deodorizedMeaning,
    year: draft.year,
    sourceTextId: draft.sourceTextId,
    status: "new",
    reviewCount: 0,
    nextReviewTime: 0,
  };
}

export function WordEditorForm({ draft, error, isSaving, onFieldChange, onSave }: WordEditorFormProps) {
  const previewWord = buildPreviewWord(draft);

  return (
    <div className="space-y-4 py-1">
      <section className="space-y-3 rounded-[2rem] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(249,244,251,0.94)_100%)] p-4 shadow-[0_18px_38px_rgba(102,8,116,0.07)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8c6594]">Preview</div>
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

      <SectionCard title="语境与记忆" description="补充原句、记忆线索与感情色彩。">
        <EditorSection
          label="Original"
          value={draft.originalSentence}
          placeholder="原句"
          multiline
          onChange={(value) => onFieldChange("originalSentence", value)}
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

      {error ? <div className="rounded-[1.4rem] bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

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
