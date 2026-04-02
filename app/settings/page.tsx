"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { SettingsForm } from "@/components/settings/settings-form";
import { createBackupFile, downloadBackupFile, getImportModeLabel, parseBackupFileContent } from "@/lib/db/backup";
import { importBackupPayload, saveSettings as persistSettings } from "@/lib/db/mutations";
import { getBackupPayload } from "@/lib/db/queries";
import { useSettings } from "@/lib/hooks/use-settings";
import type { ImportMode, SettingsRecord, ThemeMode } from "@/types/db";

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

    // 主题切换立即预览生效
    if (key === "theme") {
      const themeProvider = document.querySelector("[data-theme]");
      if (themeProvider) {
        themeProvider.setAttribute("data-theme", value as ThemeMode);
      }
    }
  }

  async function handleSave() {
    await persistSettings({
      aiApiKey: draft.aiApiKey,
      aiBaseUrl: draft.aiBaseUrl,
      aiModelName: draft.aiModelName,
      theme: draft.theme,
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
      <main className="flex flex-1 flex-col gap-4 bg-[var(--page-surface)] px-4 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] text-[var(--foreground)]">
        <div className="rounded-[1.8rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-1 shadow-[var(--panel-shadow)] backdrop-blur-sm">
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
        {message ? (
          <div className="rounded-[1.4rem] border border-[var(--theme-accent-soft)] bg-[var(--theme-accent-muted)] px-4 py-3 text-sm text-[var(--theme-accent-strong)] shadow-sm">
            {message}
          </div>
        ) : null}
      </main>
    </AppShell>
  );
}
