"use client";

import Link from "next/link";
import { useHomeStats } from "@/lib/hooks/use-home-stats";
import { SectionCard } from "@/components/common/section-card";
import { PrimaryButton } from "@/components/common/primary-button";

export function HomeStatCard() {
  const { totalWords, dueCount } = useHomeStats();

  return (
    <SectionCard className="py-8 text-center">
      <div className="text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">词库总量</div>
      <div className="mt-4 text-6xl font-black tracking-tight text-neutral-900">{totalWords}</div>
      <div className="mt-4 text-sm text-neutral-600">当前待复习 {dueCount} 个</div>
    </SectionCard>
  );
}

export function HomeNavButtons() {
  return (
    <div className="space-y-3">
      <Link href="/browse" className="block">
        <PrimaryButton type="button">浏览词库</PrimaryButton>
      </Link>
      <Link href="/record" className="block">
        <PrimaryButton type="button">录入新词</PrimaryButton>
      </Link>
      <Link href="/review" className="block">
        <PrimaryButton type="button">开始复习</PrimaryButton>
      </Link>
    </div>
  );
}
