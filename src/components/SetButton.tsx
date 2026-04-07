import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
};

export function SetButton({
  title,
  subtitle,
  onClick,
  icon,
  disabled,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "cursor-pointer flex w-full items-center gap-4 rounded-3xl border px-4 py-3 text-left shadow-xl shadow-slate-200/40 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] sm:px-6 sm:py-4 dark:shadow-black/30",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
          : "border-violet-200 bg-violet-50/90 text-slate-800 hover:bg-violet-100 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-slate-100 dark:hover:bg-violet-900/35"
      )}
    >
      {disabled && <Lock className="h-4 w-4 shrink-0 text-slate-400" />}
      {icon && !disabled && (
        <span className="shrink-0 text-[var(--color-primary)]">{icon}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold sm:text-lg">{title}</span>
        {subtitle && (
          <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">
            {subtitle}
          </span>
        )}
      </span>
    </button>
  );
}
