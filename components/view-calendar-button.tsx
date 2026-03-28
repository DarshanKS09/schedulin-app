"use client";

import { useState } from "react";

import { getSessionExpiredRedirectPath } from "@/lib/session";

type ViewCalendarButtonProps = {
  eventId: string;
};

export function ViewCalendarButton({ eventId }: ViewCalendarButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/google/events/${eventId}?format=json`, {
        credentials: "same-origin",
      });

      if (response.status === 401) {
        const result = (await response.json()) as { code?: string };
        window.location.href = result.code === "SESSION_EXPIRED" ? getSessionExpiredRedirectPath("/dashboard") : "/auth/login?next=/dashboard";
        return;
      }

      if (!response.ok) {
        window.location.href = "/dashboard?google=error";
        return;
      }

      const data = (await response.json()) as { url?: string };

      if (!data.url) {
        window.location.href = "/dashboard?google=error";
        return;
      }

      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      window.location.href = "/dashboard?google=error";
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={isLoading}
      onClick={handleClick}
      type="button"
    >
      {isLoading ? "Opening..." : "View on calendar"}
    </button>
  );
}
