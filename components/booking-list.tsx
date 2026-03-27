import type { Booking } from "@prisma/client";

import { Card } from "@/components/ui/card";

export function BookingList({
  bookings,
  googleCalendarConnected,
}: {
  bookings: Booking[];
  googleCalendarConnected: boolean;
}) {
  return (
    <Card className="animate-fade-up-delay border-[rgba(251,188,5,0.16)] bg-gradient-to-b from-white to-[#FFF9E8]">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-ink">Upcoming guest bookings</h2>
        <p className="mt-1 text-sm text-slate-600">These are meetings guests booked with you from your public booking page.</p>
      </div>

      <div className="space-y-3">
        {bookings.length ? (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col gap-2 rounded-3xl border border-[rgba(251,188,5,0.18)] bg-white/90 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-ink">{booking.guestName}</p>
                <p className="text-sm text-slate-600">{booking.guestEmail}</p>
              </div>
              <div className="flex flex-col items-start gap-3 text-sm text-slate-600 md:items-end">
                <div>
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(booking.startTime))}
                </div>
                {googleCalendarConnected && booking.googleEventId ? (
                  <a
                    className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50"
                    href={`/api/google/events/${booking.googleEventId}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    View on calendar
                  </a>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-600">No upcoming bookings yet.</p>
        )}
      </div>
    </Card>
  );
}
