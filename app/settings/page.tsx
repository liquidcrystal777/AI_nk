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
      <TopBar title="设置" showBack backHref="/" />
      <main className="flex flex-1 flex-col gap-4 bg-[linear-gradient(180deg,#fbf8ff_0%,#ffffff_38%)] px-4 py-4">
        <div className="rounded-[1.8rem] border border-white/70 bg-white/76 p-1 shadow-sm backdrop-blur-sm">
          <SettingsForm settings={draft} onChange={updateField} onSave={handleSave} />
        </div>
        {message ? <div className="rounded-[1.4rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">{message}</div> : null}
      </main>
    </AppShell>
  );
}
