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
    <div className="space-y-8">
      <Card className="animate-fade-up overflow-hidden rounded-[32px] border-[rgba(66,133,244,0.14)] bg-gradient-to-br from-[#E8F0FE] via-white to-[#E6F4EA]">
        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#4285F4] ring-1 ring-[rgba(66,133,244,0.14)]">
              Guest booking page
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[color:var(--ink-strong)] sm:text-5xl">
              Book time with {hostName}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              You are on {hostName}&apos;s public booking page. Pick a time that works for you and submit your details to request a meeting.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                Public page for guests
              </span>
              <span className="rounded-full bg-[#FEF7E0] px-4 py-2 text-sm font-medium text-[#B06000] ring-1 ring-[rgba(251,188,5,0.28)]">
                Not your host dashboard
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-[rgba(66,133,244,0.1)]">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#4285F4]">Step 1</p>
              <p className="mt-2 text-sm font-semibold text-ink">Choose an available slot</p>
            </div>
            <div className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-[rgba(52,168,83,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#34A853]">Step 2</p>
              <p className="mt-2 text-sm font-semibold text-ink">Enter your name and email</p>
            </div>
            <div className="rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-[rgba(234,67,53,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#EA4335]">Step 3</p>
              <p className="mt-2 text-sm font-semibold text-ink">Send the booking request</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="animate-fade-up-delay">
          <div className="mb-5">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#4285F4]">Available times</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Pick a slot for your meeting</h2>
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
                        className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition duration-200 ${
                          isActive
                            ? "border-[#4285F4] bg-[#E8F0FE] text-[#1A73E8] shadow-[0_10px_20px_rgba(66,133,244,0.16)]"
                            : "border-slate-200 bg-white text-ink hover:-translate-y-0.5 hover:border-[#4285F4]/40 hover:bg-[#F8FAFF]"
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

        <Card className="animate-fade-up-delay border-[rgba(52,168,83,0.12)] bg-gradient-to-b from-white to-[#F1F8F3]">
          <h2 className="text-xl font-semibold text-ink">Your booking details</h2>
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

          <div className="mt-5 rounded-2xl bg-white/85 p-4 ring-1 ring-[rgba(52,168,83,0.1)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#34A853]">Important</p>
            <p className="mt-2 text-sm text-slate-600">
              This page is for guests booking time with {hostName}. Hosts should use their dashboard to manage availability and bookings.
            </p>
          </div>

          {message ? (
            <p className={`mt-4 text-sm ${bookingState === "success" ? "text-[#1A7F37]" : "text-rose-600"}`}>{message}</p>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
