"use client";

import { PrimaryButton } from "@/components/common/primary-button";
import type { RecordDraft } from "@/types/db";

const SOURCE_TEXT_OPTIONS = ["Text1", "Text2", "Text3", "Text4"] as const;

type RecordPromptFormProps = {
  draft: RecordDraft;
  error: string;
  isGenerating: boolean;
  canGenerate: boolean;
  onFieldChange: <K extends keyof RecordDraft>(key: K, value: RecordDraft[K]) => void;
  onGenerate: () => void;
};

export function RecordPromptForm({
  draft,
  error,
  isGenerating,
  canGenerate,
  onFieldChange,
  onGenerate,
}: RecordPromptFormProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-800">单词</label>
        <input
          value={draft.spell}
          onChange={(event) => onFieldChange("spell", event.target.value)}
          placeholder="如 reminder"
          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-base outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-800">年份</label>
          <input
            value={draft.year}
            onChange={(event) => onFieldChange("year", event.target.value)}
            placeholder="如 2006"
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-800">文章</label>
          <select
            value={draft.sourceTextId}
            onChange={(event) => onFieldChange("sourceTextId", event.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
          >
            {SOURCE_TEXT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

      <PrimaryButton type="button" onClick={onGenerate} disabled={!canGenerate || isGenerating}>
        {isGenerating ? "生成中..." : "生成卡片"}
      </PrimaryButton>
    </div>
  );
}
