import Link from "next/link";
import { redirect } from "next/navigation";

import { AvailabilityForm } from "@/components/availability-form";
import { BookingList } from "@/components/booking-list";
import { CopyBookingLinkButton } from "@/components/copy-booking-link-button";
import { GoogleCalendarMenu } from "@/components/google-calendar-menu";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGoogleRedirectUri } from "@/lib/google";
import { getBaseUrl } from "@/lib/utils";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ google?: string }>;
}) {
  const user = await requireUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [availability, bookings, params] = await Promise.all([
    db.availability.findMany({
      where: { userId: user.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    db.booking.findMany({
      where: {
        hostId: user.id,
        startTime: {
          gte: new Date(),
        },
      },
      orderBy: { startTime: "asc" },
      take: 20,
    }),
    searchParams,
  ]);

  const bookingUrl = `${getBaseUrl()}/book/${user.username}`;
  const googleRedirectUri = getGoogleRedirectUri();

  return (
    <div className="space-y-8">
      <Card className="glass-panel-strong animate-fade-up overflow-hidden rounded-[32px] border-white/70 p-7 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand">Private dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--ink-strong)] sm:text-4xl">
              Welcome back, {user.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              This workspace is only available after login. Manage your availability, upcoming bookings, and Google Calendar connection from one secure place.
            </p>
            <p className="mt-4 text-sm text-slate-600">
              Share your booking page at{" "}
              <Link className="font-semibold text-brand" href={`/book/${user.username}`}>
                /book/{user.username}
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap gap-3 xl:justify-end">
            <a
              className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
              href={bookingUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open booking page
            </a>
            <GoogleCalendarMenu connected={Boolean(user.googleRefreshToken)} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Access</p>
            <p className="mt-2 text-lg font-semibold text-ink">Protected</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Calendar</p>
            <p className="mt-2 text-lg font-semibold text-ink">{user.googleRefreshToken ? "Connected" : "Not connected"}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Booking link</p>
            <div className="mt-2 flex flex-col gap-3">
              <p className="break-all text-sm font-semibold text-ink">{bookingUrl}</p>
              <div className="flex flex-wrap gap-2">
                <a
                  className="inline-flex items-center justify-center rounded-2xl bg-[#4285F4] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(66,133,244,0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#3b78e7]"
                  href={bookingUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open link
                </a>
                <CopyBookingLinkButton bookingUrl={bookingUrl} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {params?.google === "connected" ? (
        <Card className="animate-fade-up rounded-3xl border-brand/20 bg-teal-50">
          <p className="text-sm font-medium text-brand">Google Calendar is connected and future bookings will create calendar events.</p>
        </Card>
      ) : null}

      {params?.google === "disconnected" ? (
        <Card className="animate-fade-up rounded-3xl border-slate-200 bg-slate-50">
          <p className="text-sm font-medium text-slate-700">Google Calendar was disconnected. You can now connect a different Google account.</p>
        </Card>
      ) : null}

      {params?.google === "error" ? (
        <Card className="animate-fade-up rounded-3xl border-rose-200 bg-rose-50">
          <p className="text-sm font-medium text-rose-700">
            Google Calendar connection failed. If Google shows `redirect_uri_mismatch`, add this exact callback URL in Google Cloud OAuth settings:
          </p>
          <p className="mt-2 break-all text-sm font-semibold text-rose-800">{googleRedirectUri}</p>
        </Card>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
        <AvailabilityForm initialAvailability={availability} />
        <BookingList bookings={bookings} />
      </div>
    </div>
  );
}
