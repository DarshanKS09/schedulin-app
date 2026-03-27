import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-ink text-white hover:bg-slate-800",
        variant === "secondary" && "bg-brand text-white hover:bg-teal-700",
        variant === "ghost" && "bg-white/70 text-ink ring-1 ring-slate-200 hover:bg-white",
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
