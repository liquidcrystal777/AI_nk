"use client";

import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { HomeNavButtons, HomeStatCard } from "@/components/home/home-sections";

export default function HomePage() {
  return (
    <AppShell>
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.32),_transparent_34%),linear-gradient(160deg,_#4c1d95_0%,_#7c3aed_42%,_#c084fc_100%)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-white/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-fuchsia-200/30 blur-3xl" />

        <div className="relative z-10 flex flex-1 flex-col">
          <TopBar title="考研英语神器" />
          <main className="flex flex-1 flex-col justify-center px-4 py-6">
            <section className="rounded-[2rem] border border-white/30 bg-white/16 p-3 shadow-[0_24px_80px_rgba(76,29,149,0.28)] backdrop-blur-2xl">
              <div className="rounded-[1.6rem] border border-white/35 bg-white/72 px-4 py-5 backdrop-blur-xl">
                <HomeStatCard />
                <HomeNavButtons />
              </div>
            </section>
          </main>
        </div>
      </div>
    </AppShell>
  );
}
