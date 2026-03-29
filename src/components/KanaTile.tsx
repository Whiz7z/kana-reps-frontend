import type { KanaRow } from "@/api/types";
import { cn } from "@/lib/utils";

type Props = {
  row: KanaRow;
  selected: boolean;
  onToggle: () => void;
  /** compact: picker grid · table: desktop gojūon · mobile: 5-col row · mobileWide: ん row */
  layout?: "compact" | "table" | "mobile" | "mobileWide";
};

export function KanaTile({
  row,
  selected,
  onToggle,
  layout = "compact",
}: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-2xl border font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        layout === "table" &&
          "min-h-[2.75rem] w-full max-w-[3.5rem] px-0.5 py-1 text-[18px] sm:min-h-[3.25rem] sm:text-[20px]",
        layout === "mobile" &&
          "min-h-[3.25rem] w-full rounded-lg px-0.5 py-1.5 text-[18px] leading-tight",
        layout === "mobileWide" &&
          "max-w-none rounded-xl border-2 px-6 py-4 text-[32px] sm:text-[38px]",
        layout === "compact" && "h-10 w-10 text-[16px]",
        selected
          ? "scale-[0.98] border-indigo-600 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
          : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/80"
      )}
    >
      <span className="leading-none">{row.char}</span>
      {layout !== "mobileWide" && (
        <span
          className={cn(
            "mt-0.5 max-w-[3rem] truncate text-[10px] leading-none opacity-80 sm:text-[11px]",
            selected ? "text-white" : "text-slate-500"
          )}
        >
          {row.romaji}
        </span>
      )}
      {layout === "mobileWide" && (
        <span
          className={cn(
            "mt-1 text-[16px] font-normal opacity-80",
            selected ? "text-white" : "text-slate-500"
          )}
        >
          {row.romaji}
        </span>
      )}
    </button>
  );
}
