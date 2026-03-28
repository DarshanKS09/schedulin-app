import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SESSION_DURATION_MINUTES } from "@/lib/session";

export default async function SessionExpiredPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params?.next?.startsWith("/") ? params.next : "/dashboard";
  const loginHref = `/auth/login?next=${encodeURIComponent(nextPath)}`;

  return (
    <div className="mx-auto flex max-w-3xl items-center justify-center py-12 sm:py-20">
      <Card className="glass-panel-strong w-full rounded-[32px] border-white/70 p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-10">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-lg font-bold text-amber-700">
          15
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[color:var(--ink-strong)] sm:text-4xl">
          Your session has expired
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          For security, sessions now expire after about {SESSION_DURATION_MINUTES} minutes. Please sign in again to keep managing your dashboard and bookings.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href={loginHref as Route}>
            <Button type="button">Re-login</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
