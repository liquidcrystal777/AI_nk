"use client";

import Link from "next/link";
import { ArrowLeft, Settings, Check } from "lucide-react";
import { APP_NAME, APP_PURPLE } from "@/lib/utils/constants";

type TopBarProps = {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  backHref?: string;
};

export function TopBar({
  title = APP_NAME,
  showBack = false,
  showSettings = true,
  onConfirm,
  confirmDisabled = false,
  backHref = "/",
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/60 bg-white/82 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between rounded-[1.35rem] border border-white/70 bg-white/72 px-3 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <Link
              href={backHref}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/80 bg-white/90 text-neutral-700 shadow-sm"
              aria-label="返回"
            >
              <ArrowLeft size={18} />
            </Link>
          ) : (
            <div className="h-10 w-10" />
          )}
          <div className="truncate text-base font-bold tracking-[0.01em] text-neutral-900">{title}</div>
        </div>

        <div className="flex items-center gap-2">
          {onConfirm ? (
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/80 bg-white/90 shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="确认"
              style={{ color: APP_PURPLE }}
            >
              <Check size={18} />
            </button>
          ) : null}

          {showSettings ? (
            <Link
              href="/settings"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/80 bg-white/90 text-neutral-700 shadow-sm"
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
