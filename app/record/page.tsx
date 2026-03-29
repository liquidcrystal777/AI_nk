"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { RecordPromptForm } from "@/components/record/record-prompt-form";
import { WordEditorForm } from "@/components/record/word-editor-form";
import { useRecordDraft } from "@/lib/hooks/use-record-draft";
import { useSettings } from "@/lib/hooks/use-settings";

export default function RecordPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const {
    step,
    draft,
    error,
    isGenerating,
    isSaving,
    canGenerate,
    updateField,
    updateSentence,
    addSentence,
    removeSentence,
    generate,
    save,
  } = useRecordDraft(settings);

  async function handleConfirm() {
    const ok = await save();
    if (ok) {
      router.push("/");
    }
  }

  return (
    <AppShell>
      <TopBar
        title={step === "input" ? "录入新词" : "编辑卡片"}
        showBack
        onConfirm={step === "edit" ? handleConfirm : undefined}
        confirmDisabled={isSaving}
      />
      <main className="flex flex-1 flex-col gap-4 px-4 py-4">
        {step === "input" ? (
          <RecordPromptForm
            draft={draft}
            error={error}
            isGenerating={isGenerating}
            canGenerate={canGenerate}
            onFieldChange={updateField}
            onGenerate={generate}
          />
        ) : (
          <WordEditorForm
            draft={draft}
            error={error}
            isSaving={isSaving}
            onFieldChange={updateField}
            onSentenceChange={updateSentence}
            onAddSentence={addSentence}
            onRemoveSentence={removeSentence}
            onSave={handleConfirm}
          />
        )}
      </main>
    </AppShell>
  );
}
