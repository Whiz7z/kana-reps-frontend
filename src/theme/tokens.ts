/**
 * Central theme tokens — edit colors here for light and dark mode.
 * Values are applied at runtime as `document.documentElement` CSS variables:
 *   camelCase key `pickerCellText` → `--color-picker-cell-text`
 *
 * Keep `index.css` `:root` / `.dark` blocks in sync for pre-hydration / FOUC
 * (duplicate the same hex values).
 */
export const themeTokens = {
  light: {
    // Page shell
    background: "#fef9f3",
    paper: "#ffffff",
    foreground: "#0f172a",
    muted: "#64748b",
    border: "rgba(99, 102, 241, 0.2)",
    // Brand actions
    primary: "#6d28d9",
    primaryHover: "#5b21b6",
    secondary: "#db2777",
    secondaryHover: "#be185d",
    accent: "#f59e0b",
    accentHover: "#d97706",
    ring: "#6366f1",
    ringOffset: "#fef9f3",
    rangeTrackRest: "#e2e8f0",
    // Kana picker — unselected cell (must stay readable on cell bg)
    pickerCellBg: "#ffffff",
    pickerCellText: "#1e293b",
    pickerCellTextMuted: "#64748b",
    pickerCellBorder: "#e2e8f0",
    pickerCellHoverBg: "rgba(238, 242, 255, 0.9)",
    pickerCellHoverBorder: "#a5b4fc",
    // Kana picker — section panels / rows
    pickerPanelBg: "rgba(248, 250, 252, 0.9)",
    pickerPanelBorder: "rgba(99, 102, 241, 0.2)",
    pickerRowBorder: "rgba(99, 102, 241, 0.28)",
  },
  dark: {
    background: "#0f0f14",
    paper: "#18181f",
    foreground: "#f1f5f9",
    muted: "#94a3b8",
    border: "rgba(167, 139, 250, 0.25)",
    primary: "#a78bfa",
    primaryHover: "#8b5cf6",
    secondary: "#f472b6",
    secondaryHover: "#ec4899",
    accent: "#fbbf24",
    accentHover: "#f59e0b",
    ring: "#a78bfa",
    ringOffset: "#0f0f14",
    rangeTrackRest: "#475569",
    pickerCellBg: "#24242f",
    pickerCellText: "#f8fafc",
    pickerCellTextMuted: "#cbd5e1",
    pickerCellBorder: "#3e3e50",
    pickerCellHoverBg: "rgba(167, 139, 250, 0.14)",
    pickerCellHoverBorder: "#7c7c95",
    pickerPanelBg: "rgba(22, 22, 30, 0.95)",
    pickerPanelBorder: "rgba(167, 139, 250, 0.22)",
    pickerRowBorder: "rgba(167, 139, 250, 0.18)",
  },
} as const;

export type ThemeTokenKey = keyof typeof themeTokens.light;
