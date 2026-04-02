"use client";

import type { ReactNode } from "react";
import { useSettings } from "@/lib/hooks/use-settings";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { settings } = useSettings();

  return <div data-theme={settings.theme} className="min-h-dvh bg-[var(--background)]">{children}</div>;
}
