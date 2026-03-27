import type { Availability, Booking } from "@prisma/client";

const SLOT_DURATION_MINUTES = 30;

export type SlotResult = {
  startTime: string;
  endTime: string;
};

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function setUtcTimeForDay(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(date);
  next.setUTCHours(hours, minutes, 0, 0);
  return next;
}

function rangesOverlap(rangeStart: Date, rangeEnd: Date, bookingStart: Date, bookingEnd: Date) {
  return rangeStart < bookingEnd && bookingStart < rangeEnd;
}

export function validateAvailabilityRanges(availability: Availability[]) {
  for (const item of availability) {
    if (timeToMinutes(item.startTime) >= timeToMinutes(item.endTime)) {
      return `End time must be later than start time for day ${item.dayOfWeek}.`;
    }
  }

  const grouped = new Map<number, Availability[]>();

  for (const item of availability) {
    const items = grouped.get(item.dayOfWeek) ?? [];
    items.push(item);
    grouped.set(item.dayOfWeek, items);
  }

  for (const [dayOfWeek, items] of grouped.entries()) {
    const sorted = [...items].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];

      if (timeToMinutes(current.startTime) < timeToMinutes(previous.endTime)) {
        return `Availability windows overlap on day ${dayOfWeek}.`;
      }
    }
  }

  return null;
}

export function isSlotInsideAvailability(
  availability: Availability[],
  startTime: Date,
  endTime: Date,
) {
  const dayOfWeek = startTime.getUTCDay();

  return availability.some((item) => {
    if (item.dayOfWeek !== dayOfWeek) {
      return false;
    }

    const availableStart = setUtcTimeForDay(startTime, item.startTime);
    const availableEnd = setUtcTimeForDay(startTime, item.endTime);

    return startTime >= availableStart && endTime <= availableEnd;
  });
}

export function isSlotBooked(bookings: Booking[], startTime: Date, endTime: Date) {
  return bookings.some((booking) =>
    rangesOverlap(startTime, endTime, booking.startTime, booking.endTime),
  );
}

export function generateSlotsForDate({
  date,
  availability,
  bookings,
}: {
  date: Date;
  availability: Availability[];
  bookings: Booking[];
}) {
  const dayOfWeek = date.getUTCDay();
  const dayAvailability = availability.filter((item) => item.dayOfWeek === dayOfWeek);
  const now = new Date();
  const slots: SlotResult[] = [];

  for (const item of dayAvailability) {
    let cursor = setUtcTimeForDay(date, item.startTime);
    const rangeEnd = setUtcTimeForDay(date, item.endTime);

    while (cursor < rangeEnd) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

      if (slotEnd > rangeEnd) {
        break;
      }

      if (slotStart > now && !isSlotBooked(bookings, slotStart, slotEnd)) {
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
        });
      }

      cursor = slotEnd;
    }
  }

  return slots;
}

export function generateAvailabilityWindow({
  availability,
  bookings,
  from,
  days,
}: {
  availability: Availability[];
  bookings: Booking[];
  from: Date;
  days: number;
}) {
  const results: Array<{ date: string; slots: SlotResult[] }> = [];

  for (let offset = 0; offset < days; offset += 1) {
    const day = new Date(from);
    day.setUTCDate(from.getUTCDate() + offset);
    day.setUTCHours(0, 0, 0, 0);

    results.push({
      date: day.toISOString(),
      slots: generateSlotsForDate({
        date: day,
        availability,
        bookings,
      }),
    });
  }

  return results;
}
