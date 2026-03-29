import type { ButtonHTMLAttributes, ReactNode } from "react";
import { APP_PURPLE } from "@/lib/utils/constants";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PrimaryButton({ children, className = "", ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={`flex min-h-12 w-full items-center justify-center rounded-2xl px-4 py-3 text-base font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{ backgroundColor: APP_PURPLE }}
    >
      {children}
    </button>
  );
}
