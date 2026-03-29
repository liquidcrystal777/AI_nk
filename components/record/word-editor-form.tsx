"use client";

import { PrimaryButton } from "@/components/common/primary-button";
import type { RecordDraft } from "@/types/db";

type WordEditorFormProps = {
  draft: RecordDraft;
  error: string;
  isSaving: boolean;
  onFieldChange: <K extends keyof RecordDraft>(key: K, value: RecordDraft[K]) => void;
  onSave: () => void;
};

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
        <div className="text-xs font-semibold tracking-[0.24em] text-neutral-400 uppercase">{props.label}</div>
        <textarea
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          placeholder={props.placeholder}
          className="min-h-28 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm leading-7 text-neutral-800 outline-none"
        />
      </label>
    );
  }

  return (
    <label className="block space-y-2">
      <div className="text-xs font-semibold tracking-[0.24em] text-neutral-400 uppercase">{props.label}</div>
      <input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder={props.placeholder}
        className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800 outline-none"
      />
    </label>
  );
}

export function WordEditorForm({ draft, error, isSaving, onFieldChange, onSave }: WordEditorFormProps) {
  return (
    <div className="space-y-4 rounded-[32px] border border-neutral-200 bg-[#fffdf8] p-5 shadow-sm">
      <EditorSection
        label="Word"
        value={draft.spell}
        placeholder="单词"
        onChange={(value) => onFieldChange("spell", value)}
      />

      <EditorSection
        label="Meaning"
        value={draft.meaning}
        placeholder="极简释义"
        onChange={(value) => onFieldChange("meaning", value)}
      />

      <EditorSection
        label="Original"
        value={draft.originalSentence}
        placeholder="原句"
        multiline
        onChange={(value) => onFieldChange("originalSentence", value)}
      />

      <EditorSection
        label="Usage"
        value={draft.usageExplanation}
        placeholder="释义"
        multiline
        onChange={(value) => onFieldChange("usageExplanation", value)}
      />

      <EditorSection
        label="Plain"
        value={draft.deodorizedMeaning}
        placeholder="去味"
        multiline
        onChange={(value) => onFieldChange("deodorizedMeaning", value)}
      />

      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

      <PrimaryButton type="button" onClick={onSave} disabled={isSaving}>
        {isSaving ? "保存中..." : "保存到词库"}
      </PrimaryButton>
    </div>
  );
}
