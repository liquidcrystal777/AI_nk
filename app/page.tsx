"use client";

import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { HomeNavButtons, HomeStatCard } from "@/components/home/home-sections";

export default function HomePage() {
  return (
    <AppShell>
      <TopBar title="考研英语神器" />
      <main className="flex flex-1 flex-col justify-center gap-6 px-4 py-6">
        <HomeStatCard />
        <HomeNavButtons />
      </main>
    </AppShell>
  );
}
