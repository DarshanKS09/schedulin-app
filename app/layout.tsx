import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";

import { getSessionFromCookies } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Echo Scheduler",
  description: "A production-ready scheduling platform built with Next.js, Prisma, PostgreSQL, and Google Calendar.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSessionFromCookies();

  return (
    <html lang="en">
      <body className={geist.variable}>
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          <header className="animate-fade-up mb-8">
            <div className="glass-panel mx-auto flex flex-col gap-4 rounded-[28px] px-5 py-4 shadow-[0_20px_80px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Link className="inline-flex items-center gap-3" href="/">
                  <span className="pulse-soft inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-sm font-bold tracking-[0.24em] text-white">
                    ES
                  </span>
                  <span>
                    <span className="block text-base font-semibold tracking-tight text-[color:var(--ink-strong)]">
                      Echo Scheduler
                    </span>
                    <span className="block text-xs uppercase tracking-[0.28em] text-slate-500">
                      Booking operations cockpit
                    </span>
                  </span>
                </Link>
              </div>

              <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <Link className="rounded-full px-4 py-2 hover:bg-white/70 hover:text-ink" href="/">
                  Home
                </Link>
                {session ? (
                  <>
                    <Link className="rounded-full bg-[#4285F4] px-4 py-2 font-medium text-white shadow-[0_12px_24px_rgba(66,133,244,0.22)] hover:bg-[#3b78e7]" href="/dashboard">
                      Dashboard
                    </Link>
                    <LogoutButton className="rounded-full" />
                  </>
                ) : (
                  <>
                    <Link className="rounded-full px-4 py-2 hover:bg-white/70 hover:text-ink" href="/auth/login">
                      Login
                    </Link>
                    <Link className="rounded-full bg-[#4285F4] px-4 py-2 font-medium text-white shadow-[0_12px_24px_rgba(66,133,244,0.22)] hover:bg-[#3b78e7]" href="/auth/register">
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>

          <main className="flex-1 pb-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
