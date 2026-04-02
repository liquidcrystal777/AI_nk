"use client";

import Link from "next/link";
import { BookOpen, PenSquare, Sparkles } from "lucide-react";
import { useHomeStats } from "@/lib/hooks/use-home-stats";

type HomeEntryCardProps = {
  href: string;
  label: string;
  icon: typeof BookOpen;
  className?: string;
};

function HomeEntryCard({ href, label, icon: Icon, className = "" }: HomeEntryCardProps) {
  return (
    <Link
      href={href}
      className={`group flex min-h-[5.5rem] items-center justify-between rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--card-bg)] px-5 py-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--card-bg-secondary)] ${className}`}
    >
      <div className="text-base font-serif font-bold tracking-[0.2em] text-[var(--foreground)]">{label}</div>
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--theme-accent-soft)] bg-[var(--theme-accent-faint)] text-[var(--theme-accent-strong)] transition duration-200 group-hover:scale-105">
        <Icon size={19} />
      </span>
    </Link>
  );
}

export function HomeStatCard() {
  const { totalWords, dueCount } = useHomeStats();

  return (
    <section className="rounded-3xl border border-[var(--panel-border)] bg-[var(--card-bg)] px-5 py-8 text-center shadow-[var(--panel-shadow)] backdrop-blur-xl transition-colors">
      <div className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--muted-foreground)]">词库总量</div>
      <div className="mt-4 font-serif text-8xl text-[var(--foreground)]">{totalWords}</div>
      <div className="mt-4 inline-flex rounded-full border border-[var(--theme-accent-soft)] bg-[var(--theme-accent-muted)] px-4 py-2 text-sm font-medium text-[var(--theme-accent-strong)]">
        待复习 {dueCount}
      </div>
    </section>
  );
}

export function HomeNavButtons() {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <HomeEntryCard href="/browse" label="BROWSE" icon={BookOpen} />
      <HomeEntryCard href="/record" label="RECORD" icon={PenSquare} />
      <HomeEntryCard href="/review" label="REVIEW" icon={Sparkles} />
    </div>
  );
}
