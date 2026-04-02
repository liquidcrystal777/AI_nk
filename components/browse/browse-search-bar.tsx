"use client";

import { Search } from "lucide-react";
import type { BrowseFilters } from "@/types/db";

type BrowseSearchBarProps = {
  filters: BrowseFilters;
  onChange: (nextFilters: BrowseFilters) => void;
};

export function BrowseSearchBar({ filters, onChange }: BrowseSearchBarProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/78 p-2.5 shadow-[0_12px_24px_rgba(102,8,116,0.08)] backdrop-blur-md">
      <label className="flex items-center gap-2 rounded-[1.1rem] border border-neutral-200 bg-neutral-50/80 px-3 py-2.5">
        <Search size={16} className="text-neutral-400" />
        <input
          value={filters.keyword}
          onChange={(event) => onChange({ ...filters, keyword: event.target.value })}
          placeholder="搜单词拼写"
          className="w-full bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
        />
      </label>
    </div>
  );
}
