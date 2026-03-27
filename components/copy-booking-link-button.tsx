"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CopyBookingLinkButton({ bookingUrl }: { bookingUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button className="min-w-[96px]" type="button" variant="ghost" onClick={handleCopy}>
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}
