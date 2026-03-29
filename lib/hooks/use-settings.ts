"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getSettings } from "@/lib/db/queries";
import { saveSettings } from "@/lib/db/mutations";
import { DEFAULT_SETTINGS } from "@/lib/utils/constants";

export function useSettings() {
  const settings = useLiveQuery(() => getSettings(), [], DEFAULT_SETTINGS);

  return {
    settings,
    saveSettings,
  };
}
