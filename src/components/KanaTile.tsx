import type { KanaRow } from "@/api/types";
import { kanaKey } from "@/lib/kanaKeys";
import { cn } from "@/lib/utils";

export type KanaGuessStatsMap = Map<
  string,
  { correct: number; wrong: number }
>;

type Props = {
  row: KanaRow;
  selected: boolean;
  onToggle: () => void;
  /** compact: picker grid · table: desktop gojūon · mobile: 5-col row · mobileWide: ん row */
  layout?: "compact" | "table" | "mobile" | "mobileWide";
  guessStats?: KanaGuessStatsMap;
};

export function KanaTile({
  row,
  selected,
  onToggle,
  layout = "compact",
  guessStats,
}: Props) {
  const st = guessStats?.get(kanaKey(row));
  const total =
    st && st.correct + st.wrong > 0 ? st.correct + st.wrong : 0;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-2xl border font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        layout === "table" &&
          cn(
            "w-full max-w-[3.5rem] px-0.5 py-1 text-[18px] sm:text-[20px]",
            total > 0
              ? "min-h-[3.25rem] sm:min-h-[3.75rem]"
              : "min-h-[2.75rem] sm:min-h-[3.25rem]"
          ),
        layout === "mobile" &&
          cn(
            "w-full rounded-lg px-0.5 py-1.5 text-[18px] leading-tight",
            total > 0 ? "min-h-[3.75rem]" : "min-h-[3.25rem]"
          ),
        layout === "mobileWide" &&
          "max-w-none rounded-xl border-2 px-6 py-4 text-[32px] sm:text-[38px]",
        layout === "compact" &&
          cn("w-10 text-[16px]", total > 0 ? "min-h-[2.65rem] h-auto py-1" : "h-10"),
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
      {total > 0 && st && (
        <div
          className={cn(
            "mt-1 flex h-1.5 w-full shrink-0 overflow-hidden rounded-full",
            layout === "mobileWide" && "max-w-xs",
            layout === "compact" && "max-w-[2.25rem]",
            layout !== "mobileWide" && layout !== "compact" && "max-w-[3.25rem]",
            selected ? "bg-white/25" : "bg-slate-200/90"
          )}
          aria-hidden
        >
          <div
            className={cn(
              "h-full shrink-0",
              selected ? "bg-emerald-300" : "bg-emerald-500/90"
            )}
            style={{ width: `${(st.correct / total) * 100}%` }}
          />
          <div
            className={cn(
              "h-full shrink-0",
              selected ? "bg-rose-300" : "bg-rose-500/90"
            )}
            style={{ width: `${(st.wrong / total) * 100}%` }}
          />
        </div>
      )}
    </button>
  );
}
