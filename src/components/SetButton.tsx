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
        "cursor-pointer flex w-full items-center gap-4 rounded-3xl border px-4 py-3 text-left shadow-xl shadow-slate-200/40 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:px-6 sm:py-4",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-100"
          : "border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 text-slate-700 hover:from-indigo-100 hover:to-purple-100"
      )}
    >
      {disabled && <Lock className="h-4 w-4 shrink-0 text-slate-400" />}
      {icon && !disabled && (
        <span className="shrink-0 text-indigo-600">{icon}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold sm:text-lg">{title}</span>
        {subtitle && (
          <span className="mt-1 block text-sm text-slate-600">{subtitle}</span>
        )}
      </span>
    </button>
  );
}
