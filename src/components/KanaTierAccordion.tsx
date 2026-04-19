import { memo } from "react";
import type { KanaGuessStatsMap } from "@/types/kanaGuessStats";

type Props = {
  title: string;
  defaultOpen?: boolean;
  tierKeys: string[];
  selected: Set<string>;
  onBulkRow: (keys: string[], select: boolean) => void;
  /** Passed so memo can rerender when stats refresh; not read in the shell UI */
  guessStats?: KanaGuessStatsMap;
  children: React.ReactNode;
};

function tierKeysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function tierSelectionUnchanged(
  tierKeys: string[],
  prev: Set<string>,
  next: Set<string>
): boolean {
  for (const k of tierKeys) {
    if (prev.has(k) !== next.has(k)) return false;
  }
  return true;
}

function tierAccordionPropsEqual(
  prev: Readonly<Props>,
  next: Readonly<Props>
): boolean {
  if (prev.title !== next.title) return false;
  if (prev.defaultOpen !== next.defaultOpen) return false;
  if (prev.onBulkRow !== next.onBulkRow) return false;
  if (prev.guessStats !== next.guessStats) return false;
  if (!tierKeysEqual(prev.tierKeys, next.tierKeys)) return false;
  if (
    !tierSelectionUnchanged(next.tierKeys, prev.selected, next.selected)
  ) {
    return false;
  }
  return true;
}

function KanaTierAccordionInner({
  title,
  defaultOpen = true,
  tierKeys,
  selected,
  onBulkRow,
  children,
}: Props) {
  const tierTotal = tierKeys.length;
  const tierDone = tierKeys.reduce(
    (n, k) => (selected.has(k) ? n + 1 : n),
    0
  );
  const allOn = tierTotal > 0 && tierDone === tierTotal;

  function tierToggle() {
    onBulkRow(tierKeys, !allOn);
  }

  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden"
      style={{
        background: "var(--practice-surface-elev)",
        border: "1px solid var(--practice-stroke-subtle)",
        borderRadius: "var(--practice-radius)",
      }}
    >
      <summary
        className="practice-ui flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-left [&::-webkit-details-marker]:hidden"
        style={{
          background: "var(--practice-surface)",
          borderBottom: "1px solid var(--practice-stroke-subtle)",
          color: "var(--practice-text)",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span
          aria-hidden
          className="inline-block text-center transition-transform duration-200 group-open:rotate-90"
          style={{
            color: "var(--practice-accent)",
            fontSize: 11,
            width: 10,
            lineHeight: 1,
          }}
        >
          ›
        </span>
        <span className="min-w-0 flex-1 truncate">{title}</span>
        <span
          className="practice-ui tabular-nums"
          style={{
            color: "var(--practice-text-tertiary)",
            fontSize: 11,
            letterSpacing: 0.2,
          }}
        >
          {tierDone} / {tierTotal}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            tierToggle();
          }}
          className="practice-ui shrink-0 transition"
          style={{
            background: allOn
              ? "var(--practice-surface-elev)"
              : "var(--practice-accent)",
            color: allOn
              ? "var(--practice-text-secondary)"
              : "var(--practice-accent-ink)",
            border: `1px solid ${
              allOn ? "var(--practice-stroke)" : "var(--practice-accent)"
            }`,
            borderRadius: "var(--practice-radius)",
            padding: "2px 8px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
          aria-pressed={allOn}
          title={allOn ? "Deselect all in section" : "Select all in section"}
        >
          {allOn ? "Clear" : "All"}
        </button>
      </summary>
      <div className="px-2 py-1 sm:px-2.5 sm:py-1.5">{children}</div>
    </details>
  );
}

/**
 * Only re-renders when this tier's keys change in `selected`, or `guessStats`
 * ref changes. Other accordions / scripts can update without redrawing this one.
 */
export const KanaTierAccordion = memo(
  KanaTierAccordionInner,
  tierAccordionPropsEqual
);
