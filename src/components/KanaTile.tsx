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
        "flex w-full flex-col items-center justify-center rounded-lg border font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
        layout === "table" &&
          "min-h-[2.75rem] w-full max-w-[3.5rem] px-0.5 py-1 text-base sm:min-h-[3.25rem] sm:text-lg",
        layout === "mobile" &&
          "min-h-[3.25rem] w-full rounded-lg px-0.5 py-1.5 text-base leading-tight",
        layout === "mobileWide" &&
          "max-w-none rounded-xl border-2 px-6 py-4 text-3xl sm:text-4xl",
        layout === "compact" && "h-10 w-10 text-sm",
        selected
          ? "scale-[0.98] border-purple-600 bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-md"
          : "border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50"
      )}
    >
      <span className="leading-none">{row.char}</span>
      {layout !== "mobileWide" && (
        <span
          className={cn(
            "mt-0.5 max-w-[3rem] truncate text-[8px] leading-none opacity-80 sm:text-[9px]",
            selected ? "text-white" : "text-gray-500"
          )}
        >
          {row.romaji}
        </span>
      )}
      {layout === "mobileWide" && (
        <span
          className={cn(
            "mt-1 text-sm font-normal opacity-80",
            selected ? "text-white" : "text-gray-500"
          )}
        >
          {row.romaji}
        </span>
      )}
    </button>
  );
}
