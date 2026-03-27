import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Echo Scheduler",
  description: "A production-ready scheduling platform built with Next.js, Prisma, PostgreSQL, and Google Calendar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={geist.variable}>
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-10 flex items-center justify-between">
            <Link className="text-lg font-semibold tracking-tight text-ink" href="/">
              Echo Scheduler
            </Link>
            <nav className="flex items-center gap-3 text-sm text-slate-600">
              <Link className="hover:text-ink" href="/auth/login">
                Login
              </Link>
              <Link className="hover:text-ink" href="/auth/register">
                Register
              </Link>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
