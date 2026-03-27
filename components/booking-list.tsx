import type { Booking } from "@prisma/client";

import { Card } from "@/components/ui/card";

export function BookingList({ bookings }: { bookings: Booking[] }) {
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
              <div className="text-sm text-slate-600">
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(booking.startTime))}
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
