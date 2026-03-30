"use client";

import { PrimaryButton } from "@/components/common/primary-button";
import type { ImportMode, SettingsRecord } from "@/types/db";

type SettingsFormProps = {
  settings: SettingsRecord;
  importMode: ImportMode;
  isImporting: boolean;
  onChange: (key: keyof Omit<SettingsRecord, "id">, value: string) => void;
  onSave: () => void;
  onExport: () => void;
  onImportModeChange: (mode: ImportMode) => void;
  onImportFileChange: (file: File | null) => void;
};

const IMPORT_MODE_OPTIONS: Array<{ value: ImportMode; label: string; description: string }> = [
  {
    value: "replace",
    label: "覆盖本机词库",
    description: "清空当前词库后恢复备份；若备份里带设置，则同步恢复设置。",
  },
  {
    value: "append",
    label: "仅追加新词",
    description: "保留当前数据，只导入不存在的新词，适合多设备合并。",
  },
];

export function SettingsForm({
  settings,
  importMode,
  isImporting,
  onChange,
  onSave,
  onExport,
  onImportModeChange,
  onImportFileChange,
}: SettingsFormProps) {
  return (
    <div className="space-y-5 rounded-[1.65rem] border border-neutral-200/80 bg-white px-4 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">AI 设置</h2>
          <p className="mt-1 text-xs leading-5 text-neutral-500">这些配置仍然只保存在本机；导出备份时会一起写入 JSON。</p>
        </div>

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
      </section>

      <section className="space-y-4 rounded-[1.4rem] border border-[rgba(102,8,116,0.1)] bg-[rgba(102,8,116,0.03)] px-4 py-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">备份与迁移</h2>
          <p className="mt-1 text-xs leading-5 text-neutral-600">先导出再导入即可在手机或新设备恢复。备份文件是单个 JSON。</p>
        </div>

        <PrimaryButton type="button" onClick={onExport}>导出备份</PrimaryButton>

        <div className="space-y-3 rounded-[1.2rem] border border-neutral-200 bg-white/80 p-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-neutral-900">导入模式</p>
            <div className="space-y-2">
              {IMPORT_MODE_OPTIONS.map((option) => {
                const checked = importMode === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-[1rem] border px-3 py-3 transition ${
                      checked ? "border-[rgba(102,8,116,0.22)] bg-[rgba(102,8,116,0.06)]" : "border-neutral-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="import-mode"
                      value={option.value}
                      checked={checked}
                      onChange={() => onImportModeChange(option.value)}
                      className="mt-1 h-4 w-4 accent-[rgb(102,8,116)]"
                    />
                    <span className="space-y-1">
                      <span className="block text-sm font-semibold text-neutral-900">{option.label}</span>
                      <span className="block text-xs leading-5 text-neutral-500">{option.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs leading-5 text-neutral-500">覆盖导入会替换当前词库。稳妥起见，建议先导出一次当前数据。</p>
            <label className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[rgba(102,8,116,0.22)] bg-white px-4 py-3 text-sm font-semibold text-[rgb(102,8,116)] transition hover:bg-[rgba(102,8,116,0.03)]">
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => onImportFileChange(event.target.files?.[0] ?? null)}
                className="hidden"
                disabled={isImporting}
              />
              {isImporting ? "正在导入..." : "选择 JSON 备份并导入"}
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
