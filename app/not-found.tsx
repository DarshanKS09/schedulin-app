import Link from "next/link";

import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-xl text-center">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand">Not found</p>
      <h1 className="mt-3 text-3xl font-bold text-ink">This page does not exist.</h1>
      <p className="mt-3 text-sm text-slate-600">The booking link may be incorrect, or the page may have been moved.</p>
      <Link className="mt-6 inline-flex rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white" href="/">
        Return home
      </Link>
    </Card>
  );
}
