import Link from "next/link";
import { redirect } from "next/navigation";

import { AvailabilityForm } from "@/components/availability-form";
import { BookingList } from "@/components/booking-list";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
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

  return (
    <div className="space-y-8">
      <Card className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Welcome back, {user.name}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Share your booking page at{" "}
            <Link className="font-semibold text-brand" href={`/book/${user.username}`}>
              /book/{user.username}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            className="inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            href={bookingUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open booking page
          </a>
          <a href="/api/google/connect">
            <Button variant="ghost">
              {user.googleRefreshToken ? "Reconnect Google Calendar" : "Connect Google Calendar"}
            </Button>
          </a>
          <LogoutButton />
        </div>
      </Card>

      {params?.google === "connected" ? (
        <Card className="border-brand/20 bg-teal-50">
          <p className="text-sm font-medium text-brand">Google Calendar is connected and future bookings will create calendar events.</p>
        </Card>
      ) : null}

      {params?.google === "error" ? (
        <Card className="border-rose-200 bg-rose-50">
          <p className="text-sm font-medium text-rose-700">Google Calendar connection failed. Please verify your OAuth settings and try again.</p>
        </Card>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <AvailabilityForm initialAvailability={availability} />
        <BookingList bookings={bookings} />
      </div>
    </div>
  );
}
