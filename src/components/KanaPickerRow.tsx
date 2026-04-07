import { memo, useEffect, useRef } from "react";
import type { KanaRow } from "@/api/types";
import type { KanaGuessStatsMap } from "@/types/kanaGuessStats";
import { KanaPickerCell } from "@/components/KanaPickerCell";
import { kanaKey } from "@/lib/kanaKeys";
import { cn } from "@/lib/utils";

type Props = {
  cells: (KanaRow | null)[];
  /** 5, 3, or 1 column grid */
  cols: 1 | 3 | 5;
  selected: Set<string>;
  onToggle: (key: string, row: KanaRow) => void;
  onBulkRow: (keys: string[], select: boolean) => void;
  guessStats?: KanaGuessStatsMap;
  rowId: string;
};

function cellsStructureEqual(
  a: (KanaRow | null)[],
  b: (KanaRow | null)[]
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (x === y) continue;
    if (!x || !y) return false;
    if (kanaKey(x) !== kanaKey(y)) return false;
  }
  return true;
}

function rowSelectionUnchanged(
  cells: (KanaRow | null)[],
  prev: Set<string>,
  next: Set<string>
): boolean {
  for (const c of cells) {
    if (!c) continue;
    const k = kanaKey(c);
    if (prev.has(k) !== next.has(k)) return false;
  }
  return true;
}

function pickerRowPropsEqual(prev: Readonly<Props>, next: Readonly<Props>): boolean {
  if (prev.rowId !== next.rowId) return false;
  if (prev.cols !== next.cols) return false;
  if (prev.onToggle !== next.onToggle) return false;
  if (prev.onBulkRow !== next.onBulkRow) return false;
  if (prev.guessStats !== next.guessStats) return false;
  if (!cellsStructureEqual(prev.cells, next.cells)) return false;
  if (!rowSelectionUnchanged(next.cells, prev.selected, next.selected)) {
    return false;
  }
  return true;
}

function KanaPickerRowInner({
  cells,
  cols,
  selected,
  onToggle,
  onBulkRow,
  guessStats,
  rowId,
}: Props) {
  const keys = cells
    .filter((c): c is KanaRow => c != null)
    .map((r) => kanaKey(r));
  const allOn = keys.length > 0 && keys.every((k) => selected.has(k));
  const someOn = keys.some((k) => selected.has(k));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.indeterminate = someOn && !allOn;
  }, [someOn, allOn]);

  const gridClass =
    cols === 1
      ? "grid w-full min-w-0 grid-cols-1 gap-0.5"
      : cols === 3
        ? "grid w-full min-w-0 grid-cols-3 gap-0.5"
        : "grid w-full min-w-0 grid-cols-5 gap-0.5";

  return (
    <div
      className="flex min-w-0 items-stretch gap-1 border-b border-[color:var(--color-picker-row-border)] py-0.5 last:border-b-0"
      role="row"
    >
      <label
        className="flex w-7 shrink-0 cursor-pointer items-center justify-center sm:w-8"
        title="Select row"
      >
        <input
          ref={inputRef}
          type="checkbox"
          className="h-3.5 w-3.5 rounded border-slate-300 bg-[var(--color-picker-cell-bg)] text-[var(--color-primary)] focus:ring-[var(--color-ring)]/40 dark:border-slate-500"
          checked={allOn}
          onChange={() => onBulkRow(keys, !allOn)}
          aria-label={`Select row ${rowId}`}
        />
      </label>
      <div className={cn(gridClass, "min-w-0 flex-1")}>
        {cells.map((cell, i) =>
          cell ? (
            <KanaPickerCell
              key={`${rowId}-${kanaKey(cell)}`}
              row={cell}
              selected={selected.has(kanaKey(cell))}
              onToggle={() => onToggle(kanaKey(cell), cell)}
              guessStats={guessStats}
            />
          ) : (
            <div
              key={`empty-${rowId}-${i}`}
              className="min-h-[2.25rem] min-w-0 flex-1 rounded-md border border-transparent"
              aria-hidden
            />
          )
        )}
      </div>
    </div>
  );
}

/** Re-renders only when this row's cells or their selection state change. */
export const KanaPickerRow = memo(KanaPickerRowInner, pickerRowPropsEqual);
