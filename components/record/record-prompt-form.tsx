"use client";

import { PrimaryButton } from "@/components/common/primary-button";
import type { RecordDraft } from "@/types/db";

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
        <label className="text-sm font-semibold text-neutral-800">提示词</label>
        <textarea
          value={draft.prompt}
          onChange={(event) => onFieldChange("prompt", event.target.value)}
          placeholder="例如：请根据 2006 年阅读 Text4 里的 reminder 生成单词卡片"
          className="min-h-32 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-800">choose year</label>
          <input
            value={draft.year}
            onChange={(event) => onFieldChange("year", event.target.value)}
            placeholder="如 2006"
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-800">choose text</label>
          <input
            value={draft.sourceTextId}
            onChange={(event) => onFieldChange("sourceTextId", event.target.value)}
            placeholder="如 Text4"
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

      <PrimaryButton type="button" onClick={onGenerate} disabled={!canGenerate || isGenerating}>
        {isGenerating ? "生成中..." : "生成卡片"}
      </PrimaryButton>
    </div>
  );
}
