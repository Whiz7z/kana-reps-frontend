import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "muted" | "outline" | "ghost";
type Size = "default" | "sm" | "icon" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md hover:from-pink-600 hover:to-purple-600 disabled:opacity-40",
  secondary:
    "border border-purple-200 bg-white text-purple-800 shadow-sm hover:bg-purple-50 disabled:opacity-40",
  muted:
    "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40",
  outline:
    "border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-40",
  ghost:
    "bg-transparent text-purple-900 hover:bg-white/60 disabled:opacity-40",
};

const sizeStyles: Record<Size, string> = {
  default: "rounded-xl px-4 py-2.5 text-sm font-semibold",
  sm: "rounded-lg px-3 py-1.5 text-xs font-semibold",
  icon: "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white p-0 text-gray-700 hover:bg-gray-50",
  lg: "h-14 rounded-xl px-4 text-lg font-semibold",
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
        "cursor-pointer transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
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
