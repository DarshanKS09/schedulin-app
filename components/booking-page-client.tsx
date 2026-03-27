"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type DayGroup = {
  date: string;
  slots: Array<{
    startTime: string;
    endTime: string;
  }>;
};

export function BookingPageClient({
  username,
  hostName,
  initialDays,
}: {
  username: string;
  hostName: string;
  initialDays: DayGroup[];
}) {
  const [days, setDays] = useState(initialDays);
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [bookingState, setBookingState] = useState<"idle" | "success">("idle");

  const availableDays = useMemo(() => days.filter((day) => day.slots.length > 0), [days]);

  async function refreshSlots() {
    const response = await fetch(`/api/booking/slots?username=${encodeURIComponent(username)}`);
    const result = await response.json();

    if (response.ok) {
      setDays(result.days);
    }
  }

  async function handleBooking(formData: FormData) {
    if (!selectedSlot) {
      setMessage("Pick a time before submitting.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          guestName: String(formData.get("guestName") || ""),
          guestEmail: String(formData.get("guestEmail") || ""),
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to book that slot.");
      }

      setBookingState("success");
      setSelectedSlot(null);
      setMessage("Booking confirmed. A calendar event was created when Google Calendar is connected.");
      await refreshSlots();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to complete booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <div className="mb-5">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand">Book a time</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Meet with {hostName}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Times are displayed in your local timezone using your browser settings.
          </p>
        </div>

        <div className="space-y-5">
          {availableDays.length ? (
            availableDays.map((day) => (
              <div key={day.date}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {new Intl.DateTimeFormat(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  }).format(new Date(day.date))}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {day.slots.map((slot) => {
                    const isActive = selectedSlot?.startTime === slot.startTime;

                    return (
                      <button
                        key={slot.startTime}
                        className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                          isActive
                            ? "border-brand bg-teal-50 text-brand"
                            : "border-slate-200 bg-white text-ink hover:border-brand/40"
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                        type="button"
                      >
                        {new Intl.DateTimeFormat(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(slot.startTime))}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No open slots are available in the next week.</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-ink">Booking details</h2>
        <p className="mt-1 text-sm text-slate-600">
          {selectedSlot
            ? `Selected: ${new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(selectedSlot.startTime))}`
            : "Choose a slot to continue."}
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await handleBooking(new FormData(event.currentTarget));
          }}
        >
          <Input name="guestName" placeholder="Your name" required />
          <Input name="guestEmail" type="email" placeholder="Your email" required />
          <Button className="w-full" type="submit" disabled={loading || !selectedSlot}>
            {loading ? "Confirming..." : "Confirm booking"}
          </Button>
        </form>

        {message ? (
          <p className={`mt-4 text-sm ${bookingState === "success" ? "text-brand" : "text-rose-600"}`}>{message}</p>
        ) : null}
      </Card>
    </div>
  );
}
