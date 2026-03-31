import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { SectionCard } from "@/components/common/section-card";
import { formatWordSpell } from "@/lib/utils/text";
import type { WordRecord } from "@/types/db";

type BrowseWordCardProps = {
  word: WordRecord;
  confirmingDelete: boolean;
  isDeleting: boolean;
  onToggleDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
};

function normalizeSentiment(sentiment: string) {
  if (sentiment.includes("正")) return "正向";
  if (sentiment.includes("负")) return "负向";
  return "中性";
}

function splitLines(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function Label({ children }: { children: ReactNode }) {
  return <div className="text-[0.78rem] font-black tracking-[0.02em] text-gray-950">【{children}】</div>;
}

export function BrowseWordCard({
  word,
  confirmingDelete,
  isDeleting,
  onToggleDelete,
  onConfirmDelete,
  onCancelDelete,
}: BrowseWordCardProps) {
  const displaySpell = formatWordSpell(word.spell);
  const sentimentLabel = normalizeSentiment(word.sentiment || "");
  const deodorizedLines = splitLines(word.deodorizedMeaning || "");

  return (
    <SectionCard className="overflow-hidden rounded-[1.15rem] border border-neutral-200 bg-white p-0 shadow-[0_14px_36px_rgba(102,8,116,0.10)]">
      <div className="flex h-[28rem] flex-col rounded-[1.15rem] bg-white">
        <div className="flex items-start justify-between gap-3 border-b border-[#660874]/12 px-4 pb-3 pt-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-end gap-2">
              <div className="truncate font-serif text-[1.7rem] leading-none text-[#660874]">{displaySpell}</div>
              {word.partOfSpeech ? <div className="pb-0.5 font-serif text-sm text-neutral-500">{word.partOfSpeech}</div> : null}
              <span className="rounded-md bg-[#660874]/10 px-2 py-0.5 text-[0.72rem] font-semibold text-[#660874]">{sentimentLabel}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleDelete}
            disabled={isDeleting}
            aria-label="删除单词"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-4 py-3">
          <div className="space-y-1.5 rounded-[0.95rem] bg-[#660874]/[0.04] px-3 py-2.5">
            <Label>释义</Label>
            <p className="line-clamp-3 text-[0.98rem] font-semibold leading-6 text-neutral-950">{word.meaning || "暂无释义"}</p>
          </div>

          <div className="space-y-2 rounded-[0.95rem] border border-neutral-200 px-3 py-2.5">
            <Label>考点逻辑</Label>
            <div className="space-y-1.5">
              <p className="text-[0.76rem] leading-5 text-neutral-600">
                <span className="mr-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-[#660874]">1.原句:</span>
                <span className="font-serif italic">{word.originalSentence || "暂无原句"}</span>
              </p>
              <p className="text-[0.76rem] leading-5 text-neutral-600">
                <span className="mr-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-[#660874]">2.记忆词根:</span>
                <span>{word.usageExplanation || "暂无记忆/词根"}</span>
              </p>
              <p className="text-[0.76rem] leading-5 text-neutral-800">
                <span className="mr-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-[#660874]">3.去味:</span>
                <span>{deodorizedLines.join(" / ") || "暂无去味"}</span>
              </p>
            </div>
          </div>

          {confirmingDelete ? (
            <div className="rounded-[0.95rem] border border-rose-200 bg-rose-50/90 px-3 py-2.5 text-rose-700">
              <div className="text-sm font-semibold">确认删除 {displaySpell}？</div>
              <div className="mt-1 text-[0.72rem] text-rose-500">删除后不会恢复。</div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  disabled={isDeleting}
                  className="rounded-md bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? "删除中..." : "确认删除"}
                </button>
                <button
                  type="button"
                  onClick={onCancelDelete}
                  disabled={isDeleting}
                  className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  取消
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}
