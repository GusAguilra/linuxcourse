"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "brand" | "outline";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  icon?: ReactNode;
}

const baseStyles = "inline-flex items-center gap-1.5 font-medium rounded-full transition-colors";

const variantStyles = {
  default: "bg-zinc-800 text-zinc-300 border border-zinc-700",
  success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  error: "bg-red-500/15 text-red-400 border border-red-500/30",
  info: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  brand: "bg-emerald-500 text-zinc-950",
  outline: "bg-transparent text-zinc-400 border border-zinc-700 hover:border-zinc-600 hover:text-zinc-300",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[0.65rem] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      size = "md",
      dot = false,
      icon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full flex-shrink-0",
              variant === "success" && "bg-emerald-400",
              variant === "warning" && "bg-amber-400",
              variant === "error" && "bg-red-400",
              variant === "info" && "bg-blue-400",
              variant === "brand" && "bg-zinc-950",
              variant === "default" && "bg-zinc-500",
              variant === "outline" && "bg-zinc-600"
            )}
            aria-hidden="true"
          />
        )}
        {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
        <span>{children}</span>
      </span>
    );
  }
);

Badge.displayName = "Badge";

export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: "completed" | "in-progress" | "locked" | "available" | "failed";
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, size = "md", className, children, ...props }, ref) => {
    const variantMap = {
      completed: "success" as const,
      "in-progress": "warning" as const,
      locked: "default" as const,
      available: "info" as const,
      failed: "error" as const,
    };

    const labelMap = {
      completed: "Completado",
      "in-progress": "En progreso",
      locked: "Bloqueado",
      available: "Disponible",
      failed: "Fallido",
    };

    return (
      <Badge
        ref={ref}
        variant={variantMap[status]}
        size={size}
        dot={true}
        className={className}
        {...props}
      >
        {children || labelMap[status]}
      </Badge>
    );
  }
);

StatusBadge.displayName = "StatusBadge";