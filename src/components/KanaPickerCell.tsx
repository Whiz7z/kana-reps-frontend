import type { KanaRow } from "@/api/types";
import type { KanaGuessStatsMap } from "@/types/kanaGuessStats";
import { kanaKey } from "@/lib/kanaKeys";
import { cn } from "@/lib/utils";

type Props = {
  row: KanaRow;
  selected: boolean;
  onToggle: () => void;
  guessStats?: KanaGuessStatsMap;
};

export function KanaPickerCell({ row, selected, onToggle, guessStats }: Props) {
  const st = guessStats?.get(kanaKey(row));
  const total =
    st && st.correct + st.wrong > 0 ? st.correct + st.wrong : 0;
  const pct = total > 0 && st ? Math.round((st.correct / total) * 100) : 0;

  return (
    <div className="flex min-w-0 flex-1 flex-col items-stretch gap-1">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        className={cn(
          "flex min-h-[2.25rem] min-w-0 flex-col items-center justify-center rounded-md border px-0.5 py-0.5 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
          "text-[clamp(0.65rem,2.8vw,0.95rem)] leading-none tabular-nums",
          selected
            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_0_16px_rgba(109,40,217,0.35)] shadow-lg shadow-violet-500/25 ring-1 ring-[var(--color-primary)]/50 dark:shadow-[0_0_16px_rgba(167,139,250,0.35)] dark:shadow-violet-900/40"
            : cn(
                "border-[color:var(--color-picker-cell-border)] bg-[var(--color-picker-cell-bg)] text-[color:var(--color-picker-cell-text)]",
                "hover:border-[color:var(--color-picker-cell-hover-border)] hover:bg-[var(--color-picker-cell-hover-bg)]"
              )
        )}
      >
        <span
          className={cn(
            "font-medium",
            selected ? "text-white" : "text-[color:var(--color-picker-cell-text)]"
          )}
        >
          {row.char}
        </span>
        <span
          className={cn(
            "mt-0.5 max-w-full truncate text-[9px] tracking-wide sm:text-[10px]",
            selected
              ? "text-white/90"
              : "text-[color:var(--color-picker-cell-text-muted)]"
          )}
        >
          {row.romaji}
        </span>
      </button>
      {total > 0 && st && (
        <div
          className="flex w-full flex-col items-center gap-0.5 px-0.5"
          title={`${st.correct} correct / ${st.wrong} wrong (${total} total, ${pct}% accuracy)`}
        >
          <div
            className="flex h-1 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-600/60"
            aria-hidden
          >
            <div
              className="h-full shrink-0 bg-emerald-400/70 dark:bg-emerald-500/60"
              style={{ width: `${(st.correct / total) * 100}%` }}
            />
            <div
              className="h-full shrink-0 bg-rose-400/70 dark:bg-rose-500/60"
              style={{ width: `${(st.wrong / total) * 100}%` }}
            />
          </div>
          <div className="flex w-full items-center justify-center gap-1 text-[8px] font-medium leading-none tabular-nums sm:text-[9px]">
            <span className="text-[color:var(--color-picker-cell-text-muted)]">
              {pct}%
            </span>
            <span
              className="text-emerald-600 dark:text-emerald-400"
              aria-label={`${st.correct} correct`}
            >
              ✓{st.correct}
            </span>
            <span
              className="text-rose-600 dark:text-rose-400"
              aria-label={`${st.wrong} wrong`}
            >
              ✗{st.wrong}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
