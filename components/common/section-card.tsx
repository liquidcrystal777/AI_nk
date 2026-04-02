import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function SectionCard({ children, className = "", style }: SectionCardProps) {
  return (
    <section
      className={`rounded-3xl p-4 shadow-sm ${className}`}
      style={{
        backgroundColor: "var(--section-card-bg)",
        borderColor: "var(--section-card-border)",
        boxShadow: "var(--section-card-shadow)",
        border: "1px solid var(--section-card-border)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}