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
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_12px_24px_rgba(99,102,241,0.28)] hover:scale-105 hover:shadow-md",
        variant === "secondary" && "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_12px_24px_rgba(139,92,246,0.24)] hover:scale-105 hover:shadow-md",
        variant === "ghost" && "bg-white/80 text-ink ring-1 ring-[rgba(99,102,241,0.14)] hover:scale-105 hover:bg-indigo-50 hover:shadow-md",
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
