"use client";

import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { HomeNavButtons, HomeStatCard } from "@/components/home/home-sections";
import { APP_NAME } from "@/lib/utils/constants";

export default function HomePage() {
  return (
    <AppShell>
      <div className="relative flex min-h-full flex-col overflow-hidden bg-[var(--page-surface)] transition-colors">
        <div className="pointer-events-none absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[var(--theme-accent-muted)] opacity-80 blur-[120px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[-10rem] h-[18rem] bg-[radial-gradient(circle_at_center,_var(--theme-accent-faint)_0%,_transparent_70%)]" />

        <div className="relative z-10 flex flex-1 flex-col">
          <TopBar title={APP_NAME} />
          <main className="flex flex-1 flex-col justify-center px-4 py-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]">
            <section className="rounded-[2rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-[var(--panel-shadow)] backdrop-blur-2xl transition-colors">
              <HomeStatCard />
              <HomeNavButtons />
            </section>
          </main>
        </div>
      </div>
    </AppShell>
  );
}
