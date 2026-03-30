"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getBrowseFilterOptions, getBrowseWords } from "@/lib/db/queries";
import type { BrowseFilters } from "@/types/db";

const defaultFilters: BrowseFilters = {
  keyword: "",
  year: "",
  sourceTextId: "",
};

export function useBrowseWords() {
  const [filters, setFilters] = useState<BrowseFilters>(defaultFilters);
  const [years, setYears] = useState<string[]>([]);
  const [sourceTextIds, setSourceTextIds] = useState<string[]>([]);
  const words = useLiveQuery(() => getBrowseWords(filters), [filters], []);

  useEffect(() => {
    void getBrowseFilterOptions().then((options) => {
      setYears(options.years);
      setSourceTextIds(options.sourceTextIds);
    });
  }, []);

  return {
    filters,
    setFilters,
    words,
    years,
    sourceTextIds,
  };
}
