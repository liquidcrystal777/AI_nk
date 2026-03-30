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
    <div className="space-y-4 rounded-[1.65rem] border border-neutral-200/80 bg-white px-4 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-800">AI API Key</label>
        <input
          value={settings.aiApiKey}
          onChange={(event) => onChange("aiApiKey", event.target.value)}
          placeholder="sk-xxx"
          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 text-sm outline-none transition focus:border-[rgba(102,8,116,0.28)] focus:bg-white"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-800">AI Base URL</label>
        <input
          value={settings.aiBaseUrl}
          onChange={(event) => onChange("aiBaseUrl", event.target.value)}
          placeholder="DeepSeek: https://api.deepseek.com/v1"
          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 text-sm outline-none transition focus:border-[rgba(102,8,116,0.28)] focus:bg-white"
        />
        <p className="text-xs leading-5 text-neutral-500">
          Base URL 可留空，默认会使用 <code>https://api.deepseek.com/v1</code>；若手动填写，请填写 <code>/v1</code> 或 <code>/v1/chat/completions</code>，不要填写官网网页地址。
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-800">AI Model Name</label>
        <input
          value={settings.aiModelName}
          onChange={(event) => onChange("aiModelName", event.target.value)}
          placeholder="deepseek-chat"
          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 text-sm outline-none transition focus:border-[rgba(102,8,116,0.28)] focus:bg-white"
        />
        <p className="text-xs leading-5 text-neutral-500">默认模型为 <code>deepseek-chat</code>，留空保存时也会自动回退到该模型。</p>
      </div>
      <PrimaryButton type="button" onClick={onSave}>保存设置</PrimaryButton>
    </div>
  );
}
