import Link from "next/link";

import { Card } from "@/components/ui/card";
import { getSessionFromCookies } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSessionFromCookies();

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand">Scheduling made practical</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-ink sm:text-6xl">
          A clean booking flow with real availability, protected auth, and Google Calendar sync.
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Echo Scheduler gives every user a shareable booking page, a focused dashboard, and production-ready booking logic that stores all meeting data in UTC.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            href={session ? "/dashboard" : "/auth/register"}
          >
            {session ? "Open dashboard" : "Create your account"}
          </Link>
          <Link
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink ring-1 ring-slate-200 hover:bg-slate-50"
            href="/auth/login"
          >
            Sign in
          </Link>
        </div>
      </section>

      <Card className="space-y-4">
        <div className="rounded-2xl bg-slate-900 p-5 text-slate-50">
          <p className="text-sm uppercase tracking-[0.25em] text-teal-200">Highlights</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            <li>JWT auth stored in HTTP-only cookies</li>
            <li>Prisma models for users, availability, and bookings</li>
            <li>Conflict-safe booking flow with UTC storage</li>
            <li>Google Calendar event creation after successful booking</li>
            <li>OpenAI-generated meeting descriptions with graceful fallback</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-500">Public page format</p>
          <p className="mt-2 font-mono text-sm text-ink">/book/your-username</p>
        </div>
      </Card>
    </div>
  );
}
