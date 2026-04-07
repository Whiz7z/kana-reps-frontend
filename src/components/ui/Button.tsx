import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "muted" | "outline" | "ghost";
type Size = "default" | "sm" | "icon" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white shadow-lg shadow-violet-500/20 hover:bg-[var(--color-primary-hover)] disabled:opacity-40 dark:shadow-violet-900/40",
  secondary:
    "border-2 border-indigo-100 bg-[var(--color-paper)] text-indigo-900 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/80 disabled:opacity-40 dark:border-white/15 dark:text-slate-100 dark:hover:border-white/25 dark:hover:bg-white/10",
  muted:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
  outline:
    "border-2 border-slate-200 bg-[var(--color-paper)] text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/60 disabled:opacity-40 dark:border-slate-600 dark:text-slate-100 dark:hover:border-[var(--color-primary)] dark:hover:bg-white/5",
  ghost:
    "bg-transparent text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-40 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-[var(--color-primary)]",
};

const sizeStyles: Record<Size, string> = {
  default: "rounded-xl px-4 py-2.5 text-sm font-semibold",
  sm: "rounded-lg px-3 py-1.5 text-xs font-semibold",
  icon: "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-[var(--color-paper)] p-0 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-[var(--color-primary)] dark:hover:bg-white/10",
  lg: "h-14 rounded-2xl px-8 text-lg font-semibold",
};

const ringOffset =
  "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ring-offset)]";

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "cursor-pointer transition",
        ringOffset,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
