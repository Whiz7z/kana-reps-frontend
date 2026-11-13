import { useId } from "react";
import { cn } from "@/lib/utils";

type Variant = "light" | "dark";

const stops: Record<Variant, readonly [string, string, string]> = {
  light: ["#d9552a", "#b13a2f", "#7a1f1a"],
  dark: ["#c4b5fd", "#a78bfa", "#8b5cf6"],
};

const ink: Record<Variant, string> = {
  light: "#fffdf7",
  dark: "#0f0f14",
};

type Props = {
  className?: string;
  variant?: Variant;
};

export function LogoMark({ className, variant = "light" }: Props) {
  const id = useId();
  const [from, mid, to] = stops[variant];

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-8 w-8 shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset=".55" stopColor={mid} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="19" fill={`url(#${id})`} />
      <g
        fontWeight="700"
        fontSize="72"
        textAnchor="middle"
        fill={ink[variant]}
      >
        <text x="60" y="80" opacity=".11">
          か
        </text>
        <text x="55" y="75" opacity=".25">
          か
        </text>
        <text x="47" y="67">
          か
        </text>
      </g>
    </svg>
  );
}
