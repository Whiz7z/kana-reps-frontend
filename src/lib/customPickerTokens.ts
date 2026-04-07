/**
 * /custom kana picker — class fragments; colors come from src/theme/tokens.ts
 * (CSS variables --color-picker-*).
 */

export const pickerPageBg =
  "bg-[var(--color-paper)] border border-[color:var(--color-picker-panel-border)] shadow-xl shadow-slate-200/40 dark:shadow-black/40";

export const pickerPanelBg = "bg-transparent";
export const pickerPanelBorder =
  "";

export const pickerSectionBar =
  "flex w-full items-center justify-between gap-3 rounded-lg bg-[var(--color-primary)] px-3 py-2.5 text-sm text-white shadow-sm shadow-violet-500/15 dark:shadow-violet-900/40";

export const pickerColumnTitle =
  "text-lg font-semibold tracking-tight text-[var(--color-primary)]";

export const pickerHeadingMuted = "text-slate-500 dark:text-slate-400";

export const pickerTableWell =
  "overflow-x-hidden rounded-2xl border border-[color:var(--color-picker-panel-border)] bg-[var(--color-paper)]/80 p-2 sm:p-3";

export const pickerHeaderCell =
  "text-[10px] font-semibold text-slate-500 sm:text-xs dark:text-slate-400";

export const pickerStickyToolbar =
  "sticky top-0 z-40 flex flex-wrap items-center justify-center gap-2 border-b border-[color:var(--color-picker-panel-border)] mb-2 bg-[var(--color-background)]/95 py-2 backdrop-blur-md sm:py-2.5 lg:justify-between";

/** Selected kana cell — extra glow (optional compose in KanaPickerCell) */
export const pickerNeonSelected =
  "shadow-[0_0_16px_rgba(109,40,217,0.35)] ring-1 ring-[var(--color-primary)]/50 dark:shadow-[0_0_16px_rgba(167,139,250,0.35)]";
