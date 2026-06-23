"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./Progress";

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string; positive?: boolean };
  progress?: { value: number; max?: number; variant?: "default" | "brand" | "success" | "warning" };
  variant?: "default" | "highlight" | "compact";
}

const variantStyles = {
  default: "bg-zinc-900/50 border border-zinc-800/50",
  highlight: "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20",
  compact: "bg-zinc-900/50 border border-zinc-800/50 p-4",
};

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      label,
      value,
      sub,
      icon,
      trend,
      progress,
      variant = "default",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("rounded-2xl transition-all duration-200", variantStyles[variant], className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-medium uppercase tracking-wider text-zinc-600">
              {label}
            </p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-zinc-100 tabular-nums">{value}</p>
              {icon && <span className="mt-1 shrink-0 text-zinc-500">{icon}</span>}
            </div>
            {sub && <p className="mt-1 text-[0.7rem] text-zinc-500">{sub}</p>}
          </div>
          {progress && (
            <ProgressRing
              value={progress.value}
              max={progress.max}
              size={48}
              strokeWidth={3}
              variant={progress.variant}
              showLabel={true}
            />
          )}
        </div>
        {(trend || children) && (
          <div className="mt-4 flex items-center justify-between border-t border-zinc-800/50 pt-3">
            {trend && (
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  trend.positive !== false ? "text-emerald-400" : "text-red-400"
                )}
              >
                {trend.positive !== false ? "↑" : "↓"} {trend.value}{trend.label && ` ${trend.label}`}
              </span>
            )}
            {children && <div className="flex items-center gap-2">{children}</div>}
          </div>
        )}
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

export interface MetricCardProps extends Omit<StatCardProps, "variant"> {
  accentColor?: "emerald" | "amber" | "blue" | "rose" | "cyan" | "purple";
}

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      label,
      value,
      sub,
      icon,
      accentColor = "emerald",
      className,
      ...props
    },
    ref
  ) => {
    const accentClasses = {
      emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-5 border transition-all duration-200 hover:border-opacity-50",
          accentClasses[accentColor],
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-wider text-zinc-600">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold text-zinc-100 tabular-nums">{value}</p>
            {sub && <p className="mt-1 text-sm text-zinc-500">{sub}</p>}
          </div>
          {icon && (
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", accentClasses[accentColor].replace("text-", "bg-").replace("border-", ""))}>
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

MetricCard.displayName = "MetricCard";