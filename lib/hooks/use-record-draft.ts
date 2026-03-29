"use client";

import { useMemo, useState } from "react";
import { generateWordDraft } from "@/lib/ai/client";
import { parseWordDraft } from "@/lib/ai/parser";
import { createWord } from "@/lib/db/mutations";
import { DEFAULT_SETTINGS } from "@/lib/utils/constants";
import type { RecordDraft } from "@/types/db";

const emptyDraft: RecordDraft = {
  spell: "",
  pronunciation: "",
  meaning: "",
  prompt: "",
  year: "",
  sourceTextId: "",
  originalSentence: [""],
};

export function useRecordDraft(settings = DEFAULT_SETTINGS) {
  const [step, setStep] = useState<"input" | "edit">("input");
  const [draft, setDraft] = useState<RecordDraft>(emptyDraft);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const canGenerate = useMemo(() => {
    return Boolean(draft.prompt.trim() && draft.year.trim() && draft.sourceTextId.trim());
  }, [draft.prompt, draft.year, draft.sourceTextId]);

  async function generate() {
    if (!canGenerate) {
      setError("请先填写提示词、年份和文章来源");
      return;
    }

    if (!settings.aiApiKey || !settings.aiBaseUrl || !settings.aiModelName) {
      setError("请先在设置页填写 AI 接口信息");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const response = await generateWordDraft({
        apiKey: settings.aiApiKey,
        baseUrl: settings.aiBaseUrl,
        modelName: settings.aiModelName,
        prompt: draft.prompt,
        year: draft.year,
        sourceTextId: draft.sourceTextId,
      });

      const nextDraft = parseWordDraft(response, {
        prompt: draft.prompt,
        year: draft.year,
        sourceTextId: draft.sourceTextId,
      });

      setDraft({
        ...nextDraft,
        originalSentence: nextDraft.originalSentence.length ? nextDraft.originalSentence : [""],
      });
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

  function updateSentence(index: number, value: string) {
    setDraft((prev) => ({
      ...prev,
      originalSentence: prev.originalSentence.map((sentence, sentenceIndex) => {
        return sentenceIndex === index ? value : sentence;
      }),
    }));
  }

  function addSentence() {
    setDraft((prev) => ({
      ...prev,
      originalSentence: [...prev.originalSentence, ""],
    }));
  }

  function removeSentence(index: number) {
    setDraft((prev) => ({
      ...prev,
      originalSentence:
        prev.originalSentence.length === 1
          ? [""]
          : prev.originalSentence.filter((_, sentenceIndex) => sentenceIndex !== index),
    }));
  }

  async function save() {
    setIsSaving(true);
    setError("");

    try {
      await createWord({
        ...draft,
        originalSentence: draft.originalSentence.filter((sentence) => sentence.trim()),
      });
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
    updateSentence,
    addSentence,
    removeSentence,
    generate,
    save,
    reset,
  };
}
