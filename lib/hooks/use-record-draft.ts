"use client";

import { useMemo, useState } from "react";
import { generateComparisonDraft, generatePhraseDraft, generateRareMeaningDraft, generateWordDraft } from "@/lib/ai/client";
import { parseComparisonDraft, parsePhraseDraft, parseRareMeaningDraft, parseWordDraft } from "@/lib/ai/parser";
import { createWord } from "@/lib/db/mutations";
import { readExamPaperText } from "@/lib/exam-paper-reader";
import { extractSourceTextFromPaper } from "@/lib/exam-text-segmentation";
import { DEFAULT_SETTINGS } from "@/lib/utils/constants";
import type { CardType, RecordDraft } from "@/types/db";

const emptyDraft: RecordDraft = {
  spell: "",
  partOfSpeech: "",
  meaning: "",
  originalSentence: "",
  representativeSentence: "",
  usageExplanation: "",
  sentiment: "",
  deodorizedMeaning: "",
  year: "",
  sourceTextId: "TEXT1",
  mode: "reading",
  cardType: "normal",
  excludeFromReview: false,
  comparisonWordA: "",
  comparisonWordB: "",
};

export function useRecordDraft(settings = DEFAULT_SETTINGS) {
  const [step, setStep] = useState<"input" | "edit">("input");
  const [draft, setDraft] = useState<RecordDraft>(emptyDraft);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const canGenerate = useMemo(() => {
    if (draft.cardType === "comparison") {
      return Boolean(draft.comparisonWordA?.trim() && draft.comparisonWordB?.trim());
    }

    if (draft.mode === "general") {
      return Boolean(draft.spell.trim());
    }

    return Boolean(draft.spell.trim() && draft.year.trim() && draft.sourceTextId.trim());
  }, [draft.mode, draft.spell, draft.year, draft.sourceTextId, draft.cardType, draft.comparisonWordA, draft.comparisonWordB]);

  async function generate() {
    if (!canGenerate) {
      if (draft.cardType === "comparison") {
        setError("请填写两个对比单词");
        return;
      }
      setError(draft.mode === "general" ? "请先填写单词" : "请先填写单词、年份和文章来源");
      return;
    }

    if (draft.cardType !== "comparison" && draft.mode === "reading" && !/^\d{4}$/.test(draft.year.trim())) {
      setError("请输入 4 位年份");
      return;
    }

    if (!settings.aiApiKey || !settings.aiModelName) {
      setError("");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      let nextDraft: RecordDraft;

      if (draft.cardType === "comparison") {
        const response = await generateComparisonDraft({
          apiKey: settings.aiApiKey,
          baseUrl: settings.aiBaseUrl,
          modelName: settings.aiModelName,
          wordA: draft.comparisonWordA!,
          wordB: draft.comparisonWordB!,
        });
        nextDraft = parseComparisonDraft(response, draft.comparisonWordA!, draft.comparisonWordB!);
      } else if (draft.cardType === "phrase") {
        let response;
        if (draft.mode === "general") {
          response = await generatePhraseDraft({
            apiKey: settings.aiApiKey,
            baseUrl: settings.aiBaseUrl,
            modelName: settings.aiModelName,
            spell: draft.spell,
            mode: draft.mode,
          });
        } else {
          const fullText = await readExamPaperText(draft.year);
          const sourceText = extractSourceTextFromPaper(fullText, draft.sourceTextId);
          response = await generatePhraseDraft({
            apiKey: settings.aiApiKey,
            baseUrl: settings.aiBaseUrl,
            modelName: settings.aiModelName,
            spell: draft.spell,
            mode: draft.mode,
            year: draft.year,
            sourceTextId: draft.sourceTextId,
            sourceText,
          });
        }
        nextDraft = parsePhraseDraft(response, {
          year: draft.year,
          sourceTextId: draft.sourceTextId,
          mode: draft.mode,
        });
      } else if (draft.cardType === "rare_meaning") {
        let response;
        if (draft.mode === "general") {
          response = await generateRareMeaningDraft({
            apiKey: settings.aiApiKey,
            baseUrl: settings.aiBaseUrl,
            modelName: settings.aiModelName,
            spell: draft.spell,
            mode: draft.mode,
          });
        } else {
          const fullText = await readExamPaperText(draft.year);
          const sourceText = extractSourceTextFromPaper(fullText, draft.sourceTextId);
          response = await generateRareMeaningDraft({
            apiKey: settings.aiApiKey,
            baseUrl: settings.aiBaseUrl,
            modelName: settings.aiModelName,
            spell: draft.spell,
            mode: draft.mode,
            year: draft.year,
            sourceTextId: draft.sourceTextId,
            sourceText,
          });
        }
        nextDraft = parseRareMeaningDraft(response, {
          year: draft.year,
          sourceTextId: draft.sourceTextId,
          mode: draft.mode,
        });
      } else {
        let response;
        if (draft.mode === "general") {
          response = await generateWordDraft({
            apiKey: settings.aiApiKey,
            baseUrl: settings.aiBaseUrl,
            modelName: settings.aiModelName,
            spell: draft.spell,
            mode: draft.mode,
          });
        } else {
          const fullText = await readExamPaperText(draft.year);
          const sourceText = extractSourceTextFromPaper(fullText, draft.sourceTextId);
          response = await generateWordDraft({
            apiKey: settings.aiApiKey,
            baseUrl: settings.aiBaseUrl,
            modelName: settings.aiModelName,
            spell: draft.spell,
            mode: draft.mode,
            year: draft.year,
            sourceTextId: draft.sourceTextId,
            sourceText,
          });
        }
        nextDraft = parseWordDraft(response, {
          year: draft.year,
          sourceTextId: draft.sourceTextId,
          mode: draft.mode,
        });
      }

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
