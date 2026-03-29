"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Check } from "lucide-react";
import { APP_NAME, APP_PURPLE } from "@/lib/utils/constants";

type TopBarProps = {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
};

export function TopBar({
  title = APP_NAME,
  showBack = false,
  showSettings = true,
  onConfirm,
  confirmDisabled = false,
}: TopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        {showBack ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700"
            aria-label="返回"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div className="h-10 w-10" />
        )}
        <div className="truncate text-base font-semibold text-neutral-900">{title}</div>
      </div>

      <div className="flex items-center gap-2">
        {onConfirm ? (
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="确认"
            style={{ color: APP_PURPLE }}
          >
            <Check size={18} />
          </button>
        ) : null}

        {showSettings ? (
          <Link
            href="/settings"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700"
            aria-label="设置"
          >
            <Settings size={18} />
          </Link>
        ) : null}
      </div>
    </header>
  );
}
