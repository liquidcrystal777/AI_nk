export function LoadingCard({ text = "加载中..." }: { text?: string }) {
  return (
    <div
      className="rounded-3xl px-5 py-10 text-center text-sm shadow-sm"
      style={{
        backgroundColor: "var(--loading-card-bg)",
        borderColor: "var(--loading-card-border)",
        color: "var(--loading-card-text)",
        border: "1px solid var(--loading-card-border)",
      }}
    >
      {text}
    </div>
  );
}