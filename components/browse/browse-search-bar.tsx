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
    <div className="space-y-2 rounded-[1.85rem] border border-white/70 bg-white/78 p-3 shadow-[0_14px_32px_rgba(102,8,116,0.08)] backdrop-blur-md">
      <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50/80 px-3 py-2.5">
        <Search size={16} className="text-neutral-400" />
        <input
          value={filters.keyword}
          onChange={(event) => onChange({ ...filters, keyword: event.target.value })}
          placeholder="搜索拼写、释义或例句"
          className="w-full bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={filters.year}
          onChange={(event) => onChange({ ...filters, year: event.target.value })}
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none"
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
          className="rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none"
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
