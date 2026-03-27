"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type LoaderDetail =
  | {
      type: "start";
      destination: string;
      label: string;
    }
  | {
      type: "resolved";
    }
  | {
      type: "error";
    };

type LoaderState = {
  active: boolean;
  resolved: boolean;
  destination: string | null;
  label: string;
};

const AUTH_LOADER_EVENT = "slotify-auth-loader";

export function AuthTransitionLoader() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<LoaderState>({
    active: false,
    resolved: false,
    destination: null,
    label: "Signing you in",
  });

  const percentage = useMemo(() => Math.round(progress), [progress]);

  useEffect(() => {
    function handleEvent(event: Event) {
      const customEvent = event as CustomEvent<LoaderDetail>;
      const detail = customEvent.detail;

      if (detail.type === "start") {
        setState({
          active: true,
          resolved: false,
          destination: detail.destination,
          label: detail.label,
        });
        setProgress(8);
        return;
      }

      if (detail.type === "resolved") {
        setState((current) => ({
          ...current,
          resolved: true,
        }));
        setProgress((current) => Math.max(current, 96));
        return;
      }

      setState((current) => ({
        ...current,
        active: false,
        resolved: false,
        destination: null,
      }));
      setProgress(0);
    }

    window.addEventListener(AUTH_LOADER_EVENT, handleEvent as EventListener);
    return () => window.removeEventListener(AUTH_LOADER_EVENT, handleEvent as EventListener);
  }, []);

  useEffect(() => {
    if (!state.active || state.resolved) {
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 94) {
          return current;
        }

        const increment = current < 35 ? 8 : current < 70 ? 4 : 1.5;
        return Math.min(current + increment, 94);
      });
    }, 140);

    return () => window.clearInterval(interval);
  }, [state.active, state.resolved]);

  useEffect(() => {
    if (!state.active || !state.resolved || !state.destination) {
      return;
    }

    if (pathname !== state.destination) {
      return;
    }

    setProgress(100);

    const timeout = window.setTimeout(() => {
      setState({
        active: false,
        resolved: false,
        destination: null,
        label: "Signing you in",
      });
      setProgress(0);
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [pathname, state]);

  if (!state.active) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100]">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white/92 px-4 py-3 shadow-[0_18px_48px_rgba(99,102,241,0.18)] backdrop-blur">
          <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
            <span>{state.label}</span>
            <span>{percentage}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-indigo-50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function dispatchAuthLoader(detail: LoaderDetail) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent<LoaderDetail>(AUTH_LOADER_EVENT, { detail }));
}
