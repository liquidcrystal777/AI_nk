import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({ children, className = "" }: SectionCardProps) {
  return <section className={`rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm ${className}`}>{children}</section>;
}
