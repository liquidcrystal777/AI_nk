"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getSettings } from "@/lib/db/queries";
import { DEFAULT_SETTINGS } from "@/lib/utils/constants";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  // 使用 useLiveQuery 直接订阅 settings，避免整个 settings 对象变化导致重新渲染
  const settings = useLiveQuery(() => getSettings(), [], DEFAULT_SETTINGS);
  const containerRef = useRef<HTMLDivElement>(null);

  // 只订阅 theme 变化，避免其他 settings 字段变化触发重新渲染
  const theme = useMemo(() => settings?.theme ?? DEFAULT_SETTINGS.theme, [settings?.theme]);

  // 直接操作 DOM 的 data-theme 属性，避免整个组件树重新渲染
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return (
    <div ref={containerRef} data-theme={theme} className="min-h-dvh bg-[var(--background)]">
      {children}
    </div>
  );
}
