import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PrimaryButton({ children, className = "", ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={`flex min-h-12 w-full items-center justify-center rounded-2xl border border-[var(--theme-accent-soft)] bg-[var(--theme-accent-strong)] px-4 py-3 text-base font-semibold text-white shadow-[0_12px_26px_rgba(102,8,116,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
