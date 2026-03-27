import { forwardRef, InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-ink shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
