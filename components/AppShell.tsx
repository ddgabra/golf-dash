"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { identities } from "@/lib/core/seed";
import { getNavRoutes } from "@/lib/core/access";
import { useAppData } from "@/lib/hooks/useAppData";
import type { Role } from "@/lib/core/models";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, loading, setRole } = useAppData();

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fairway-50">
        <div className="panel text-center" role="status" aria-live="polite">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-fairway-300" />
          <p className="mt-4 font-semibold text-fairway-800">Loading FairwayServe…</p>
        </div>
      </div>
    );
  }

  const nav = getNavRoutes(data.activeRole);
  const identity = identities.find((i) => i.role === data.activeRole);

  return (
    <div className="min-h-screen bg-fairway-50 text-fairway-950">
      {data.offline && (
        <div
          role="status"
          className="bg-amber-500 px-4 py-2 text-center text-sm font-bold text-amber-950"
        >
          Offline — changes will sync when connection returns
        </div>
      )}
      {data.poorConnection && (
        <div className="bg-orange-400 px-4 py-2 text-center text-sm font-bold text-orange-950">
          Simulated poor connection — updates may be delayed
        </div>
      )}
      <header className="sticky top-0 z-50 border-b border-fairway-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/round" className="text-xl font-black text-fairway-800">
            FairwayServe
          </Link>
          <nav
            className="flex max-w-full gap-1 overflow-x-auto pb-1"
            aria-label="Main navigation"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-link whitespace-nowrap",
                  pathname === item.href && "nav-link-active",
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-fairway-600">
            Demo role (not production auth)
            <select
              className="min-h-touch rounded-xl border border-fairway-200 bg-white px-3 py-2 text-sm font-medium normal-case text-fairway-900"
              value={data.activeRole}
              onChange={(e) => void setRole(e.target.value as Role)}
              aria-label="Switch demo role"
            >
              {identities.map((i) => (
                <option key={i.role} value={i.role}>
                  {i.name} — {i.role.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <section className="hero mb-6">
          <p className="eyebrow">Database-free local prototype</p>
          <h1 className="page-title">{identity?.name ?? "FairwayServe"}</h1>
          <p className="mt-2 max-w-3xl text-fairway-700">
            {identity?.profile}. Data persists in typed repositories with
            BroadcastChannel synchronization across tabs.
          </p>
        </section>
        {children}
      </main>
      <NotificationToast />
    </div>
  );
}

function NotificationToast() {
  const { data } = useAppData();
  if (!data) return null;
  const recent = data.notifications.filter((n) => !n.read).slice(-2);
  if (recent.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-fairway-950 px-4 py-3 text-sm text-white shadow-2xl md:left-auto md:right-4 md:max-w-md"
    >
      {recent.map((n) => (
        <p key={n.id}>{n.message}</p>
      ))}
    </div>
  );
}
