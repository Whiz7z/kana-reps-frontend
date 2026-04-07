import type { ColorMode } from "@/theme/types";
import type { ThemeTokenKey } from "@/theme/tokens";
import { themeTokens } from "@/theme/tokens";

/** `pickerCellBg` → `--color-picker-cell-bg` */
export function tokenKeyToCssVarName(key: string): string {
  const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase();
  return `--color-${kebab}`;
}

/** Pushes every token in `themeTokens[mode]` onto `document.documentElement`. */
export function applyThemeCssVars(mode: ColorMode): void {
  const t = themeTokens[mode];
  const root = document.documentElement;
  for (const key of Object.keys(t) as ThemeTokenKey[]) {
    root.style.setProperty(tokenKeyToCssVarName(key), t[key]);
  }
  root.style.colorScheme = mode === "dark" ? "dark" : "light";
}
