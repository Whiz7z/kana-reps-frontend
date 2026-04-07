import { createTheme } from "@mui/material/styles";
import { themeTokens } from "@/theme/tokens";

const light = themeTokens.light;
const dark = themeTokens.dark;

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: light.primary, dark: light.primaryHover },
    secondary: { main: light.secondary, dark: light.secondaryHover },
    background: { default: light.background, paper: light.paper },
    text: { primary: light.foreground, secondary: light.muted },
    divider: light.border,
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: dark.primary, dark: dark.primaryHover },
    secondary: { main: dark.secondary, dark: dark.secondaryHover },
    background: { default: dark.background, paper: dark.paper },
    text: { primary: dark.foreground, secondary: dark.muted },
    divider: dark.border,
  },
});
