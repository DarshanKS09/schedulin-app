import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api";
import { db } from "@/lib/db";
import { createGoogleCalendarEvent } from "@/lib/google";
import { generateMeetingDescription } from "@/lib/openai";
import { isSlotBooked, isSlotInsideAvailability } from "@/lib/slots";
import { bookingSchema } from "@/lib/validators";

const SLOT_DURATION_MS = 30 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = bookingSchema.parse(await request.json());
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);
    const durationMs = endTime.getTime() - startTime.getTime();

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || startTime >= endTime) {
      return NextResponse.json({ error: "Invalid booking time range." }, { status: 400 });
    }

    if (startTime <= new Date()) {
      return NextResponse.json({ error: "Past bookings are not allowed." }, { status: 400 });
    }

    if (durationMs !== SLOT_DURATION_MS) {
      return NextResponse.json({ error: "Bookings must be exactly 30 minutes long." }, { status: 400 });
    }

    const host = await db.user.findUnique({
      where: { username: body.username.toLowerCase() },
      include: {
        availability: true,
      },
    });

    if (!host) {
      return NextResponse.json({ error: "Host not found." }, { status: 404 });
    }

    if (host.email.toLowerCase() === body.guestEmail.toLowerCase()) {
      return NextResponse.json({ error: "Hosts cannot book time with themselves." }, { status: 400 });
    }

    if (!isSlotInsideAvailability(host.availability, startTime, endTime)) {
      return NextResponse.json({ error: "That slot is outside the host's availability." }, { status: 400 });
    }

    const title = `${body.guestName} <> ${host.name}`;
    const meetingNotes = await generateMeetingDescription({
      hostName: host.name,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });

    let booking;

    try {
      booking = await db.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const overlappingBookings = await tx.booking.findMany({
            where: {
              hostId: host.id,
              startTime: { lt: endTime },
              endTime: { gt: startTime },
            },
          });

          if (isSlotBooked(overlappingBookings, startTime, endTime)) {
            throw new Error("That slot has already been booked.");
          }

          return tx.booking.create({
            data: {
              hostId: host.id,
              guestName: body.guestName,
              guestEmail: body.guestEmail,
              startTime,
              endTime,
              meetingTitle: title,
              meetingNotes,
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (error instanceof Error && error.message === "That slot has already been booked.") {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      throw error;
    }

    try {
      const googleEventId = await createGoogleCalendarEvent({
        userId: host.id,
        hostEmail: host.email,
        calendarId: host.googleCalendarId,
        summary: title,
        description: meetingNotes,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        attendeeEmail: body.guestEmail,
      });

      if (googleEventId) {
        await db.booking.update({
          where: { id: booking.id },
          data: { googleEventId },
        });
      }
    } catch (calendarError) {
      console.error("Failed to create Google Calendar event", calendarError);
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        startTime: booking.startTime,
        endTime: booking.endTime,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return NextResponse.json(
        { error: "That slot was just booked by someone else. Please choose another time." },
        { status: 409 },
      );
    }

    return handleApiError(error);
  }
}
