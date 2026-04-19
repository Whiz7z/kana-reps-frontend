import type { CSSProperties, ReactNode } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Code,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Table,
  Text,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

// ---------------------------------------------------------------------------
// Two explicit aesthetic palettes. These are the DELIVERABLE of this canvas —
// they represent the designs the user is evaluating, not canvas chrome — so
// literal hex values are the appropriate abstraction level here. Canvas
// host tokens are still used for the surrounding canvas frame.
// ---------------------------------------------------------------------------

type VariantTokens = {
  name: string;
  subtitle: string;
  bg: string;
  surface: string;
  surfaceElevated: string;
  stroke: string;
  strokeSubtle: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentSoft: string;
  accentInk: string;
  success: string;
  danger: string;
  kanaFont: string;
  uiFont: string;
  radius: number;
};

const WASHI: VariantTokens = {
  name: "Minimal 和紙",
  subtitle: "Warm paper, sumi ink, single vermillion accent",
  bg: "#F4EEE2",
  surface: "#FBF6EB",
  surfaceElevated: "#FFFDF7",
  stroke: "#D8CFBB",
  strokeSubtle: "#E7DFCB",
  text: "#1E1A14",
  textSecondary: "#5A5141",
  textTertiary: "#8C8471",
  accent: "#B13A2F",
  accentSoft: "#F1DAD4",
  accentInk: "#1E1A14",
  success: "#4F7A4B",
  danger: "#B13A2F",
  kanaFont: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif',
  uiFont: '"Inter", "Noto Sans JP", system-ui, sans-serif',
  radius: 6,
};

const DARK: VariantTokens = {
  name: "Modern Dark",
  subtitle: "Near-black canvas, electric violet accent, crisp geometry",
  bg: "#0B0C12",
  surface: "#14161F",
  surfaceElevated: "#1B1E2A",
  stroke: "#2A2E3D",
  strokeSubtle: "#20232F",
  text: "#F3F4F9",
  textSecondary: "#A6ABBE",
  textTertiary: "#6C7186",
  accent: "#8B7CFF",
  accentSoft: "#2A2649",
  accentInk: "#F3F4F9",
  success: "#4ADE80",
  danger: "#F87171",
  kanaFont: '"Zen Kaku Gothic New", "Noto Sans JP", system-ui, sans-serif',
  uiFont: '"Inter", "SF Pro Display", system-ui, sans-serif',
  radius: 14,
};

export default function PracticeScreenRedesign() {
  const { tokens: t } = useHostTheme();
  const [focused, setFocused] = useCanvasState<"washi" | "dark">(
    "focused-variant",
    "washi"
  );
  const focusedTokens = focused === "washi" ? WASHI : DARK;

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Practice Screen — Two Directions</H1>
        <Text tone="secondary">
          Side-by-side exploration for the kana practice flow. Both mocks render
          the same content: prompt, answer field, keyboard hint, history. Pick
          one — or I can merge elements from each.
        </Text>
      </Stack>

      <H2>Side-by-side comparison</H2>
      <Grid columns={1} gap={20} align="start">
        <VariantFrame variant={WASHI} tokens={t}>
          <PracticeMock variant={WASHI} />
        </VariantFrame>
        <VariantFrame variant={DARK} tokens={t}>
          <PracticeMock variant={DARK} />
        </VariantFrame>
      </Grid>

      <Divider />



      <Divider />

      <H2>Design tokens</H2>
      <Grid columns={2} gap={20} align="start">
        <TokenBlock variant={WASHI} />
        <TokenBlock variant={DARK} />
      </Grid>

      <Divider />

      <H2>MUI theme skeletons</H2>
      <Text tone="secondary">
        Starting points for <Code>createTheme()</Code>. Drop into{" "}
        <Code>src/theme/</Code> and swap via a <Code>ThemeProvider</Code>. Both
        keep your existing MUI + Emotion stack — no migration needed.
      </Text>
      <Grid columns={2} gap={20} align="start">
        <Card>
          <CardHeader>theme.washi.ts</CardHeader>
          <CardBody style={{ padding: 0 }}>
            <ThemeCodeBlock code={washiThemeCode} variant={WASHI} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>theme.dark.ts</CardHeader>
          <CardBody style={{ padding: 0 }}>
            <ThemeCodeBlock code={darkThemeCode} variant={DARK} />
          </CardBody>
        </Card>
      </Grid>

      <Divider />

      <H2>Recommendation</H2>
      <Stack gap={8}>
        <Text>
          If this is primarily a focused <Text weight="semibold">study</Text>{" "}
          app, the Washi direction will feel calmer and keep attention on the
          kana — serif kana on warm paper is unusually legible at large sizes.
        </Text>
        <Text>
          If the app leans toward an evening / long-session workflow or you want
          it to feel like a modern tool alongside code editors, the Dark
          direction will read as more premium and reduce eye strain in low
          light.
        </Text>
        <Text tone="secondary">
          A common split: ship both as selectable themes, default to Washi (new
          users), offer Dark in Profile settings.
        </Text>
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Mock components
// ---------------------------------------------------------------------------

function VariantFrame({
  variant,
  tokens,
  children,
}: {
  variant: VariantTokens;
  tokens: ReturnType<typeof useHostTheme>["tokens"];
  children: ReactNode;
}) {
  return (
    <Stack gap={8}>
      <Row justify="space-between" align="center">
        <Stack gap={2}>
          <Text weight="semibold">{variant.name}</Text>
          <Text size="small" tone="secondary">
            {variant.subtitle}
          </Text>
        </Stack>
      </Row>
      <div
        style={{
          background: variant.bg,
          borderRadius: 12,
          border: `1px solid ${tokens.stroke.primary}`,
          padding: 16,
        }}
      >
        {children}
      </div>
    </Stack>
  );
}

function PracticeMock({ variant: v }: { variant: VariantTokens }) {
  return (
    <Stack gap={14}>
      <MockHeader v={v} />
      <MockPromptCard v={v} compact />
      <MockInput v={v} compact />
      <MockKeyboardHint v={v} />
      <MockHistoryStrip v={v} />
    </Stack>
  );
}

function PracticeFocusedMock({ variant: v }: { variant: VariantTokens }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
        gap: 24,
        alignItems: "start",
      }}
    >
      <Stack gap={20}>
        <MockHeader v={v} />
        <MockPromptCard v={v} />
        <MockInput v={v} />
        <MockKeyboardHint v={v} />
      </Stack>
      <MockHistoryPanel v={v} />
    </div>
  );
}

function MockHeader({ v }: { v: VariantTokens }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: v.radius,
          border: `1px solid ${v.stroke}`,
          background: v.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: v.textSecondary,
          fontFamily: v.uiFont,
          fontSize: 14,
          flexShrink: 0,
        }}
        aria-hidden
      >
        ←
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: v.text,
            fontFamily: v.uiFont,
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: v === WASHI ? 0.2 : -0.1,
          }}
        >
          Hiragana · Gojūon Set 3
        </div>
        <div
          style={{
            color: v.textSecondary,
            fontFamily: v.uiFont,
            fontSize: 12,
            marginTop: 2,
          }}
        >
          Kana → Romaji
        </div>
      </div>
      <div style={{ marginLeft: "auto" }}>
        <MockChip v={v} label="7 / 20" />
      </div>
    </div>
  );
}

function MockPromptCard({
  v,
  compact = false,
}: {
  v: VariantTokens;
  compact?: boolean;
}) {
  const kanaSize = compact ? 88 : 128;
  return (
    <div
      style={{
        background: v === WASHI ? v.surface : v.surfaceElevated,
        borderRadius: v.radius * 2,
        border: `1px solid ${v.strokeSubtle}`,
        padding: compact ? "28px 16px" : "44px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        minHeight: compact ? 140 : 220,
      }}
    >
      {/* Washi: subtle vermillion seal mark in the corner */}
      {v === WASHI && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 26,
            height: 26,
            borderRadius: 3,
            background: v.accent,
            color: v.surface,
            fontFamily: v.kanaFont,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}
          aria-hidden
        >
          印
        </div>
      )}
      {/* Dark: accent dot */}
      {v === DARK && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: v.accent,
          }}
          aria-hidden
        />
      )}
      <div
        style={{
          fontFamily: v.kanaFont,
          fontSize: kanaSize,
          lineHeight: 1,
          color: v.text,
          fontWeight: v === WASHI ? 400 : 500,
        }}
      >
        で
      </div>
      {!compact && (
        <div
          style={{
            marginTop: 18,
            color: v.textTertiary,
            fontFamily: v.uiFont,
            fontSize: 12,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          Prompt
        </div>
      )}
    </div>
  );
}

function MockInput({
  v,
  compact = false,
}: {
  v: VariantTokens;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        background: v === WASHI ? v.surfaceElevated : v.surface,
        borderRadius: v.radius * (compact ? 1.5 : 2),
        border: `1px solid ${v.stroke}`,
        padding: compact ? "14px 16px" : "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          color: v.textTertiary,
          fontFamily: v.uiFont,
          fontSize: compact ? 16 : 20,
          flex: 1,
        }}
      >
        Type romaji…
      </div>
      <div
        style={{
          background: v.accent,
          color: v === WASHI ? "#FFFDF7" : "#0B0C12",
          fontFamily: v.uiFont,
          fontWeight: 600,
          fontSize: compact ? 12 : 13,
          padding: compact ? "6px 12px" : "8px 16px",
          borderRadius: v.radius,
        }}
      >
        Check
      </div>
    </div>
  );
}

function MockKeyboardHint({ v }: { v: VariantTokens }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        color: v.textTertiary,
        fontFamily: v.uiFont,
        fontSize: 12,
      }}
    >
      <Kbd v={v}>Enter</Kbd>
      <span>check</span>
      <span style={{ color: v.strokeSubtle }}>·</span>
      <Kbd v={v}>Tab</Kbd>
      <span>peek English</span>
    </div>
  );
}

function Kbd({ v, children }: { v: VariantTokens; children: ReactNode }) {
  return (
    <span
      style={{
        fontFamily:
          v === WASHI
            ? '"JetBrains Mono", ui-monospace, monospace'
            : '"JetBrains Mono", ui-monospace, monospace',
        background: v.surface,
        border: `1px solid ${v.stroke}`,
        color: v.textSecondary,
        borderRadius: v.radius / 1.5,
        padding: "2px 8px",
        fontSize: 11,
      }}
    >
      {children}
    </span>
  );
}

function MockChip({ v, label }: { v: VariantTokens; label: string }) {
  return (
    <span
      style={{
        fontFamily: v.uiFont,
        fontSize: 12,
        color: v === WASHI ? v.accent : v.accent,
        background: v.accentSoft,
        border:
          v === WASHI ? `1px solid ${v.accent}33` : `1px solid ${v.accent}55`,
        borderRadius: 999,
        padding: "4px 10px",
        fontWeight: 600,
        letterSpacing: 0.2,
      }}
    >
      {label}
    </span>
  );
}

function MockHistoryStrip({ v }: { v: VariantTokens }) {
  const items = [
    { prompt: "さ", answer: "sa", ok: true },
    { prompt: "ち", answer: "chi", ok: true },
    { prompt: "ね", answer: "no", ok: false },
  ];
  return (
    <Stack gap={6}>
      <div
        style={{
          color: v.textTertiary,
          fontFamily: v.uiFont,
          fontSize: 11,
          letterSpacing: 1.1,
          textTransform: "uppercase",
        }}
      >
        Recent
      </div>
      {items.map((it, i) => (
        <HistoryRow key={i} v={v} item={it} />
      ))}
    </Stack>
  );
}

function MockHistoryPanel({ v }: { v: VariantTokens }) {
  const items = [
    { prompt: "さ", answer: "sa", ok: true },
    { prompt: "ち", answer: "chi", ok: true },
    { prompt: "ね", answer: "no", ok: false },
    { prompt: "は", answer: "ha", ok: true },
    { prompt: "む", answer: "mu", ok: true },
    { prompt: "れ", answer: "re", ok: true },
  ];
  return (
    <div
      style={{
        background: v === WASHI ? v.surface : v.surfaceElevated,
        borderRadius: v.radius * 2,
        border: `1px solid ${v.strokeSubtle}`,
        padding: 20,
      }}
    >
      <div
        style={{
          color: v.text,
          fontFamily: v.uiFont,
          fontWeight: 600,
          fontSize: 14,
          marginBottom: 12,
        }}
      >
        Recent questions
      </div>
      <Stack gap={8}>
        {items.map((it, i) => (
          <HistoryRow key={i} v={v} item={it} />
        ))}
      </Stack>
    </div>
  );
}

function HistoryRow({
  v,
  item,
}: {
  v: VariantTokens;
  item: { prompt: string; answer: string; ok: boolean };
}) {
  const toneColor = item.ok ? v.success : v.danger;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: v === WASHI ? v.surfaceElevated : v.surface,
        border: `1px solid ${v.strokeSubtle}`,
        borderLeft: `3px solid ${toneColor}`,
        borderRadius: v.radius,
        padding: "8px 12px",
      }}
    >
      <span
        style={{
          fontFamily: v.kanaFont,
          fontSize: 18,
          color: v.text,
          minWidth: 22,
        }}
      >
        {item.prompt}
      </span>
      <span style={{ color: v.textTertiary, fontFamily: v.uiFont }}>→</span>
      <span
        style={{
          fontFamily: v.uiFont,
          fontSize: 13,
          color: v.text,
          flex: 1,
        }}
      >
        {item.answer}
      </span>
      <span
        style={{
          fontFamily: v.uiFont,
          fontSize: 11,
          color: toneColor,
          fontWeight: 600,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        {item.ok ? "Correct" : "Missed"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Token breakdown
// ---------------------------------------------------------------------------

function TokenBlock({ variant: v }: { variant: VariantTokens }) {
  return (
    <Stack gap={12}>
      <Row gap={10} align="center">
        <H3>{v.name}</H3>
      </Row>
      <SwatchStrip v={v} />
      <Table
        headers={["Token", "Role", "Value"]}
        rows={[
          [<Code>bg</Code>, "Page background", v.bg],
          [<Code>surface</Code>, "Cards / panels", v.surface],
          [<Code>surface.elev</Code>, "Prompt hero", v.surfaceElevated],
          [<Code>stroke</Code>, "Borders", v.stroke],
          [<Code>text.primary</Code>, "Headings, kana", v.text],
          [<Code>text.secondary</Code>, "Body", v.textSecondary],
          [<Code>text.tertiary</Code>, "Hints, labels", v.textTertiary],
          [<Code>accent</Code>, "CTA, focus", v.accent],
          [<Code>success</Code>, "Correct answers", v.success],
          [<Code>danger</Code>, "Missed answers", v.danger],
        ]}
        columnAlign={["left", "left", "right"]}
      />
      <Stack gap={4}>
        <Text size="small" tone="secondary">
          <Text weight="semibold">Kana font:</Text>{" "}
          <Code>{firstFont(v.kanaFont)}</Code>
        </Text>
        <Text size="small" tone="secondary">
          <Text weight="semibold">UI font:</Text>{" "}
          <Code>{firstFont(v.uiFont)}</Code>
        </Text>
        <Text size="small" tone="secondary">
          <Text weight="semibold">Radius scale:</Text> {v.radius}px base,{" "}
          {v.radius * 2}px for hero surfaces
        </Text>
      </Stack>
    </Stack>
  );
}

function SwatchStrip({ v }: { v: VariantTokens }) {
  const swatches: { name: string; color: string }[] = [
    { name: "bg", color: v.bg },
    { name: "surf", color: v.surface },
    { name: "elev", color: v.surfaceElevated },
    { name: "stroke", color: v.stroke },
    { name: "text", color: v.text },
    { name: "accent", color: v.accent },
    { name: "ok", color: v.success },
    { name: "err", color: v.danger },
  ];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {swatches.map((s) => (
        <Swatch key={s.name} v={v} color={s.color} label={s.name} />
      ))}
    </div>
  );
}

function Swatch({
  v,
  color,
  label,
}: {
  v: VariantTokens;
  color: string;
  label: string;
}) {
  const chipStyle: CSSProperties = {
    background: color,
    width: 44,
    height: 28,
    borderRadius: 4,
    border: `1px solid ${v.stroke}`,
  };
  return (
    <Stack gap={4} style={{ alignItems: "center" }}>
      <div style={chipStyle} aria-hidden />
      <Text size="small" tone="tertiary">
        {label}
      </Text>
    </Stack>
  );
}

function firstFont(stack: string): string {
  const first = stack.split(",")[0]?.trim() ?? "";
  return first.replace(/^"|"$/g, "");
}

// ---------------------------------------------------------------------------
// Theme skeleton code
// ---------------------------------------------------------------------------

const washiThemeCode = `import { createTheme } from "@mui/material/styles";

export const washiTheme = createTheme({
  palette: {
    mode: "light",
    background: { default: "${WASHI.bg}", paper: "${WASHI.surface}" },
    primary:    { main: "${WASHI.accent}", contrastText: "#FFFDF7" },
    text:       { primary: "${WASHI.text}", secondary: "${WASHI.textSecondary}" },
    divider:    "${WASHI.stroke}",
    success:    { main: "${WASHI.success}" },
    error:      { main: "${WASHI.danger}" },
  },
  shape: { borderRadius: ${WASHI.radius} },
  typography: {
    fontFamily: '${WASHI.uiFont}',
    h1: { fontFamily: '${WASHI.kanaFont}', fontWeight: 500 },
    h2: { fontFamily: '${WASHI.kanaFont}', fontWeight: 500 },
  },
  components: {
    MuiPaper:  { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiButton: { defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: ${WASHI.radius}, textTransform: "none" } } },
  },
});
`;

const darkThemeCode = `import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "${DARK.bg}", paper: "${DARK.surface}" },
    primary:    { main: "${DARK.accent}", contrastText: "#0B0C12" },
    text:       { primary: "${DARK.text}", secondary: "${DARK.textSecondary}" },
    divider:    "${DARK.stroke}",
    success:    { main: "${DARK.success}" },
    error:      { main: "${DARK.danger}" },
  },
  shape: { borderRadius: ${DARK.radius} },
  typography: {
    fontFamily: '${DARK.uiFont}',
    h1: { fontFamily: '${DARK.kanaFont}', fontWeight: 600, letterSpacing: -0.5 },
    h2: { fontFamily: '${DARK.kanaFont}', fontWeight: 600, letterSpacing: -0.3 },
  },
  components: {
    MuiPaper:  { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiButton: { defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: ${DARK.radius}, textTransform: "none" } } },
  },
});
`;

function ThemeCodeBlock({
  code,
  variant: v,
}: {
  code: string;
  variant: VariantTokens;
}) {
  return (
    <pre
      style={{
        margin: 0,
        padding: 16,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 11.5,
        lineHeight: 1.55,
        color: v.text,
        background: v.surface,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: "auto",
        whiteSpace: "pre",
      }}
    >
      {code}
    </pre>
  );
}
