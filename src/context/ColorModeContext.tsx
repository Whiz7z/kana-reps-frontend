import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeProvider } from "@mui/material/styles";
import { applyThemeCssVars } from "@/theme/applyThemeTokens";
import { COLOR_MODE_STORAGE_KEY } from "@/theme/constants";
import { darkTheme, lightTheme } from "@/theme/muiThemes";
import type { ColorMode } from "@/theme/types";

export type { ColorMode };

type ColorModeState = {
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
};

const ColorModeContext = createContext<ColorModeState | null>(null);

function getStoredMode(): ColorMode {
  try {
    const raw = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    if (raw === "light") return "light";
    if (raw === "dark") return "dark";
  } catch {
    /* ignore */
  }
  return "dark";
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorMode>(() => getStoredMode());

  const setMode = useCallback((next: ColorMode) => {
    setModeState(next);
    try {
      localStorage.setItem(COLOR_MODE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "light" ? "dark" : "light");
  }, [mode, setMode]);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    applyThemeCssVars(mode);
  }, [mode]);

  const muiTheme = useMemo(
    () => (mode === "dark" ? darkTheme : lightTheme),
    [mode]
  );

  const value = useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode]
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode(): ColorModeState {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return ctx;
}
