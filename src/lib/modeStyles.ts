import { cn } from "@/lib/utils";

/** Inactive practice mode / level chip */
export const modeInactiveClass =
  "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

/** Kana → Romaji (matte purple) */
export const modeKanaToRomajiActiveClass =
  "bg-[var(--color-primary)] text-white shadow-lg shadow-violet-500/20 hover:bg-[var(--color-primary-hover)] dark:shadow-violet-900/40";

/** Romaji → Kana (matte pink) */
export const modeRomajiToKanaActiveClass =
  "bg-[var(--color-secondary)] text-white shadow-lg shadow-pink-500/25 hover:bg-[var(--color-secondary-hover)] dark:shadow-pink-900/30";

/** Writing mode (matte amber) */
export const modeWritingActiveClass =
  "bg-[var(--color-accent)] text-slate-900 shadow-lg shadow-amber-500/25 hover:bg-[var(--color-accent-hover)]";

/** Full-width primary CTA (purple) */
export const ctaPrimaryClass =
  "w-full rounded-2xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40 dark:shadow-violet-900/40";

/** Full-width secondary CTA (pink) */
export const ctaSecondaryClass =
  "w-full rounded-2xl bg-[var(--color-secondary)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:bg-[var(--color-secondary-hover)] disabled:cursor-not-allowed disabled:opacity-40 dark:shadow-pink-900/30";

/** Toolbar / small primary button */
export const toolbarPrimaryClass =
  "rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-[var(--color-primary-hover)] dark:shadow-violet-900/40";

export function optionToggleClass(isOn: boolean) {
  return cn(
    "flex-1 rounded-2xl px-3 py-2.5 text-sm font-semibold transition sm:min-h-[2.75rem]",
    isOn
      ? "border border-violet-200 bg-violet-50 text-slate-800 hover:bg-violet-100 dark:border-violet-800/80 dark:bg-violet-950/50 dark:text-slate-100 dark:hover:bg-violet-900/40"
      : modeInactiveClass
  );
}

/** Card panels (menu, custom, etc.) */
export const cardShellClass =
  "rounded-3xl border border-slate-100/80 bg-[var(--color-paper)] p-3 shadow-xl shadow-slate-200/50 sm:p-6 dark:border-white/10 dark:shadow-black/40";
