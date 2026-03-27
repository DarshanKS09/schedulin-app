"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Slot = {
  startTime: string;
  endTime: string;
};

type DayGroup = {
  date: string;
  slots: Slot[];
};

function isFutureSlot(slot: Slot) {
  return new Date(slot.startTime).getTime() > Date.now();
}

function formatDayLabel(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function formatDayNumber(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
  }).format(new Date(date));
}

function formatWeekday(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  }).format(new Date(date));
}

function formatSlotTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getTimezoneLabel() {
  const parts = new Intl.DateTimeFormat(undefined, {
    timeZoneName: "short",
  }).formatToParts(new Date());

  return parts.find((part) => part.type === "timeZoneName")?.value ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function SlotSkeletons() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-full border border-indigo-100 bg-gradient-to-r from-white via-indigo-50 to-white"
        />
      ))}
    </div>
  );
}

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
  const [selectedDate, setSelectedDate] = useState<string | null>(
    initialDays.find((day) => day.slots.some(isFutureSlot))?.date ?? null,
  );
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmedSlot, setConfirmedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [bookingState, setBookingState] = useState<"idle" | "success">("idle");

  const timezoneLabel = useMemo(() => getTimezoneLabel(), []);

  useEffect(() => {
    const timer = window.setTimeout(() => setSlotsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const availableDays = useMemo(
    () =>
      days
        .map((day) => ({
          ...day,
          slots: day.slots.filter(isFutureSlot),
        }))
        .filter((day) => day.slots.length > 0),
    [days],
  );

  const activeDay = useMemo(
    () => availableDays.find((day) => day.date === selectedDate) ?? availableDays[0] ?? null,
    [availableDays, selectedDate],
  );

  useEffect(() => {
    if (!availableDays.length) {
      setSelectedDate(null);
      setSelectedSlot(null);
      return;
    }

    if (!activeDay) {
      setSelectedDate(availableDays[0].date);
      return;
    }

    if (selectedSlot && !activeDay.slots.some((slot) => slot.startTime === selectedSlot.startTime)) {
      setSelectedSlot(null);
    }
  }, [activeDay, availableDays, selectedSlot]);

  async function refreshSlots() {
    setSlotsLoading(true);

    try {
      const response = await fetch(`/api/booking/slots?username=${encodeURIComponent(username)}`);
      const result = await response.json();

      if (response.ok) {
        setDays(result.days);
      }
    } finally {
      window.setTimeout(() => setSlotsLoading(false), 300);
    }
  }

  async function handleBooking(formData: FormData) {
    if (!selectedSlot) {
      setMessage("Choose a time slot before continuing.");
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
      setConfirmedSlot(selectedSlot);
      setSelectedSlot(null);
      setMessage("Booking confirmed.");
      await refreshSlots();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to complete booking.");
    } finally {
      setLoading(false);
    }
  }

  function resetSuccessState() {
    setBookingState("idle");
    setConfirmedSlot(null);
    setMessage(null);
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full max-w-5xl flex-col gap-8"
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-[1px] shadow-[0_24px_80px_rgba(99,102,241,0.22)]">
        <Card className="rounded-[31px] border-0 bg-white/88 px-6 py-8 backdrop-blur-xl sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600">
                Public Booking Page
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--ink-strong)] sm:text-5xl">
                Meet with {hostName}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Choose a date, pick a time, and send your booking request. This page is for guests booking time with {hostName}, not for managing host settings.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
              <div className="rounded-3xl bg-indigo-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">Timezone</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{timezoneLabel}</p>
              </div>
              <div className="rounded-3xl bg-violet-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">Experience</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">Guest booking flow</p>
              </div>
              <div className="rounded-3xl bg-fuchsia-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-600">Availability</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {availableDays.length ? `${availableDays.length} open day${availableDays.length === 1 ? "" : "s"}` : "No open days"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <motion.div
          transition={{ duration: 0.35, delay: 0.05 }}
          whileHover={{ y: -4, boxShadow: "0 22px 50px rgba(99,102,241,0.12)" }}
        >
          <Card className="rounded-[28px] border border-indigo-100 bg-white/80 p-6">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Select Date</p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ink-strong)]">Choose a day</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {days.map((day) => {
                const enabledSlots = day.slots.filter(isFutureSlot);
                const isDisabled = enabledSlots.length === 0;
                const isSelected = activeDay?.date === day.date;

                return (
                  <motion.button
                    key={day.date}
                    className={`rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-transparent bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg"
                        : isDisabled
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                          : "border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-lg"
                    }`}
                    disabled={isDisabled}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setSelectedSlot(null);
                    }}
                    type="button"
                    whileTap={isDisabled ? undefined : { scale: 0.97 }}
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">{formatWeekday(day.date)}</div>
                    <div className="mt-2 text-2xl font-semibold">{formatDayNumber(day.date)}</div>
                    <div className="mt-2 text-xs">{formatDayLabel(day.date)}</div>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div
          transition={{ duration: 0.35, delay: 0.1 }}
          whileHover={{ y: -4, boxShadow: "0 22px 50px rgba(99,102,241,0.12)" }}
        >
          <Card className="rounded-[28px] border border-indigo-100 bg-white/84 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-600">Time Slots</p>
                <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ink-strong)]">
                  {activeDay ? formatDayLabel(activeDay.date) : "No available date"}
                </h2>
              </div>
              <p className="text-sm text-slate-500">Times shown in {timezoneLabel}</p>
            </div>

            <div className="mt-6">
              {slotsLoading ? (
                <SlotSkeletons />
              ) : activeDay?.slots.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {activeDay.slots.map((slot) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;

                    return (
                      <motion.button
                        key={slot.startTime}
                        animate={isSelected ? { scale: [1, 0.95, 1.03, 1] } : { scale: 1 }}
                        className={`rounded-full border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                          isSelected
                            ? "border-transparent bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg"
                            : "border-slate-200 bg-white text-slate-700 hover:scale-105 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md"
                        }`}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setBookingState("idle");
                          setMessage(null);
                        }}
                        transition={{ duration: 0.28 }}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                      >
                        {formatSlotTime(slot.startTime)}
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  No open slots are available for this date.
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {bookingState === "success" && confirmedSlot ? (
                <motion.div
                  key="success"
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6"
                  initial={{ opacity: 0, y: 24 }}
                  transition={{ duration: 0.35 }}
                >
                  <motion.div
                    animate={{ scale: [0.85, 1.08, 1] }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg"
                    transition={{ duration: 0.45 }}
                  >
                    <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24">
                      <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                  </motion.div>
                  <h3 className="mt-4 text-center text-2xl font-semibold text-slate-900">Booking Confirmed!</h3>
                  <div className="mt-5 grid gap-3 rounded-3xl bg-white/90 p-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Date</p>
                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(confirmedSlot.startTime))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Time</p>
                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        {new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(new Date(confirmedSlot.startTime))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Timezone</p>
                      <p className="mt-2 text-sm font-semibold text-slate-800">{timezoneLabel}</p>
                    </div>
                  </div>
                  <Button className="mt-5 w-full sm:w-auto" onClick={resetSuccessState} type="button">
                    Done
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                  initial={{ opacity: 0, y: 24 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-5">
                    <h3 className="text-xl font-semibold text-[color:var(--ink-strong)]">Booking details</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedSlot
                        ? `Selected ${new Intl.DateTimeFormat(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(selectedSlot.startTime))} (${timezoneLabel})`
                        : "Choose a slot to see the booking form."}
                    </p>

                    <AnimatePresence>
                      {selectedSlot ? (
                        <motion.form
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-5 space-y-4"
                          initial={{ opacity: 0, y: 20 }}
                          onSubmit={async (event) => {
                            event.preventDefault();
                            await handleBooking(new FormData(event.currentTarget));
                          }}
                          transition={{ duration: 0.28 }}
                        >
                          <Input name="guestName" placeholder="Your name" required />
                          <Input name="guestEmail" type="email" placeholder="Your email" required />
                          <div className="sticky bottom-4 rounded-3xl bg-white/80 p-2 backdrop-blur sm:static sm:bg-transparent sm:p-0">
                            <Button className="w-full" type="submit" disabled={loading || !selectedSlot}>
                              {loading ? (
                                <span className="inline-flex items-center gap-2">
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                                  Confirming...
                                </span>
                              ) : (
                                "Confirm booking"
                              )}
                            </Button>
                          </div>
                        </motion.form>
                      ) : null}
                    </AnimatePresence>

                    {message && bookingState !== "success" ? (
                      <p className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p>
                    ) : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
