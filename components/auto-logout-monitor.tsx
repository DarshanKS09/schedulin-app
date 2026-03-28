"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { SESSION_DURATION_MS, SESSION_EXPIRY_COOKIE, getSessionExpiredRedirectPath } from "@/lib/session";

const LAST_ACTIVITY_KEY = "echo_last_activity_at";
const SKIP_EXIT_LOGOUT_KEY = "echo_skip_exit_logout_once";
const CHECK_INTERVAL_MS = 15 * 1000;

function getLastActivity() {
  const saved = window.localStorage.getItem(LAST_ACTIVITY_KEY);
  const parsed = saved ? Number(saved) : Date.now();

  return Number.isFinite(parsed) ? parsed : Date.now();
}

function getSessionExpiry() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_EXPIRY_COOKIE}=([^;]+)`));
  const parsed = match ? Number(decodeURIComponent(match[1])) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

export function AutoLogoutMonitor() {
  const router = useRouter();
  const pathname = usePathname();
  const loggingOutRef = useRef(false);

  useEffect(() => {
    function recordActivity() {
      window.localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    }

    function sendLogoutBeacon() {
      if (loggingOutRef.current) {
        return;
      }

      if (window.sessionStorage.getItem(SKIP_EXIT_LOGOUT_KEY) === "1") {
        window.sessionStorage.removeItem(SKIP_EXIT_LOGOUT_KEY);
        return;
      }

      loggingOutRef.current = true;
      window.localStorage.removeItem(LAST_ACTIVITY_KEY);

      const payload = new Blob([JSON.stringify({ reason: "page_exit" })], {
        type: "application/json",
      });

      navigator.sendBeacon("/api/auth/logout", payload);
    }

    async function forceLogout(reason: "expired" | "inactive") {
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
        router.replace(
          reason === "expired" || reason === "inactive"
            ? (getSessionExpiredRedirectPath(pathname || "/dashboard") as Route)
            : `/auth/login?next=${encodeURIComponent(pathname || "/dashboard")}`,
        );
        router.refresh();
      }
    }

    function checkInactivity() {
      const expiresAt = getSessionExpiry();
      if (expiresAt !== null && Date.now() >= expiresAt) {
        void forceLogout("expired");
        return;
      }

      const elapsed = Date.now() - getLastActivity();

      if (elapsed >= SESSION_DURATION_MS) {
        void forceLogout("inactive");
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

    function handlePageHide() {
      sendLogoutBeacon();
    }

    const activityEvents: Array<keyof WindowEventMap> = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "focus"];

    recordActivity();
    checkInactivity();

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, recordActivity, { passive: true });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("pagehide", handlePageHide);

    const interval = window.setInterval(checkInactivity, CHECK_INTERVAL_MS);

    return () => {
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, recordActivity);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pagehide", handlePageHide);
      window.clearInterval(interval);
    };
  }, [pathname, router]);

  return null;
}

export { SKIP_EXIT_LOGOUT_KEY };
