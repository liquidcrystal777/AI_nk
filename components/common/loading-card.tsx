export function LoadingCard({ text = "加载中..." }: { text?: string }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-10 text-center text-sm text-neutral-500 shadow-sm">
      {text}
    </div>
  );
}
