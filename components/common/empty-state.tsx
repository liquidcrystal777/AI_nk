type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      className="rounded-3xl px-5 py-10 text-center"
      style={{
        backgroundColor: "var(--empty-state-bg)",
        border: "1px dashed var(--empty-state-border)",
      }}
    >
      <h2 className="text-lg font-semibold" style={{ color: "var(--empty-state-title)" }}>{title}</h2>
      <p className="mt-2 text-sm leading-6" style={{ color: "var(--empty-state-text)" }}>{description}</p>
    </div>
  );
}