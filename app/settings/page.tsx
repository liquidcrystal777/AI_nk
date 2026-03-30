"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { SettingsForm } from "@/components/settings/settings-form";
import { createBackupFile, downloadBackupFile, getImportModeLabel, parseBackupFileContent } from "@/lib/db/backup";
import { importBackupPayload, saveSettings as persistSettings } from "@/lib/db/mutations";
import { getBackupPayload } from "@/lib/db/queries";
import { useSettings } from "@/lib/hooks/use-settings";
import type { ImportMode, SettingsRecord } from "@/types/db";

export default function SettingsPage() {
  const { settings } = useSettings();
  const [draft, setDraft] = useState<SettingsRecord>(settings);
  const [message, setMessage] = useState("");
  const [importMode, setImportMode] = useState<ImportMode>("replace");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function updateField(key: keyof Omit<SettingsRecord, "id">, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    await persistSettings({
      aiApiKey: draft.aiApiKey,
      aiBaseUrl: draft.aiBaseUrl,
      aiModelName: draft.aiModelName,
    });
    setMessage("已保存到本地数据库");
  }

  async function handleExport() {
    const payload = await getBackupPayload();
    const backupFile = createBackupFile(payload);
    downloadBackupFile(backupFile);
    setMessage(`已导出 ${payload.words.length} 个单词，可直接发到手机`);
  }

  async function handleImportFile(file: File | null) {
    if (!file) {
      return;
    }

    setIsImporting(true);

    try {
      const content = await file.text();
      const backupFile = parseBackupFileContent(content);
      await importBackupPayload(backupFile.payload, importMode);
      setMessage(`${getImportModeLabel(importMode)}完成，共处理 ${backupFile.payload.words.length} 个单词`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导入失败，请重试");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <AppShell>
      <TopBar title="设置" showBack backHref="/" />
      <main className="flex flex-1 flex-col gap-4 bg-[linear-gradient(180deg,#fbf8ff_0%,#ffffff_38%)] px-4 py-4">
        <div className="rounded-[1.8rem] border border-white/70 bg-white/76 p-1 shadow-sm backdrop-blur-sm">
          <SettingsForm
            settings={draft}
            importMode={importMode}
            isImporting={isImporting}
            onChange={updateField}
            onSave={handleSave}
            onExport={handleExport}
            onImportModeChange={setImportMode}
            onImportFileChange={handleImportFile}
          />
        </div>
        {message ? <div className="rounded-[1.4rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">{message}</div> : null}
      </main>
    </AppShell>
  );
}
