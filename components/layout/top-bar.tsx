"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Check, LoaderCircle } from "lucide-react";
import { APP_NAME } from "@/lib/utils/constants";

type TopBarProps = {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  backHref?: string;
};

export function TopBar({
  title = APP_NAME,
  showBack = false,
  showSettings = true,
  onConfirm,
  confirmDisabled = false,
  confirmLoading = false,
  backHref = "/",
}: TopBarProps) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.replace(backHref);
  }

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3 text-[var(--foreground)] backdrop-blur-xl transition-colors">
      <div className="flex items-center justify-between rounded-[1.35rem] border border-[var(--panel-border)] bg-[var(--card-bg)] px-3 py-2 shadow-[var(--panel-shadow)]">
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--card-bg-secondary)] text-[var(--foreground)] shadow-sm"
              aria-label="返回"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <div className="h-10 w-10" />
          )}
          <div className="truncate text-base font-bold tracking-[0.01em] text-[var(--foreground)]">{title}</div>
        </div>

        <div className="flex items-center gap-2">
          {onConfirm ? (
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className="flex h-10 min-w-10 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--card-bg-secondary)] px-3 shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={confirmLoading ? "处理中" : "确认"}
              style={{ color: "var(--theme-accent-strong)" }}
            >
              {confirmLoading ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <LoaderCircle size={15} className="animate-spin" />
                  生成中
                </span>
              ) : (
                <Check size={18} />
              )}
            </button>
          ) : null}

          {showSettings ? (
            <Link
              href="/settings"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--card-bg-secondary)] text-[var(--foreground)] shadow-sm"
              aria-label="设置"
            >
              <Settings size={18} />
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
