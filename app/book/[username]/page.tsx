import { notFound } from "next/navigation";

import { BookingPageClient } from "@/components/booking-page-client";
import { db } from "@/lib/db";
import { generateAvailabilityWindow } from "@/lib/slots";

export default async function PublicBookingPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const host = await db.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      availability: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!host) {
    notFound();
  }

  const from = new Date();
  from.setUTCHours(0, 0, 0, 0);

  const bookings = await db.booking.findMany({
    where: {
      hostId: host.id,
      startTime: {
        gte: from,
      },
    },
    orderBy: { startTime: "asc" },
  });

  const days = generateAvailabilityWindow({
    availability: host.availability,
    bookings,
    from,
    days: 7,
  });

  return <BookingPageClient username={host.username} hostName={host.name} initialDays={days} />;
}
