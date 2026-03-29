"use client";

import { PrimaryButton } from "@/components/common/primary-button";
import type { SettingsRecord } from "@/types/db";

type SettingsFormProps = {
  settings: SettingsRecord;
  onChange: (key: keyof Omit<SettingsRecord, "id">, value: string) => void;
  onSave: () => void;
};

export function SettingsForm({ settings, onChange, onSave }: SettingsFormProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-800">AI API Key</label>
        <input
          value={settings.aiApiKey}
          onChange={(event) => onChange("aiApiKey", event.target.value)}
          placeholder="sk-xxx"
          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-800">AI Base URL</label>
        <input
          value={settings.aiBaseUrl}
          onChange={(event) => onChange("aiBaseUrl", event.target.value)}
          placeholder="https://api.openclaudecode.cn/v1/messages"
          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-800">AI Model Name</label>
        <input
          value={settings.aiModelName}
          onChange={(event) => onChange("aiModelName", event.target.value)}
          placeholder="claude-3-5-sonnet-20241022"
          className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none"
        />
      </div>
      <PrimaryButton type="button" onClick={onSave}>保存设置</PrimaryButton>
    </div>
  );
}
