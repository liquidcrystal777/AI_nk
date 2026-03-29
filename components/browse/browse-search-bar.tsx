"use client";

import { Search } from "lucide-react";
import type { BrowseFilters } from "@/types/db";

type BrowseSearchBarProps = {
  filters: BrowseFilters;
  years: string[];
  sourceTextIds: string[];
  onChange: (nextFilters: BrowseFilters) => void;
};

export function BrowseSearchBar({ filters, years, sourceTextIds, onChange }: BrowseSearchBarProps) {
  return (
    <div className="space-y-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
      <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3">
        <Search size={18} className="text-neutral-500" />
        <input
          value={filters.keyword}
          onChange={(event) => onChange({ ...filters, keyword: event.target.value })}
          placeholder="搜索拼写、释义或例句"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <select
          value={filters.year}
          onChange={(event) => onChange({ ...filters, year: event.target.value })}
          className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none"
        >
          <option value="">全部年份</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={filters.sourceTextId}
          onChange={(event) => onChange({ ...filters, sourceTextId: event.target.value })}
          className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none"
        >
          <option value="">全部文章</option>
          {sourceTextIds.map((sourceTextId) => (
            <option key={sourceTextId} value={sourceTextId}>
              {sourceTextId}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
