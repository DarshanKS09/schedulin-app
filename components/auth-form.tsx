"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

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

      const nextPath = searchParams.get("next");
      const destination = nextPath?.startsWith("/") ? nextPath : "/dashboard";
      router.push(destination as Route);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to continue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand">
          {mode === "register" ? "Create account" : "Welcome back"}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          {mode === "register" ? "Start taking bookings" : "Sign in to your dashboard"}
        </h1>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" ? <Input name="name" placeholder="Full name" required /> : null}
        {mode === "register" ? <Input name="username" placeholder="Username" required /> : null}
        <Input name="email" type="email" placeholder="Email address" required />
        <Input name="password" type="password" placeholder="Password" required />

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

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
  );
}
