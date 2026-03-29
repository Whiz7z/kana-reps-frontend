import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "muted" | "outline" | "ghost";
type Size = "default" | "sm" | "icon" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-500/40 disabled:opacity-40",
  secondary:
    "border-2 border-indigo-100 bg-white text-indigo-900 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/80 disabled:opacity-40",
  muted:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40",
  outline:
    "border-2 border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/60 disabled:opacity-40",
  ghost:
    "bg-transparent text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-40",
};

const sizeStyles: Record<Size, string> = {
  default: "rounded-xl px-4 py-2.5 text-sm font-semibold",
  sm: "rounded-lg px-3 py-1.5 text-xs font-semibold",
  icon: "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-0 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/60",
  lg: "h-14 rounded-2xl px-8 text-lg font-semibold",
};

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
        "cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fef9f3]",
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
