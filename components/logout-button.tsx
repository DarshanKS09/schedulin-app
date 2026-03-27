"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/auth/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button className={cn(className)} variant="ghost" onClick={handleLogout} disabled={loading}>
      {loading ? "Signing out..." : "Logout"}
    </Button>
  );
}
