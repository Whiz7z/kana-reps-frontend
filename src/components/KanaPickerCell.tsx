import { memo, useCallback, useState } from "react";
import type { CSSProperties } from "react";
import type { KanaRow } from "@/api/types";
import type { KanaGuessStatsMap } from "@/types/kanaGuessStats";
import { kanaKey } from "@/lib/kanaKeys";
import { cn } from "@/lib/utils";

type Props = {
  row: KanaRow;
  selected: boolean;
  /**
   * Stable across renders; the cell calls it with its own (key, row) so the
   * parent doesn't have to allocate a fresh closure per cell per render.
   */
  onToggle: (key: string, row: KanaRow) => void;
  guessStats?: KanaGuessStatsMap;
};

/**
 * Picker cell — flat Washi / Modern Dark look driven by --practice-* tokens.
 * Selected state fills with the accent colour (no glow / shadow). A practiced
 * cell shows a 2px accuracy bar and a single "% / counts" glanceable token
 * that swaps between percentage and raw ✓/✗ counts on hover.
 */
function KanaPickerCellInner({ row, selected, onToggle, guessStats }: Props) {
  const handleClick = useCallback(() => {
    onToggle(kanaKey(row), row);
  }, [onToggle, row]);

  const st = guessStats?.get(kanaKey(row));
  const total = st ? st.correct + st.wrong : 0;
  const hasStats = total > 0 && !!st;
  const pct = hasStats ? Math.round((st!.correct / total) * 100) : 0;
  const correctPct = hasStats ? (st!.correct / total) * 100 : 0;

  const [statsHover, setStatsHover] = useState(false);

  const buttonStyle: CSSProperties = selected
    ? {
        background: "var(--practice-accent)",
        color: "var(--practice-accent-ink)",
        border: "1px solid var(--practice-accent)",
      }
    : {
        background: "var(--practice-surface-elev)",
        color: "var(--practice-text)",
        border: "1px solid var(--practice-stroke)",
      };

  return (
    <div className="flex min-w-0 flex-1 flex-col items-stretch gap-1">
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={selected}
        className={cn(
          "practice-ui flex min-h-10 min-w-0 flex-col items-center justify-center px-0.5 py-1 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) sm:min-h-11",
          !selected && "hover:border-(--practice-accent)"
        )}
        style={{
          ...buttonStyle,
          borderRadius: "var(--practice-radius)",
          lineHeight: 1,
        }}
      >
        <span
          className="practice-kana font-medium"
          style={{
            fontSize: "clamp(0.95rem, 3.2vw, 1.25rem)",
          }}
        >
          {row.char}
        </span>
        <span
          className="mt-0.5 max-w-full truncate tracking-wide"
          style={{
            fontSize: "clamp(0.55rem, 1.5vw, 0.65rem)",
            fontWeight: 500,
            letterSpacing: 0.3,
            opacity: selected ? 0.9 : 0.7,
          }}
        >
          {row.romaji}
        </span>
      </button>

      {hasStats && st && (
        <div
          className="flex w-full flex-col gap-0.5 px-0.5"
          onMouseEnter={() => setStatsHover(true)}
          onMouseLeave={() => setStatsHover(false)}
          onFocus={() => setStatsHover(true)}
          onBlur={() => setStatsHover(false)}
          title={`${st.correct} correct · ${st.wrong} wrong · ${pct}% accuracy`}
        >
          <div
            className="flex h-[2px] w-full overflow-hidden"
            style={{
              background: "var(--practice-stroke-subtle)",
              borderRadius: 1,
            }}
            aria-hidden
          >
            <div
              className="h-full shrink-0"
              style={{
                width: `${correctPct}%`,
                background: "var(--practice-success)",
              }}
            />
            <div
              className="h-full shrink-0"
              style={{
                width: `${100 - correctPct}%`,
                background: "var(--practice-danger)",
              }}
            />
          </div>
          <div
            className="practice-ui flex min-h-[0.85rem] w-full items-center justify-center gap-1.5 tabular-nums"
            style={{
              color: "var(--practice-text-tertiary)",
              fontSize: "clamp(0.55rem, 1.4vw, 0.65rem)",
              letterSpacing: 0.3,
              lineHeight: 1,
            }}
            aria-label={`${st.correct} correct, ${st.wrong} wrong, ${pct}% accuracy`}
          >
            {statsHover ? (
              <>
                <span style={{ color: "var(--practice-success)" }}>
                  ✓{st.correct}
                </span>
                <span style={{ color: "var(--practice-text-tertiary)" }}>·</span>
                <span style={{ color: "var(--practice-danger)" }}>
                  ✗{st.wrong}
                </span>
              </>
            ) : (
              <span>{pct}%</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Memo uses shallow equality on primitive props (`selected`) and on the stable
 * identities of `row`, `onToggle`, and `guessStats`. Because the row is only
 * re-rendered when the selection inside its cells changes, unaffected cells
 * within the same row still bail out here.
 */
export const KanaPickerCell = memo(KanaPickerCellInner);
