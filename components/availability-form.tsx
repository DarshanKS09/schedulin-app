"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTimeLabel } from "@/lib/utils";

type AvailabilityItem = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AvailabilityForm({ initialAvailability }: { initialAvailability: AvailabilityItem[] }) {
  const [availability, setAvailability] = useState<AvailabilityItem[]>(
    initialAvailability.length
      ? initialAvailability
      : [
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
        ],
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const grouped = useMemo(
    () => dayNames.map((name, index) => ({ name, index, items: availability.filter((item) => item.dayOfWeek === index) })),
    [availability],
  );

  function updateItem(index: number, patch: Partial<AvailabilityItem>) {
    setAvailability((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function addDay(dayOfWeek: number) {
    setAvailability((current) => [...current, { dayOfWeek, startTime: "09:00", endTime: "17:00" }]);
  }

  function removeItem(index: number) {
    setAvailability((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function saveAvailability() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availability }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to save availability.");
      }

      setAvailability(result.availability);
      setMessage("Availability updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save availability.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="animate-fade-up-delay border-[rgba(66,133,244,0.12)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">Host availability settings</h2>
          <p className="mt-1 text-sm text-slate-600">
            This is your internal dashboard area. Set the windows guests can book from your public page.
          </p>
        </div>
        <Button variant="secondary" onClick={saveAvailability} disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </div>

      <div className="space-y-4">
        {grouped.map((group) => (
          <div key={group.index} className="rounded-3xl border border-[rgba(66,133,244,0.12)] bg-white/90 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-ink">{group.name}</h3>
                <p className="text-sm text-slate-500">
                  {group.items.length ? `${group.items.length} window(s)` : "No availability yet"}
                </p>
              </div>
              <Button variant="ghost" onClick={() => addDay(group.index)}>
                Add window
              </Button>
            </div>

            <div className="space-y-3">
              {availability.map((item, index) =>
                item.dayOfWeek === group.index ? (
                  <div key={`${group.index}-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                        Start
                      </label>
                      <Input
                        type="time"
                        value={item.startTime}
                        onChange={(event) => updateItem(index, { startTime: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                        End
                      </label>
                      <Input
                        type="time"
                        value={item.endTime}
                        onChange={(event) => updateItem(index, { endTime: event.target.value })}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => removeItem(index)}>
                        Remove
                      </Button>
                      <span className="hidden text-xs text-slate-500 md:inline">
                        {formatTimeLabel(item.startTime)} - {formatTimeLabel(item.endTime)}
                      </span>
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        ))}
      </div>

      {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
    </Card>
  );
}
