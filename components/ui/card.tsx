import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("glass-panel-strong rounded-3xl border border-white/80 p-6 shadow-[0_18px_48px_rgba(66,133,244,0.08)] backdrop-blur", className)}
      {...props}
    />
  );
}
