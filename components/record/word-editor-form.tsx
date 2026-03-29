"use client";

import { Plus, Trash2 } from "lucide-react";
import { PrimaryButton } from "@/components/common/primary-button";
import type { RecordDraft } from "@/types/db";

type WordEditorFormProps = {
  draft: RecordDraft;
  error: string;
  isSaving: boolean;
  onFieldChange: <K extends keyof RecordDraft>(key: K, value: RecordDraft[K]) => void;
  onSentenceChange: (index: number, value: string) => void;
  onAddSentence: () => void;
  onRemoveSentence: (index: number) => void;
  onSave: () => void;
};

export function WordEditorForm({
  draft,
  error,
  isSaving,
  onFieldChange,
  onSentenceChange,
  onAddSentence,
  onRemoveSentence,
  onSave,
}: WordEditorFormProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3">
        <input
          value={draft.spell}
          onChange={(event) => onFieldChange("spell", event.target.value)}
          placeholder="单词拼写"
          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-2xl font-black tracking-tight outline-none"
        />
        <input
          value={draft.pronunciation}
          onChange={(event) => onFieldChange("pronunciation", event.target.value)}
          placeholder="音标"
          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none"
        />
        <textarea
          value={draft.meaning}
          onChange={(event) => onFieldChange("meaning", event.target.value)}
          placeholder="中文释义"
          className="min-h-24 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-neutral-900">考点例句</div>
          <button type="button" onClick={onAddSentence} className="flex items-center gap-1 text-sm font-medium text-neutral-600">
            <Plus size={16} /> 添加
          </button>
        </div>

        {draft.originalSentence.map((sentence, index) => (
          <div key={index} className="flex items-start gap-2">
            <textarea
              value={sentence}
              onChange={(event) => onSentenceChange(index, event.target.value)}
              placeholder={`例句 ${index + 1}`}
              className="min-h-24 flex-1 rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => onRemoveSentence(index)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-500"
              aria-label="删除例句"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

      <PrimaryButton type="button" onClick={onSave} disabled={isSaving}>
        {isSaving ? "保存中..." : "保存到词库"}
      </PrimaryButton>
    </div>
  );
}
