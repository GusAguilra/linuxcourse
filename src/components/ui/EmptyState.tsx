"use client";

import { type ReactNode } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; href?: string; variant?: "primary" | "secondary" | "brand" };
  secondaryAction?: { label: string; onClick: () => void; href?: string };
  variant?: "default" | "centered" | "inline";
  className?: string;
}

const illustrations: Record<string, ReactNode> = {
  terminal: (
    <svg viewBox="0 0 120 120" className="w-24 h-24 text-zinc-700" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="15" width="100" height="90" rx="8" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="19" width="12" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="30" y="19" width="12" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="46" y="19" width="12" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <path d="M20 50h80M20 65h60M20 80h40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <path d="M20 95h30" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  modules: (
    <svg viewBox="0 0 120 120" className="w-24 h-24 text-zinc-700" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="20" width="90" height="80" rx="6" stroke="currentColor" strokeWidth="2"/>
      <rect x="20" y="25" width="80" height="12" rx="2" fill="currentColor" opacity="0.2"/>
      <rect x="20" y="45" width="60" height="8" rx="2" fill="currentColor" opacity="0.15"/>
      <rect x="20" y="60" width="70" height="8" rx="2" fill="currentColor" opacity="0.15"/>
      <rect x="20" y="75" width="40" height="8" rx="2" fill="currentColor" opacity="0.1"/>
      <circle cx="95" cy="31" r="6" fill="#22c55e" opacity="0.3"/>
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 120 120" className="w-24 h-24 text-zinc-700" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="45" stroke="currentColor" strokeWidth="3" opacity="0.2"/>
      <path d="M60 15a45 45 0 0 1 0 90" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
      <circle cx="60" cy="60" r="20" fill="#22c55e" opacity="0.15"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 120 120" className="w-24 h-24 text-zinc-700" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="3"/>
      <line x1="72" y1="72" x2="95" y2="95" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M38 50h24M50 38v24" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  achievement: (
    <svg viewBox="0 0 120 120" className="w-24 h-24 text-zinc-700" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 15L105 40V90L60 115L15 90V40Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M60 15V115M15 40L105 40M15 90L105 90" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
      <circle cx="60" cy="60" r="12" fill="#f59e0b" opacity="0.3"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 120 120" className="w-24 h-24 text-zinc-700" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="40" r="20" stroke="currentColor" strokeWidth="2"/>
      <path d="M60 60C32.4 60 10 82.4 10 110V110H110V110C110 82.4 87.6 60 60 60Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "centered",
  className,
}: EmptyStateProps) {
  const illustration = icon || illustrations.terminal;

  const baseClass = "transition-all duration-300";
  const variantClasses = {
    default: "py-12 px-6",
    centered: "flex min-h-[300px] flex-col items-center justify-center text-center py-16 px-6",
    inline: "py-8 px-6",
  };

  return (
    <Card variant="glass" padding="none" className={cn(baseClass, variantClasses[variant], className)}>
      <div className={cn("mx-auto mb-6 flex items-center justify-center", variant === "inline" && "mb-4")}>
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
          {illustration}
        </div>
      </div>
      <div className="mx-auto max-w-sm">
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{description}</p>
        )}
        {(action || secondaryAction) && (
          <div
            className={cn(
              "mt-6 flex items-center gap-3",
              variant === "centered" && "justify-center",
              variant === "inline" && "justify-start"
            )}
          >
            {action && (
              <Button
                variant={action.variant || "primary"}
                size="md"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="ghost" size="md" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export function EmptyStateIllustration({ name = "terminal", className }: { name?: keyof typeof illustrations; className?: string }) {
  return <div className={cn("text-zinc-700", className)}>{illustrations[name]}</div>;
}