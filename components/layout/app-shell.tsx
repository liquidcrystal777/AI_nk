"use client";

import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-[linear-gradient(180deg,#fcfbff_0%,#f7f3fb_100%)] shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
      {children}
    </div>
  );
}
