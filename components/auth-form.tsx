"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { dispatchAuthLoader } from "@/components/auth-transition-loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const nextPath = searchParams.get("next");
    const destination = nextPath?.startsWith("/") ? nextPath : "/dashboard";

    dispatchAuthLoader({
      type: "start",
      destination,
      label: mode === "register" ? "Creating your workspace" : "Signing you in",
    });

    const formData = new FormData(event.currentTarget);
    const payload =
      mode === "register"
        ? {
            name: String(formData.get("name") || ""),
            username: String(formData.get("username") || ""),
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
          }
        : {
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
          };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to continue.");
      }

      dispatchAuthLoader({ type: "resolved" });
      router.push(destination as Route);
      router.refresh();
    } catch (submitError) {
      dispatchAuthLoader({ type: "error" });
      setError(submitError instanceof Error ? submitError.message : "Unable to continue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div className="animate-fade-up max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand shadow-sm">
          Secure account access
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[color:var(--ink-strong)] sm:text-5xl">
          {mode === "register" ? "Create a polished booking workspace." : "Sign back in to manage your schedule."}
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
          {mode === "register"
            ? "Set up your profile, share your public booking page, and manage availability from a protected dashboard."
            : "Your dashboard stays private until you sign in, with access to bookings, availability, and Google Calendar controls."}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="glass-panel-strong rounded-3xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Private by default</p>
            <p className="mt-2 text-sm text-slate-600">Unauthorized visitors are redirected away from the dashboard.</p>
          </div>
          <div className="glass-panel-strong rounded-3xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Responsive workflow</p>
            <p className="mt-2 text-sm text-slate-600">A cleaner experience across laptop, tablet, and mobile layouts.</p>
          </div>
        </div>
      </div>

      <Card className="glass-panel-strong animate-fade-up-delay mx-auto w-full max-w-md rounded-[32px] border-white/70 p-7 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand">
          {mode === "register" ? "Create account" : "Welcome back"}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-ink">
            {mode === "register" ? "Start taking bookings" : "Sign in to your dashboard"}
          </h2>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" ? <Input name="name" placeholder="Full name" required /> : null}
          {mode === "register" ? <Input name="username" placeholder="Username" required /> : null}
          <Input name="email" type="email" placeholder="Email address" required />
          <Input name="password" type="password" placeholder="Password" required />

          {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading
              ? mode === "register"
                ? "Creating account..."
                : "Signing in..."
              : mode === "register"
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          {mode === "register" ? "Already have an account?" : "Need an account?"}{" "}
          <Link
            className="font-semibold text-brand hover:text-teal-700"
            href={mode === "register" ? "/auth/login" : "/auth/register"}
          >
            {mode === "register" ? "Sign in" : "Create one"}
          </Link>
        </p>
      </Card>
    </div>
  );
}
