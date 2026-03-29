"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { SettingsForm } from "@/components/settings/settings-form";
import { useSettings } from "@/lib/hooks/use-settings";
import type { SettingsRecord } from "@/types/db";

export default function SettingsPage() {
  const { settings, saveSettings } = useSettings();
  const [draft, setDraft] = useState<SettingsRecord>(settings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function updateField(key: keyof Omit<SettingsRecord, "id">, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    await saveSettings({
      aiApiKey: draft.aiApiKey,
      aiBaseUrl: draft.aiBaseUrl,
      aiModelName: draft.aiModelName,
    });
    setMessage("已保存到本地数据库");
  }

  return (
    <AppShell>
      <TopBar title="设置" showBack />
      <main className="flex flex-1 flex-col gap-4 px-4 py-4">
        <SettingsForm settings={draft} onChange={updateField} onSave={handleSave} />
        {message ? <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div> : null}
      </main>
    </AppShell>
  );
}
