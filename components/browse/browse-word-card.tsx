import { Trash2 } from "lucide-react";
import { WordCard } from "@/components/common/word-card";
import type { CardType, WordRecord } from "@/types/db";

function normalizeSentiment(sentiment: string) {
  if (sentiment.includes("正")) return "正向";
  if (sentiment.includes("负")) return "负向";
  return "中性";
}

function getCardTypeLabel(cardType: CardType) {
  switch (cardType) {
    case "phrase":
      return "词组";
    case "rare_meaning":
      return "熟词僻义";
    case "comparison":
      return "对比";
    default:
      return null;
  }
}

type BrowseWordCardProps = {
  word: WordRecord;
  confirmingDelete: boolean;
  isDeleting: boolean;
  onToggleDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
};

export function BrowseWordCard({
  word,
  confirmingDelete,
  isDeleting,
  onToggleDelete,
  onConfirmDelete,
  onCancelDelete,
}: BrowseWordCardProps) {
  const sentimentLabel = normalizeSentiment(word.sentiment || "");
  const cardTypeLabel = getCardTypeLabel(word.cardType || "normal");
  const isComparison = word.cardType === "comparison";

  return (
    <WordCard
      word={word}
      variant="browse"
      className="rounded-[1.15rem]"
      footer={
        <div className="space-y-3">
          {confirmingDelete ? (
            <div
              className="rounded-[0.95rem] px-3 py-2.5"
              style={{
                backgroundColor: "var(--delete-panel-bg)",
                border: "1px solid var(--delete-panel-border)",
                color: "var(--delete-panel-text)",
              }}
            >
              <div className="text-sm font-semibold">确认删除 {word.spell}？</div>
              <div className="mt-1 text-[0.72rem]" style={{ color: "var(--delete-panel-muted)" }}>删除后不会恢复。</div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  disabled={isDeleting}
                  className="rounded-md px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: "var(--delete-confirm-bg)" }}
                >
                  {isDeleting ? "删除中..." : "确认删除"}
                </button>
                <button
                  type="button"
                  onClick={onCancelDelete}
                  disabled={isDeleting}
                  className="rounded-md px-3 py-2 text-xs font-semibold transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--delete-cancel-bg)",
                    border: "1px solid var(--delete-cancel-border)",
                    color: "var(--delete-cancel-text)",
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          ) : null}

          {isComparison ? (
            <div
              className="rounded-lg px-3 py-2 text-center text-xs"
              style={{
                backgroundColor: "var(--comparison-notice-bg)",
                color: "var(--comparison-notice-text)",
              }}
            >
              此对比卡片仅供查阅参考，不参与复习流程
            </div>
          ) : null}

          <div
            className="flex items-center justify-between gap-3 px-4 py-3 -mx-5 -mb-4 sm:-mx-6"
            style={{
              backgroundColor: "var(--browse-footer-bg)",
              borderTop: "1px solid var(--browse-footer-border)",
            }}
          >
            <span
              className="rounded-lg px-3 py-1.5 text-sm font-semibold tracking-[0.01em] shadow-sm"
              style={{
                backgroundColor: "var(--browse-tag-bg)",
                border: "1px solid var(--browse-tag-border)",
                color: "var(--browse-tag-text)",
              }}
            >
              {sentimentLabel}
            </span>

            <button
              type="button"
              onClick={onToggleDelete}
              disabled={isDeleting}
              aria-label="删除单词"
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: "var(--delete-panel-bg)",
                border: "1px solid var(--delete-panel-border)",
                color: "var(--delete-panel-muted)",
              }}
            >
              <Trash2 size={16} />
              <span>删除</span>
            </button>
          </div>
        </div>
      }
    />
  );
}