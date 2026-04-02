"use client";

import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden border-t border-[var(--shell-border)] bg-[var(--shell-bg)] shadow-[var(--shell-shadow)] backdrop-blur-2xl transition-colors"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {children}
    </div>
  );
}
