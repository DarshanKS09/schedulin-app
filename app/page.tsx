import Link from "next/link";

import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
      <section className="animate-fade-up max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand shadow-sm backdrop-blur">
          Professional scheduling suite
        </div>
        <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-[color:var(--ink-strong)] sm:text-6xl lg:text-7xl">
          Secure bookings, clearer availability, and a dashboard that stays private until login.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
          Slotify gives teams a polished booking flow, protected access control, Google Calendar sync, and dependable UTC-first scheduling without the clutter.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-2xl bg-ink px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] hover:bg-slate-800"
            href="/auth/register"
          >
            Create your account
          </Link>
          <Link
            className="rounded-2xl border border-slate-200 bg-white/85 px-6 py-3.5 text-sm font-semibold text-ink shadow-sm hover:bg-white"
            href="/auth/login"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="glass-panel-strong rounded-3xl p-5 shadow-sm">
            <p className="text-3xl font-semibold text-[color:var(--ink-strong)]">JWT</p>
            <p className="mt-2 text-sm text-slate-600">HTTP-only session security for protected dashboard access.</p>
          </div>
          <div className="glass-panel-strong rounded-3xl p-5 shadow-sm">
            <p className="text-3xl font-semibold text-[color:var(--ink-strong)]">UTC</p>
            <p className="mt-2 text-sm text-slate-600">Reliable time storage across bookings, availability, and sync.</p>
          </div>
          <div className="glass-panel-strong rounded-3xl p-5 shadow-sm">
            <p className="text-3xl font-semibold text-[color:var(--ink-strong)]">24/7</p>
            <p className="mt-2 text-sm text-slate-600">Shareable public pages paired with a focused internal command center.</p>
          </div>
        </div>
      </section>

      <section className="animate-fade-up-delay relative">
        <div className="animate-float-soft absolute -right-6 top-10 hidden h-28 w-28 rounded-full bg-teal-200/30 blur-2xl sm:block" />
        <Card className="glass-panel-strong relative overflow-hidden rounded-[32px] border-white/70 p-0 shadow-[0_24px_90px_rgba(15,23,42,0.1)]">
          <div className="border-b border-slate-200/80 px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Operations preview</p>
                <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ink-strong)]">Built for a modern booking workflow</h2>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                Live ready
              </span>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="rounded-3xl bg-slate-950 p-5 text-slate-50">
              <p className="text-sm uppercase tracking-[0.25em] text-teal-200">Highlights</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li>Protected dashboard access only after login</li>
                <li>Conflict-safe booking flow backed by Prisma and PostgreSQL</li>
                <li>Responsive booking pages with timezone-aware display</li>
                <li>Google Calendar connection with account-switch support</li>
                <li>AI-assisted meeting descriptions with graceful fallback</li>
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-500">Public booking URL</p>
                <p className="mt-3 font-mono text-sm text-ink">/book/your-username</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-500">Private workspace</p>
                <p className="mt-3 text-sm font-medium text-ink">Availability, bookings, and calendar sync in one place</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
