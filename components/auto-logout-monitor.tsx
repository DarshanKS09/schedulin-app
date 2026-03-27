"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const LAST_ACTIVITY_KEY = "echo_last_activity_at";
const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 15 * 1000;

function getLastActivity() {
  const saved = window.localStorage.getItem(LAST_ACTIVITY_KEY);
  const parsed = saved ? Number(saved) : Date.now();

  return Number.isFinite(parsed) ? parsed : Date.now();
}

export function AutoLogoutMonitor() {
  const router = useRouter();
  const pathname = usePathname();
  const loggingOutRef = useRef(false);

  useEffect(() => {
    function recordActivity() {
      window.localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    }

    async function forceLogout() {
      if (loggingOutRef.current) {
        return;
      }

      loggingOutRef.current = true;

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
        });
      } finally {
        window.localStorage.removeItem(LAST_ACTIVITY_KEY);
        router.replace(`/auth/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
        router.refresh();
      }
    }

    function checkInactivity() {
      const elapsed = Date.now() - getLastActivity();

      if (elapsed >= INACTIVITY_LIMIT_MS) {
        void forceLogout();
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        checkInactivity();
        if (!loggingOutRef.current) {
          recordActivity();
        }
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === LAST_ACTIVITY_KEY) {
        checkInactivity();
      }
    }

    const activityEvents: Array<keyof WindowEventMap> = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "focus"];

    recordActivity();
    checkInactivity();

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, recordActivity, { passive: true });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorage);

    const interval = window.setInterval(checkInactivity, CHECK_INTERVAL_MS);

    return () => {
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, recordActivity);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(interval);
    };
  }, [pathname, router]);

  return null;
}
