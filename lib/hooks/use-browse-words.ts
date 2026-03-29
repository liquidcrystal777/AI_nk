"use client";

import { useEffect, useState } from "react";
import { getBrowseFilterOptions, getBrowseWords } from "@/lib/db/queries";
import type { BrowseFilters, WordRecord } from "@/types/db";

const defaultFilters: BrowseFilters = {
  keyword: "",
  year: "",
  sourceTextId: "",
};

export function useBrowseWords() {
  const [filters, setFilters] = useState<BrowseFilters>(defaultFilters);
  const [words, setWords] = useState<WordRecord[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [sourceTextIds, setSourceTextIds] = useState<string[]>([]);

  useEffect(() => {
    void getBrowseFilterOptions().then((options) => {
      setYears(options.years);
      setSourceTextIds(options.sourceTextIds);
    });
  }, []);

  useEffect(() => {
    void getBrowseWords(filters).then(setWords);
  }, [filters]);

  return {
    filters,
    setFilters,
    words,
    years,
    sourceTextIds,
  };
}
