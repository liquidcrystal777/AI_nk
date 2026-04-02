"use client";

import { PrimaryButton } from "@/components/common/primary-button";
import type { ImportMode, SettingsRecord, ThemeMode } from "@/types/db";

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

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; description: string }> = [
  {
    value: "light",
    label: "白天模式",
    description: "浅底卡片 + 清爽对比，和录入、浏览等页面更统一。",
  },
  {
    value: "dark",
    label: "夜间模式",
    description: "深紫底色 + 低眩光，更适合夜间连续背词。",
  },
];

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
    <div className="space-y-5 rounded-[1.65rem] border border-[var(--panel-border)] bg-[var(--card-bg)] px-4 py-4 text-[var(--foreground)] shadow-[var(--panel-shadow)]">
      <section className="space-y-4 rounded-[1.4rem] border border-[var(--theme-accent-soft)] bg-[var(--theme-accent-faint)] px-4 py-4">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">界面主题</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">保存后会立即作为全局配色生效，备份导出时也会一并带上。</p>
        </div>

        <div className="space-y-2">
          {THEME_OPTIONS.map((option) => {
            const checked = settings.theme === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-[1rem] border px-3 py-3 transition ${
                  checked
                    ? "border-[var(--theme-accent-soft)] bg-[var(--theme-accent-muted)]"
                    : "border-[var(--panel-border)] bg-[var(--card-bg-secondary)]"
                }`}
              >
                <input
                  type="radio"
                  name="theme-mode"
                  value={option.value}
                  checked={checked}
                  onChange={() => onChange("theme", option.value)}
                  className="mt-1 h-4 w-4 accent-[rgb(102,8,116)]"
                />
                <span className="space-y-1">
                  <span className="block text-sm font-semibold text-[var(--foreground)]">{option.label}</span>
                  <span className="block text-xs leading-5 text-[var(--muted-foreground)]">{option.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">AI 设置</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">这些配置仍然只保存在本机；导出备份时会一起写入 JSON。</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--foreground)]">AI API Key</label>
          <input
            value={settings.aiApiKey}
            onChange={(event) => onChange("aiApiKey", event.target.value)}
            placeholder="sk-xxx"
            className="w-full rounded-2xl border border-[var(--panel-border)] bg-[var(--card-bg-secondary)] px-4 py-3 text-sm outline-none transition focus:border-[var(--theme-accent-soft)] focus:bg-[var(--card-bg)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--foreground)]">AI Base URL</label>
          <input
            value={settings.aiBaseUrl}
            onChange={(event) => onChange("aiBaseUrl", event.target.value)}
            placeholder="DeepSeek: https://api.deepseek.com/v1"
            className="w-full rounded-2xl border border-[var(--panel-border)] bg-[var(--card-bg-secondary)] px-4 py-3 text-sm outline-none transition focus:border-[var(--theme-accent-soft)] focus:bg-[var(--card-bg)]"
          />
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            Base URL 可留空，默认会使用 <code>https://api.deepseek.com/v1</code>；若手动填写，请填写 <code>/v1</code> 或 <code>/v1/chat/completions</code>，不要填写官网网页地址。
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--foreground)]">AI Model Name</label>
          <input
            value={settings.aiModelName}
            onChange={(event) => onChange("aiModelName", event.target.value)}
            placeholder="deepseek-chat"
            className="w-full rounded-2xl border border-[var(--panel-border)] bg-[var(--card-bg-secondary)] px-4 py-3 text-sm outline-none transition focus:border-[var(--theme-accent-soft)] focus:bg-[var(--card-bg)]"
          />
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">默认模型为 <code>deepseek-chat</code>，留空保存时也会自动回退到该模型。</p>
        </div>

        <PrimaryButton type="button" onClick={onSave}>保存设置</PrimaryButton>
      </section>

      <section className="space-y-4 rounded-[1.4rem] border border-[var(--theme-accent-soft)] bg-[var(--theme-accent-faint)] px-4 py-4">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">备份与迁移</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">先导出再导入即可在手机或新设备恢复。备份文件是单个 JSON。</p>
        </div>

        <PrimaryButton type="button" onClick={onExport}>导出备份</PrimaryButton>

        <div className="space-y-3 rounded-[1.2rem] border border-[var(--panel-border)] bg-[var(--card-bg)] p-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--foreground)]">导入模式</p>
            <div className="space-y-2">
              {IMPORT_MODE_OPTIONS.map((option) => {
                const checked = importMode === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-[1rem] border px-3 py-3 transition ${
                      checked
                        ? "border-[var(--theme-accent-soft)] bg-[var(--theme-accent-muted)]"
                        : "border-[var(--panel-border)] bg-[var(--card-bg-secondary)]"
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
                      <span className="block text-sm font-semibold text-[var(--foreground)]">{option.label}</span>
                      <span className="block text-xs leading-5 text-[var(--muted-foreground)]">{option.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs leading-5 text-[var(--muted-foreground)]">覆盖导入会替换当前词库。稳妥起见，建议先导出一次当前数据。</p>
            <label className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[var(--theme-accent-soft)] bg-[var(--card-bg)] px-4 py-3 text-sm font-semibold text-[var(--theme-accent-strong)] transition hover:bg-[var(--theme-accent-faint)]">
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
