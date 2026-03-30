"use client";

import { useMemo, useState } from "react";
import { generateWordDraft } from "@/lib/ai/client";
import { parseWordDraft } from "@/lib/ai/parser";
import { createWord } from "@/lib/db/mutations";
import { readExamPaperText } from "@/lib/exam-paper-reader";
import { extractSourceTextFromPaper } from "@/lib/exam-text-segmentation";
import { DEFAULT_SETTINGS } from "@/lib/utils/constants";
import type { RecordDraft } from "@/types/db";

const emptyDraft: RecordDraft = {
  spell: "",
  partOfSpeech: "",
  meaning: "",
  confusingMeaning1: "",
  confusingMeaning2: "",
  confusingMeaning3: "",
  originalSentence: "",
  usageExplanation: "",
  sentiment: "",
  deodorizedMeaning: "",
  year: "",
  sourceTextId: "TEXT1",
};

export function useRecordDraft(settings = DEFAULT_SETTINGS) {
  const [step, setStep] = useState<"input" | "edit">("input");
  const [draft, setDraft] = useState<RecordDraft>(emptyDraft);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const canGenerate = useMemo(() => {
    return Boolean(draft.spell.trim() && draft.year.trim() && draft.sourceTextId.trim());
  }, [draft.spell, draft.year, draft.sourceTextId]);

  async function generate() {
    if (!canGenerate) {
      setError("请先填写单词、年份和文章来源");
      return;
    }

    if (!settings.aiApiKey || !settings.aiModelName) {
      setError("请先在设置页填写 AI API Key；Base URL 可留空使用默认 DeepSeek");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const fullText = await readExamPaperText(draft.year);
      const sourceText = extractSourceTextFromPaper(fullText, draft.sourceTextId);
      const response = await generateWordDraft({
        apiKey: settings.aiApiKey,
        baseUrl: settings.aiBaseUrl,
        modelName: settings.aiModelName,
        spell: draft.spell,
        year: draft.year,
        sourceTextId: draft.sourceTextId,
        sourceText,
      });

      const nextDraft = parseWordDraft(response, {
        year: draft.year,
        sourceTextId: draft.sourceTextId,
      });

      setDraft(nextDraft);
      setStep("edit");
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  }

  function updateField<K extends keyof RecordDraft>(key: K, value: RecordDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setIsSaving(true);
    setError("");

    try {
      await createWord(draft);
      reset();
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存失败");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  function reset() {
    setDraft(emptyDraft);
    setStep("input");
    setError("");
  }

  return {
    step,
    draft,
    error,
    isGenerating,
    isSaving,
    canGenerate,
    setStep,
    updateField,
    generate,
    save,
    reset,
  };
}
