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
        variant === "primary" && "bg-[#4285F4] text-white shadow-[0_12px_24px_rgba(66,133,244,0.28)] hover:-translate-y-0.5 hover:bg-[#3b78e7]",
        variant === "secondary" && "bg-[#34A853] text-white shadow-[0_12px_24px_rgba(52,168,83,0.24)] hover:-translate-y-0.5 hover:bg-[#2d9549]",
        variant === "ghost" && "bg-white/80 text-ink ring-1 ring-[rgba(66,133,244,0.14)] hover:-translate-y-0.5 hover:bg-[#F8FAFF]",
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
