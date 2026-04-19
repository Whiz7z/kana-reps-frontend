import type { CSSProperties, ReactNode } from "react";
import {
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
// Reuses the Washi + Dark token pair shared across the redesign canvases.
// Both keep the small 6px radius the user asked for. Literal hex values are
// the deliverable here; canvas host tokens wrap only the outer frames.
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
  accentContrast: string;
  success: string;
  danger: string;
  kanaFont: string;
  uiFont: string;
  radius: number;
};

const WASHI: VariantTokens = {
  name: "Minimal 和紙",
  subtitle: "Warm paper, sumi ink, vermillion accent",
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
  accentContrast: "#FFFDF7",
  success: "#4F7A4B",
  danger: "#B13A2F",
  kanaFont: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif',
  uiFont: '"Inter", "Noto Sans JP", system-ui, sans-serif',
  radius: 6,
};

const DARK: VariantTokens = {
  name: "Modern Dark",
  subtitle: "Near-black canvas, violet accent, small radius",
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
  accentContrast: "#0B0C12",
  success: "#4ADE80",
  danger: "#F87171",
  kanaFont: '"Zen Kaku Gothic New", "Noto Sans JP", system-ui, sans-serif',
  uiFont: '"Inter", "SF Pro Display", system-ui, sans-serif',
  radius: 6,
};

// ---------------------------------------------------------------------------
// Illustrative kana + fake stats. Picks a few rows of the Gojūon so the
// mock looks like a real picker, not a placeholder grid.
// ---------------------------------------------------------------------------

type CellDatum = {
  char: string;
  romaji: string;
  selected?: boolean;
  stats?: { correct: number; wrong: number };
};

type RowDatum = {
  label: string;
  cells: (CellDatum | null)[];
};

const BASIC_ROWS_H: RowDatum[] = [
  {
    label: "a",
    cells: [
      { char: "あ", romaji: "a", selected: true, stats: { correct: 12, wrong: 2 } },
      { char: "い", romaji: "i", selected: true, stats: { correct: 9, wrong: 1 } },
      { char: "う", romaji: "u", selected: true, stats: { correct: 7, wrong: 3 } },
      { char: "え", romaji: "e", selected: true, stats: { correct: 4, wrong: 4 } },
      { char: "お", romaji: "o", selected: true, stats: { correct: 10, wrong: 1 } },
    ],
  },
  {
    label: "k",
    cells: [
      { char: "か", romaji: "ka", selected: true, stats: { correct: 8, wrong: 1 } },
      { char: "き", romaji: "ki", stats: { correct: 3, wrong: 5 } },
      { char: "く", romaji: "ku", selected: true, stats: { correct: 6, wrong: 2 } },
      { char: "け", romaji: "ke" },
      { char: "こ", romaji: "ko", selected: true, stats: { correct: 11, wrong: 0 } },
    ],
  },
  {
    label: "s",
    cells: [
      { char: "さ", romaji: "sa", stats: { correct: 5, wrong: 3 } },
      { char: "し", romaji: "shi", selected: true, stats: { correct: 14, wrong: 1 } },
      { char: "す", romaji: "su" },
      { char: "せ", romaji: "se", stats: { correct: 2, wrong: 6 } },
      { char: "そ", romaji: "so" },
    ],
  },
  {
    label: "t",
    cells: [
      { char: "た", romaji: "ta", selected: true },
      { char: "ち", romaji: "chi", selected: true, stats: { correct: 8, wrong: 2 } },
      { char: "つ", romaji: "tsu" },
      { char: "て", romaji: "te", stats: { correct: 6, wrong: 2 } },
      { char: "と", romaji: "to", selected: true },
    ],
  },
];

const BASIC_ROWS_K: RowDatum[] = [
  {
    label: "a",
    cells: [
      { char: "ア", romaji: "a", stats: { correct: 4, wrong: 2 } },
      { char: "イ", romaji: "i" },
      { char: "ウ", romaji: "u", selected: true, stats: { correct: 6, wrong: 0 } },
      { char: "エ", romaji: "e" },
      { char: "オ", romaji: "o", stats: { correct: 3, wrong: 1 } },
    ],
  },
  {
    label: "k",
    cells: [
      { char: "カ", romaji: "ka" },
      { char: "キ", romaji: "ki", selected: true },
      { char: "ク", romaji: "ku" },
      { char: "ケ", romaji: "ke", stats: { correct: 1, wrong: 4 } },
      { char: "コ", romaji: "ko" },
    ],
  },
];

export default function CustomScreenRedesign() {
  const { tokens: t } = useHostTheme();
  const [focused, setFocused] = useCanvasState<"washi" | "dark">(
    "custom-focused-variant",
    "washi"
  );
  const focusedTokens = focused === "washi" ? WASHI : DARK;

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Custom Kana Picker — Two Directions</H1>
        <Text tone="secondary">
          The picker is the most information-dense screen in the app — every
          cell carries a kana, a romaji, and optional accuracy stats. These
          mocks focus the design system there: cell states, accordion chrome,
          the sticky toolbar, and the bottom CTA.
        </Text>
      </Stack>

      <H2>Side-by-side comparison</H2>
      <Grid columns={2} gap={20} align="start">
        <VariantFrame variant={WASHI} tokens={t}>
          <CustomMock variant={WASHI} />
        </VariantFrame>
        <VariantFrame variant={DARK} tokens={t}>
          <CustomMock variant={DARK} />
        </VariantFrame>
      </Grid>

      <Divider />

      <Stack gap={12}>
        <H2>Focused preview</H2>
        <Text tone="secondary">
          Full layout at actual-size spacing. Both Hiragana and Katakana
          columns, with accuracy stats visible on practiced cells, the sticky
          toolbar pinned at the top, and the bottom action bar pinned below.
        </Text>
        <Row gap={8}>
          <Pill
            active={focused === "washi"}
            onClick={() => setFocused("washi")}
          >
            Minimal 和紙
          </Pill>
          <Pill active={focused === "dark"} onClick={() => setFocused("dark")}>
            Modern Dark
          </Pill>
        </Row>
        <div
          style={{
            background: focusedTokens.bg,
            borderRadius: 12,
            border: `1px solid ${t.stroke.primary}`,
            padding: 28,
          }}
        >
          <CustomFocusedMock variant={focusedTokens} />
        </div>
      </Stack>

      <Divider />

      <H2>Cell states</H2>
      <Text tone="secondary">
        Four core states drive everything. Accuracy bars stay compact (2px
        stroke) so a full grid doesn't feel busy.
      </Text>
      <Grid columns={2} gap={20} align="start">
        <CellStatesShowcase variant={WASHI} />
        <CellStatesShowcase variant={DARK} />
      </Grid>

      <Divider />

      <H2>Design decisions</H2>
      <Grid columns={2} gap={20} align="start">
        <Stack gap={8}>
          <H3>Selected cells</H3>
          <Text size="small" tone="secondary">
            Filled with the solid accent, no glow / shadow. The kana character
            stays legible on the accent color — we don't rely on weight tricks
            to make selection pop.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Accuracy stats</H3>
          <Text size="small" tone="secondary">
            A thin 2px success/danger bar under each practiced cell plus a
            percentage. Replaces the three-element "% / ✓N / ✗N" row with a
            single glanceable token.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Tier accordion</H3>
          <Text size="small" tone="secondary">
            Header shows the tier name, a selection count (e.g.{" "}
            <Code>12 / 46</Code>), and a small <Code>All</Code> /{" "}
            <Code>Clear</Code> toggle. Chevron stays left-aligned for stable
            hit targets on mobile.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Toolbar &amp; bottom bar</H3>
          <Text size="small" tone="secondary">
            Sticky top toolbar holds the bulk actions; a sticky bottom bar
            holds the primary CTA with the live selection count. Both sit flat
            on the background — no blur or translucent scrims.
          </Text>
        </Stack>
      </Grid>

      <Divider />

      <H2>Token recap</H2>
      <Grid columns={2} gap={20} align="start">
        <TokenBlock variant={WASHI} />
        <TokenBlock variant={DARK} />
      </Grid>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Mocks
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
      <Stack gap={2}>
        <Text weight="semibold">{variant.name}</Text>
        <Text size="small" tone="secondary">
          {variant.subtitle}
        </Text>
      </Stack>
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

function CustomMock({ variant: v }: { variant: VariantTokens }) {
  return (
    <Stack gap={12}>
      <MockHeader v={v} compact />
      <MockToolbar v={v} compact />
      <MockAccordion v={v} title="Basic" count={{ done: 12, total: 46 }} compact>
        <MockKanaRow v={v} row={BASIC_ROWS_H[0]!} compact />
        <MockKanaRow v={v} row={BASIC_ROWS_H[1]!} compact />
      </MockAccordion>
      <MockBottomBar v={v} selectedCount={12} compact />
    </Stack>
  );
}

function CustomFocusedMock({ variant: v }: { variant: VariantTokens }) {
  return (
    <Stack gap={16}>
      <MockHeader v={v} />
      <MockModePicker v={v} />
      <MockToolbar v={v} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <ScriptColumn v={v} script="hiragana" rows={BASIC_ROWS_H} />
        <ScriptColumn v={v} script="katakana" rows={BASIC_ROWS_K} />
      </div>
      <MockBottomBar v={v} selectedCount={18} />
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Header, mode picker, toolbar, bottom bar
// ---------------------------------------------------------------------------

function MockHeader({
  v,
  compact = false,
}: {
  v: VariantTokens;
  compact?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        aria-hidden
        style={{
          width: compact ? 28 : 32,
          height: compact ? 28 : 32,
          borderRadius: v.radius,
          border: `1px solid ${v.stroke}`,
          background: v.surface,
          color: v.textSecondary,
          fontFamily: v.uiFont,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        ←
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: v.text,
            fontFamily: v.kanaFont,
            fontWeight: 600,
            fontSize: compact ? 16 : 22,
            letterSpacing: v === WASHI ? "-0.005em" : "-0.015em",
          }}
        >
          Custom set
        </div>
        <div
          style={{
            color: v.textSecondary,
            fontFamily: v.uiFont,
            fontSize: compact ? 11 : 13,
            marginTop: 2,
          }}
        >
          18 kana selected ·{" "}
          <span style={{ color: v.text, fontWeight: 600 }}>12 Hiragana</span>
          {" · "}
          <span style={{ color: v.text, fontWeight: 600 }}>6 Katakana</span>
        </div>
      </div>
    </div>
  );
}

function MockModePicker({ v }: { v: VariantTokens }) {
  return (
    <div
      style={{
        background: v.surface,
        border: `1px solid ${v.stroke}`,
        borderRadius: v.radius,
        padding: 14,
      }}
    >
      <div
        style={{
          color: v.textTertiary,
          fontFamily: v.uiFont,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Practice mode
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
      >
        <ModeChip v={v} active>
          Kana → Romaji
        </ModeChip>
        <ModeChip v={v}>Romaji → Kana</ModeChip>
        <div style={{ gridColumn: "1 / -1" }}>
          <ModeChip v={v}>Writing</ModeChip>
        </div>
      </div>
    </div>
  );
}

function ModeChip({
  v,
  active = false,
  children,
}: {
  v: VariantTokens;
  active?: boolean;
  children: ReactNode;
}) {
  const style: CSSProperties = active
    ? {
        background: v.accent,
        color: v.accentContrast,
        border: `1px solid ${v.accent}`,
      }
    : {
        background: v.surfaceElevated,
        color: v.textSecondary,
        border: `1px solid ${v.stroke}`,
      };
  return (
    <div
      style={{
        ...style,
        borderRadius: v.radius,
        padding: "10px 12px",
        fontFamily: v.uiFont,
        fontSize: 13,
        fontWeight: 600,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

function MockToolbar({
  v,
  compact = false,
}: {
  v: VariantTokens;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        background: v.surface,
        border: `1px solid ${v.stroke}`,
        borderRadius: v.radius,
        padding: compact ? "8px 10px" : "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          color: v.textSecondary,
          fontFamily: v.uiFont,
          fontSize: compact ? 11 : 12,
        }}
      >
        Tier and row controls for quick selection
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <ToolbarButton v={v} primary compact={compact}>
          Select all
        </ToolbarButton>
        <ToolbarButton v={v} compact={compact}>
          Clear
        </ToolbarButton>
      </div>
    </div>
  );
}

function ToolbarButton({
  v,
  primary = false,
  compact = false,
  children,
}: {
  v: VariantTokens;
  primary?: boolean;
  compact?: boolean;
  children: ReactNode;
}) {
  const style: CSSProperties = primary
    ? {
        background: v.accent,
        color: v.accentContrast,
        border: `1px solid ${v.accent}`,
      }
    : {
        background: v.surfaceElevated,
        color: v.textSecondary,
        border: `1px solid ${v.stroke}`,
      };
  return (
    <div
      style={{
        ...style,
        borderRadius: v.radius,
        padding: compact ? "5px 10px" : "6px 12px",
        fontFamily: v.uiFont,
        fontSize: compact ? 11 : 12,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

function MockBottomBar({
  v,
  selectedCount,
  compact = false,
}: {
  v: VariantTokens;
  selectedCount: number;
  compact?: boolean;
}) {
  const disabled = selectedCount === 0;
  return (
    <div
      style={{
        background: v.surface,
        borderTop: `1px solid ${v.stroke}`,
        borderRadius: v.radius,
        padding: compact ? "10px 12px" : "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          color: v.textSecondary,
          fontFamily: v.uiFont,
          fontSize: compact ? 11 : 13,
          flex: 1,
        }}
      >
        <span style={{ color: v.text, fontWeight: 600 }}>{selectedCount}</span>{" "}
        kana ready
      </div>
      <div
        style={{
          background: disabled ? v.stroke : v.accent,
          color: disabled ? v.textTertiary : v.accentContrast,
          fontFamily: v.uiFont,
          fontWeight: 700,
          fontSize: compact ? 12 : 14,
          padding: compact ? "8px 14px" : "11px 20px",
          borderRadius: v.radius,
          letterSpacing: 0.2,
        }}
      >
        Start practice
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Accordion + kana grid
// ---------------------------------------------------------------------------

function ScriptColumn({
  v,
  script,
  rows,
}: {
  v: VariantTokens;
  script: "hiragana" | "katakana";
  rows: RowDatum[];
}) {
  const scriptLabel =
    script === "hiragana" ? "Hiragana ひらがな" : "Katakana カタカナ";
  const selectedInTier = rows.reduce(
    (acc, r) => acc + r.cells.filter((c) => c?.selected).length,
    0
  );
  const totalInTier = rows.reduce(
    (acc, r) => acc + r.cells.filter((c) => c !== null).length,
    0
  );
  return (
    <div
      style={{
        background: v.surface,
        border: `1px solid ${v.stroke}`,
        borderRadius: v.radius,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          color: v.text,
          fontFamily: v.kanaFont,
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        {scriptLabel}
      </div>
      <MockAccordion
        v={v}
        title="Basic"
        count={{ done: selectedInTier, total: totalInTier }}
      >
        {rows.map((r) => (
          <MockKanaRow key={r.label} v={v} row={r} />
        ))}
      </MockAccordion>
      <MockAccordionCollapsed v={v} title="Dakuten & Handakuten" />
      <MockAccordionCollapsed v={v} title="Yōon" />
    </div>
  );
}

function MockAccordion({
  v,
  title,
  count,
  compact = false,
  children,
}: {
  v: VariantTokens;
  title: string;
  count: { done: number; total: number };
  compact?: boolean;
  children: ReactNode;
}) {
  const allOn = count.done === count.total && count.total > 0;
  return (
    <div
      style={{
        background: v.surfaceElevated,
        border: `1px solid ${v.strokeSubtle}`,
        borderRadius: v.radius,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: compact ? "7px 10px" : "9px 12px",
          borderBottom: `1px solid ${v.strokeSubtle}`,
          background: v === WASHI ? v.surface : v.surfaceElevated,
        }}
      >
        <span
          aria-hidden
          style={{
            color: v.accent,
            fontFamily: v.uiFont,
            fontSize: 11,
            transform: "rotate(90deg)",
            display: "inline-block",
            width: 10,
            textAlign: "center",
          }}
        >
          ›
        </span>
        <span
          style={{
            color: v.text,
            fontFamily: v.uiFont,
            fontSize: compact ? 12 : 13,
            fontWeight: 600,
            flex: 1,
          }}
        >
          {title}
        </span>
        <span
          style={{
            color: v.textTertiary,
            fontFamily: v.uiFont,
            fontSize: 11,
            letterSpacing: 0.2,
          }}
        >
          {count.done} / {count.total}
        </span>
        <span
          style={{
            background: allOn ? v.surfaceElevated : v.accent,
            color: allOn ? v.textSecondary : v.accentContrast,
            border: allOn ? `1px solid ${v.stroke}` : `1px solid ${v.accent}`,
            borderRadius: v.radius,
            padding: "2px 8px",
            fontFamily: v.uiFont,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {allOn ? "Clear" : "All"}
        </span>
      </div>
      <div style={{ padding: compact ? 6 : 8 }}>{children}</div>
    </div>
  );
}

function MockAccordionCollapsed({
  v,
  title,
}: {
  v: VariantTokens;
  title: string;
}) {
  return (
    <div
      style={{
        background: v.surfaceElevated,
        border: `1px solid ${v.strokeSubtle}`,
        borderRadius: v.radius,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 12px",
      }}
    >
      <span
        aria-hidden
        style={{
          color: v.textTertiary,
          fontFamily: v.uiFont,
          fontSize: 11,
          width: 10,
          textAlign: "center",
        }}
      >
        ›
      </span>
      <span
        style={{
          color: v.textSecondary,
          fontFamily: v.uiFont,
          fontSize: 13,
          fontWeight: 600,
          flex: 1,
        }}
      >
        {title}
      </span>
      <span
        style={{
          color: v.textTertiary,
          fontFamily: v.uiFont,
          fontSize: 11,
        }}
      >
        — collapsed
      </span>
    </div>
  );
}

function MockKanaRow({
  v,
  row,
  compact = false,
}: {
  v: VariantTokens;
  row: RowDatum;
  compact?: boolean;
}) {
  const present = row.cells.filter((c): c is CellDatum => c !== null);
  const allOn = present.length > 0 && present.every((c) => c.selected);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `20px repeat(${row.cells.length}, minmax(0, 1fr)) 24px`,
        gap: compact ? 4 : 6,
        alignItems: "start",
        padding: compact ? "2px 2px" : "3px 2px",
      }}
    >
      <div
        style={{
          color: v.textTertiary,
          fontFamily: v.uiFont,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          paddingTop: 6,
          textAlign: "right",
        }}
      >
        {row.label}
      </div>
      {row.cells.map((cell, i) => (
        <KanaCell
          key={i}
          v={v}
          cell={cell}
          compact={compact}
        />
      ))}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: 6,
        }}
      >
        <RowSelectAll v={v} allOn={allOn} />
      </div>
    </div>
  );
}

function RowSelectAll({ v, allOn }: { v: VariantTokens; allOn: boolean }) {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: v.radius,
        background: allOn ? v.accent : "transparent",
        border: `1px solid ${allOn ? v.accent : v.stroke}`,
        color: allOn ? v.accentContrast : v.textTertiary,
        fontFamily: v.uiFont,
        fontSize: 11,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title={allOn ? "Clear row" : "Select row"}
    >
      ✓
    </div>
  );
}

function KanaCell({
  v,
  cell,
  compact = false,
}: {
  v: VariantTokens;
  cell: CellDatum | null;
  compact?: boolean;
}) {
  if (!cell) {
    return (
      <div
        aria-hidden
        style={{
          minHeight: compact ? 36 : 44,
          borderRadius: v.radius,
          border: `1px dashed ${v.strokeSubtle}`,
        }}
      />
    );
  }
  const selected = !!cell.selected;
  const cellStyle: CSSProperties = selected
    ? {
        background: v.accent,
        border: `1px solid ${v.accent}`,
        color: v.accentContrast,
      }
    : {
        background: v.surface,
        border: `1px solid ${v.stroke}`,
        color: v.text,
      };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div
        style={{
          ...cellStyle,
          borderRadius: v.radius,
          padding: compact ? "4px 2px 3px" : "5px 3px 4px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: compact ? 36 : 44,
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontFamily: v.kanaFont,
            fontSize: compact ? 16 : 20,
            fontWeight: v === WASHI ? 500 : 500,
          }}
        >
          {cell.char}
        </span>
        <span
          style={{
            fontFamily: v.uiFont,
            fontSize: compact ? 8 : 9,
            fontWeight: 500,
            letterSpacing: 0.3,
            opacity: selected ? 0.85 : 0.6,
            marginTop: compact ? 1 : 2,
          }}
        >
          {cell.romaji}
        </span>
      </div>
      {cell.stats && <AccuracyBar v={v} stats={cell.stats} compact={compact} />}
    </div>
  );
}

function AccuracyBar({
  v,
  stats,
  compact = false,
}: {
  v: VariantTokens;
  stats: { correct: number; wrong: number };
  compact?: boolean;
}) {
  const total = stats.correct + stats.wrong;
  const pct = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
  const correctPct = total > 0 ? (stats.correct / total) * 100 : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <div
        style={{
          height: 2,
          background: v.strokeSubtle,
          borderRadius: 1,
          overflow: "hidden",
          display: "flex",
        }}
        aria-hidden
      >
        <div
          style={{
            width: `${correctPct}%`,
            background: v.success,
          }}
        />
        <div
          style={{
            width: `${100 - correctPct}%`,
            background: v.danger,
          }}
        />
      </div>
      <div
        style={{
          color: v.textTertiary,
          fontFamily: v.uiFont,
          fontSize: compact ? 8 : 9,
          textAlign: "center",
          letterSpacing: 0.3,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {pct}%
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cell-state showcase
// ---------------------------------------------------------------------------

function CellStatesShowcase({ variant: v }: { variant: VariantTokens }) {
  return (
    <Stack gap={10}>
      <Row gap={6} align="center">
        <H3>{v.name}</H3>
      </Row>
      <div
        style={{
          background: v.bg,
          border: `1px solid ${v.stroke}`,
          borderRadius: v.radius,
          padding: 14,
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <StateCell v={v} label="Idle" cell={{ char: "あ", romaji: "a" }} />
        <StateCell
          v={v}
          label="Practiced"
          cell={{ char: "か", romaji: "ka", stats: { correct: 8, wrong: 2 } }}
        />
        <StateCell
          v={v}
          label="Selected"
          cell={{ char: "し", romaji: "shi", selected: true }}
        />
        <StateCell
          v={v}
          label="Selected · stats"
          cell={{
            char: "と",
            romaji: "to",
            selected: true,
            stats: { correct: 11, wrong: 0 },
          }}
        />
      </div>
    </Stack>
  );
}

function StateCell({
  v,
  label,
  cell,
}: {
  v: VariantTokens;
  label: string;
  cell: CellDatum;
}) {
  return (
    <Stack gap={6} style={{ alignItems: "center" }}>
      <div style={{ width: "100%" }}>
        <KanaCell v={v} cell={cell} />
      </div>
      <Text size="small" tone="tertiary">
        {label}
      </Text>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Token recap
// ---------------------------------------------------------------------------

function TokenBlock({ variant: v }: { variant: VariantTokens }) {
  return (
    <Stack gap={12}>
      <H3>{v.name}</H3>
      <SwatchStrip v={v} />
      <Table
        headers={["Token", "Role", "Value"]}
        rows={[
          [<Code>bg</Code>, "Page background", v.bg],
          [<Code>surface</Code>, "Script column, toolbar", v.surface],
          [<Code>surface.elev</Code>, "Idle cell, accordion", v.surfaceElevated],
          [<Code>accent</Code>, "Selected cell fill", v.accent],
          [<Code>accent.soft</Code>, "Active-but-muted states", v.accentSoft],
          [<Code>success</Code>, "Accuracy correct", v.success],
          [<Code>danger</Code>, "Accuracy wrong", v.danger],
          [<Code>text.primary</Code>, "Titles, kana", v.text],
          [<Code>text.tertiary</Code>, "Row labels, counts", v.textTertiary],
        ]}
        columnAlign={["left", "left", "right"]}
      />
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
  return (
    <Stack gap={4} style={{ alignItems: "center" }}>
      <div
        aria-hidden
        style={{
          background: color,
          width: 44,
          height: 28,
          borderRadius: 4,
          border: `1px solid ${v.stroke}`,
        }}
      />
      <Text size="small" tone="tertiary">
        {label}
      </Text>
    </Stack>
  );
}
