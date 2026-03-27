"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function GoogleCalendarMenu({ connected }: { connected: boolean }) {
  const [open, setOpen] = useState(false);

  if (!connected) {
    return (
      <a href="/api/google/connect">
        <Button variant="ghost">Connect Google Calendar</Button>
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-label="Google Calendar controls"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#34A853] text-lg font-bold text-white shadow-[0_14px_28px_rgba(52,168,83,0.3)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#2d9549]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        G
      </button>

      {open ? (
        <div className="absolute right-0 top-14 z-20 w-64 rounded-3xl border border-[rgba(52,168,83,0.16)] bg-white/95 p-4 shadow-[0_24px_48px_rgba(23,50,83,0.16)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#34A853]">Google Calendar</p>
          <p className="mt-2 text-sm font-semibold text-ink">Connected and ready</p>
          <p className="mt-1 text-sm text-slate-600">Use this menu to switch accounts or disconnect calendar sync.</p>

          <div className="mt-4 flex flex-col gap-2">
            <a href="/api/google/connect">
              <Button className="w-full" type="button" variant="secondary">
                Switch account
              </Button>
            </a>
            <a href="/api/google/disconnect">
              <Button className="w-full" type="button" variant="ghost">
                Disconnect
              </Button>
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
