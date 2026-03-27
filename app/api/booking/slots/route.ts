import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api";
import { db } from "@/lib/db";
import { generateAvailabilityWindow } from "@/lib/slots";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.toLowerCase();
    const daysParam = searchParams.get("days");
    const fromParam = searchParams.get("from");

    if (!username) {
      return NextResponse.json({ error: "Username is required." }, { status: 400 });
    }

    const days = Math.min(Math.max(Number(daysParam ?? "7"), 1), 14);
    const from = fromParam ? new Date(fromParam) : new Date();
    from.setUTCHours(0, 0, 0, 0);

    const host = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        availability: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!host) {
      return NextResponse.json({ error: "Host not found." }, { status: 404 });
    }

    const bookingWindowEnd = new Date(from);
    bookingWindowEnd.setUTCDate(bookingWindowEnd.getUTCDate() + days);

    const bookings = await db.booking.findMany({
      where: {
        hostId: host.id,
        startTime: {
          gte: from,
          lt: bookingWindowEnd,
        },
      },
      orderBy: { startTime: "asc" },
    });

    const availabilityWindow = generateAvailabilityWindow({
      availability: host.availability,
      bookings,
      from,
      days,
    });

    return NextResponse.json({
      host: {
        name: host.name,
        username: host.username,
      },
      days: availabilityWindow,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
