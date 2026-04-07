import { memo } from "react";
import { ChevronDown } from "lucide-react";
import type { KanaGuessStatsMap } from "@/types/kanaGuessStats";
import { cn } from "@/lib/utils";

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
  const allOn =
    tierKeys.length > 0 && tierKeys.every((k) => selected.has(k));

  function tierToggle() {
    onBulkRow(tierKeys, !allOn);
  }

  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-lg border border-indigo-100/70 bg-[var(--color-paper)] dark:border-white/10"
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-2 border-b border-indigo-100/50 bg-indigo-50/40 px-2 py-1.5 text-left text-xs font-semibold text-indigo-900 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-100",
          "[&::-webkit-details-marker]:hidden"
        )}
      >
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-indigo-500 transition-transform duration-200 group-open:rotate-180" />
        <span className="min-w-0 flex-1 truncate">{title}</span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            tierToggle();
          }}
          className={cn(
            "shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold sm:text-xs",
            allOn
              ? "border border-slate-200 bg-[var(--color-paper)] text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              : "bg-[var(--color-primary)] text-white shadow-sm shadow-violet-500/20 hover:bg-[var(--color-primary-hover)] dark:shadow-violet-900/40"
          )}
          aria-pressed={allOn}
          title={allOn ? "Deselect all in section" : "Select all in section"}
        >
          {allOn ? "Clear" : "All"}
        </button>
      </summary>
      <div className="bg-[var(--color-background)]/50 px-1 py-0.5 dark:bg-black/20">
        {children}
      </div>
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
