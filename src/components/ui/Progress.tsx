"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  variant?: "default" | "brand" | "success" | "warning";
  animated?: boolean;
}

const sizeStyles = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const variantStyles = {
  default: "bg-emerald-500",
  brand: "bg-gradient-to-r from-emerald-500 to-emerald-600",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
};

const trackStyles = "bg-zinc-800 border border-zinc-700";

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      size = "md",
      showLabel = false,
      variant = "default",
      animated = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));

    return (
      <div className={cn("relative w-full", sizeStyles[size], "rounded-full overflow-hidden", trackStyles, className)} {...props}>
        <div
          ref={ref}
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantStyles[variant],
            animated && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={showLabel ? `${Math.round(percentage)}%` : undefined}
        >
          {showLabel && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[0.6rem] font-mono font-bold text-zinc-950">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
        {children}
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

export interface ProgressRingProps extends HTMLAttributes<SVGSVGElement> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "default" | "brand" | "success" | "warning";
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const variantStrokeStyles = {
  default: "stroke-emerald-500",
  brand: "stroke-emerald-500",
  success: "stroke-emerald-500",
  warning: "stroke-amber-500",
};

const trackStrokeStyles = "stroke-zinc-800";

export const ProgressRing = forwardRef<SVGSVGElement, ProgressRingProps>(
  (
    {
      value,
      max = 100,
      size = 64,
      strokeWidth = 4,
      variant = "default",
      showLabel = true,
      animated = false,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percentage / 100);

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn("transform -rotate-90", className)}
        role="img"
        aria-label={showLabel ? `${Math.round(percentage)}% completado` : undefined}
        {...props}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackStrokeStyles}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            variantStrokeStyles[variant],
            "transition-all duration-700 ease-out",
            animated && "animate-pulse"
          )}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
        {showLabel && (
          <text
            x={size / 2}
            y={size / 2}
            dominantBaseline="middle"
            textAnchor="middle"
            fontFamily="var(--font-geist-sans), system-ui"
            fontSize={size * 0.22}
            fontWeight={600}
            fill="#fafafa"
            className="pointer-events-none"
          >
            {Math.round(percentage)}%
          </text>
        )}
      </svg>
    );
  }
);

ProgressRing.displayName = "ProgressRing";