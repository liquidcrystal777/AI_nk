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
      className={`group flex min-h-[7.25rem] flex-col justify-between rounded-[1.9rem] border border-white/45 bg-white/78 p-4 shadow-[0_16px_36px_rgba(76,29,149,0.12)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/88 ${className}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(102,8,116,0.1)] text-[rgb(102,8,116)] transition duration-200 group-hover:scale-105 group-hover:bg-[rgba(102,8,116,0.14)]">
        <Icon size={20} />
      </span>
      <div className="text-lg font-black tracking-[0.14em] text-neutral-900">{label}</div>
    </Link>
  );
}

export function HomeStatCard() {
  const { totalWords, dueCount } = useHomeStats();

  return (
    <section className="rounded-[1.85rem] border border-white/50 bg-white/72 px-5 py-8 text-center shadow-[0_18px_40px_rgba(76,29,149,0.1)] backdrop-blur-md">
      <div className="text-xs font-semibold tracking-[0.32em] text-neutral-500 uppercase">词库总量</div>
      <div className="mt-4 text-7xl font-black tracking-[-0.04em] text-neutral-950">{totalWords}</div>
      <div className="mt-3 inline-flex rounded-full border border-white/70 bg-white/78 px-4 py-2 text-sm font-medium text-neutral-600 shadow-sm">
        当前待复习 {dueCount} 个
      </div>
    </section>
  );
}

export function HomeNavButtons() {
  return (
    <div className="mt-4 space-y-3">
      <HomeEntryCard href="/browse" label="BROWSE" icon={BookOpen} />

      <div className="grid grid-cols-2 gap-3">
        <HomeEntryCard href="/record" label="RECORD" icon={PenSquare} />
        <HomeEntryCard href="/review" label="REVIEW" icon={Sparkles} />
      </div>
    </div>
  );
}
