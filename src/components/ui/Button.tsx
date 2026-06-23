"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "brand";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-180 ease-out rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none active:scale-[0.98]";

const variantStyles = {
  primary:
    "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 active:bg-emerald-600 shadow-[0_4px_14px_rgba(34,197,94,0.25)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.35)]",
  secondary:
    "bg-zinc-800/50 text-zinc-100 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 active:bg-zinc-900",
  ghost:
    "text-zinc-300 hover:bg-zinc-800/50 active:bg-zinc-800",
  danger:
    "bg-red-600/90 text-white hover:bg-red-500 active:bg-red-700 shadow-[0_4px_14px_rgba(239,68,68,0.25)]",
  outline:
    "border border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800/50 hover:border-zinc-600 active:bg-zinc-900/50",
  brand:
    "bg-gradient-to-r from-emerald-500 to-emerald-600 text-zinc-950 hover:from-emerald-400 hover:to-emerald-500 active:from-emerald-600 active:to-emerald-700 shadow-[0_4px_14px_rgba(34,197,94,0.3)]",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
  icon: "p-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
        ) : null}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";