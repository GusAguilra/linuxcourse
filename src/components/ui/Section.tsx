"use client";

import { type HTMLAttributes, type ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
  divider?: boolean;
  className?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ title, description, action, divider = false, className, children, ...props }, ref) => {
    return (
      <section ref={ref} className={cn("py-8", divider && "border-t border-zinc-800/50", className)} {...props}>
        {(title || description || action) && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              {title && (
                <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-zinc-500 max-w-2xl">{description}</p>
              )}
            </div>
            {action && <div className="mt-4 sm:mt-0 shrink-0">{action}</div>}
          </div>
        )}
        <div>{children}</div>
      </section>
    );
  }
);

Section.displayName = "Section";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = "lg", className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mx-auto px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  )
);

Container.displayName = "Container";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  direction?: "vertical" | "horizontal";
  wrap?: boolean;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  className?: string;
}

const gapClasses = {
  xs: "gap-1",
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({
    gap = "md",
    direction = "vertical",
    wrap = false,
    align = "stretch",
    justify = "start",
    className,
    children,
    ...props
  }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        wrap && "flex-wrap",
        `items-${align}`,
        `justify-${justify}`,
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Stack.displayName = "Stack";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  colsSm?: 1 | 2 | 3 | 4 | 5 | 6;
  colsMd?: 1 | 2 | 3 | 4 | 5 | 6;
  colsLg?: 1 | 2 | 3 | 4 | 5 | 6;
  colsXl?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({
    cols = 1,
    colsSm,
    colsMd,
    colsLg,
    colsXl,
    gap = "md",
    className,
    children,
    ...props
  }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid",
        gridCols[cols],
        colsSm && `sm:${gridCols[colsSm]}`,
        colsMd && `md:${gridCols[colsMd]}`,
        colsLg && `lg:${gridCols[colsLg]}`,
        colsXl && `xl:${gridCols[colsXl]}`,
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Grid.displayName = "Grid";