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
        "cursor-pointer flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 sm:px-6 sm:py-4",
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 hover:bg-gray-100"
          : "border-purple-200 bg-gradient-to-r from-pink-100 to-purple-100 text-gray-700 hover:from-pink-200 hover:to-purple-200"
      )}
    >
      {disabled && <Lock className="h-4 w-4 shrink-0 text-gray-400" />}
      {icon && !disabled && (
        <span className="shrink-0 text-purple-600">{icon}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold sm:text-lg">{title}</span>
        {subtitle && (
          <span className="mt-1 block text-sm text-gray-600">{subtitle}</span>
        )}
      </span>
    </button>
  );
}
