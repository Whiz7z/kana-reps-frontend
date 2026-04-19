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
  /** Short row label rendered on the left (e.g. "a", "k", "s"). */
  rowLabel?: string;
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
  if (prev.rowLabel !== next.rowLabel) return false;
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
  rowLabel,
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
      ? "grid w-full min-w-0 grid-cols-1 gap-1"
      : cols === 3
        ? "grid w-full min-w-0 grid-cols-3 gap-1"
        : "grid w-full min-w-0 grid-cols-5 gap-1";

  return (
    <div
      className="flex min-w-0 items-start gap-1.5 py-1"
      role="row"
    >
      <div
        aria-hidden
        className="practice-ui flex w-5 shrink-0 items-center justify-end self-start min-h-10 text-right uppercase sm:w-6 sm:min-h-11"
        style={{
          color: "var(--practice-text-tertiary)",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 0.4,
          lineHeight: 1,
        }}
      >
        {rowLabel ?? ""}
      </div>

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
              className="min-h-10 min-w-0 flex-1 sm:min-h-11"
              aria-hidden
              style={{
                border: "1px dashed var(--practice-stroke-subtle)",
                borderRadius: "var(--practice-radius)",
              }}
            />
          )
        )}
      </div>

      <label
        className="flex w-5 shrink-0 cursor-pointer items-center justify-center self-start min-h-10 sm:w-6 sm:min-h-11"
        title={allOn ? "Clear row" : "Select row"}
      >
        <span
          className="flex items-center justify-center transition"
          style={{
            width: 18,
            height: 18,
            borderRadius: "var(--practice-radius)",
            background: allOn ? "var(--practice-accent)" : "transparent",
            border: `1px solid ${
              allOn
                ? "var(--practice-accent)"
                : "var(--practice-stroke)"
            }`,
            color: allOn
              ? "var(--practice-accent-ink)"
              : "var(--practice-text-tertiary)",
            fontFamily: "var(--practice-ui-font)",
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1,
          }}
          aria-hidden
        >
          {allOn ? "✓" : someOn ? "–" : ""}
        </span>
        <input
          ref={inputRef}
          type="checkbox"
          className="sr-only"
          checked={allOn}
          onChange={() => onBulkRow(keys, !allOn)}
          aria-label={`Select row ${rowLabel ?? rowId}`}
        />
      </label>
    </div>
  );
}

/** Re-renders only when this row's cells or their selection state change. */
export const KanaPickerRow = memo(KanaPickerRowInner, pickerRowPropsEqual);
