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
// Reuses the same Washi + Dark token pair from practice-screen-redesign.
// Literal hex values are the deliverable here, not canvas chrome — the
// canvas host tokens are still used for the outer frames.
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

type PracticeMode = "k2r" | "r2k" | "writing";

export default function MenuScreenRedesign() {
  const { tokens: t } = useHostTheme();
  const [focused, setFocused] = useCanvasState<"washi" | "dark">(
    "menu-focused-variant",
    "washi"
  );
  const focusedTokens = focused === "washi" ? WASHI : DARK;

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Menu Screen — Two Directions</H1>
        <Text tone="secondary">
          Same mode picker + set cards in both styles. Both variants share a
          6px border-radius per your preference — the only real axis of change
          is color and typography.
        </Text>
      </Stack>

      <H2>Side-by-side comparison</H2>
      <Grid columns={2} gap={20} align="start">
        <VariantFrame variant={WASHI} tokens={t}>
          <MenuMock variant={WASHI} />
        </VariantFrame>
        <VariantFrame variant={DARK} tokens={t}>
          <MenuMock variant={DARK} />
        </VariantFrame>
      </Grid>

      <Divider />

      <Stack gap={12}>
        <H2>Focused preview</H2>
        <Text tone="secondary">
          Full layout at actual-size spacing, including both Hiragana and
          Katakana set cards with the faded kana watermark.
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
          <MenuFocusedMock variant={focusedTokens} />
        </div>
      </Stack>

      <Divider />

      <H2>Design decisions</H2>
      <Grid columns={2} gap={20} align="start">
        <Stack gap={8}>
          <H3>Mode picker</H3>
          <Text size="small" tone="secondary">
            Flat segmented chips with a single filled accent for the active
            mode. Writing takes the full row so it reads as a distinct option
            (and the lock state for unsubscribed users is clearer).
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Set cards</H3>
          <Text size="small" tone="secondary">
            Kept the faded kana watermark — it's characteristic and ties the
            design back to Japanese typography. Reduced to ~7% opacity so it
            reads as texture, not as content competing with the buttons.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Level toggles</H3>
          <Text size="small" tone="secondary">
            Small outlined pills, tightly grouped. Active state fills with the
            accent-soft color plus a colored border; inactive stays neutral so
            the eye jumps to what's selected.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Set buttons</H3>
          <Text size="small" tone="secondary">
            Full-width rows with a subtle left border hairline on hover. The
            Custom + Word buttons carry their icons; the preset "First 10 / All"
            buttons stay cleaner without icons to keep visual rhythm tight.
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

function MenuMock({ variant: v }: { variant: VariantTokens }) {
  return (
    <Stack gap={12}>
      <MockStatusRow v={v} compact />
      <MockModePicker v={v} active="k2r" compact />
      <MockQuickAccess v={v} compact />
      <MockSetCard v={v} kind="hiragana" compact />
    </Stack>
  );
}

function MenuFocusedMock({ variant: v }: { variant: VariantTokens }) {
  return (
    <Stack gap={16}>
      <MockStatusRow v={v} />
      <MockModePicker v={v} active="k2r" />
      <MockQuickAccess v={v} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <MockSetCard v={v} kind="hiragana" />
        <MockSetCard v={v} kind="katakana" />
      </div>
    </Stack>
  );
}

function MockStatusRow({
  v,
  compact = false,
}: {
  v: VariantTokens;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div
        style={{
          color: v.textSecondary,
          fontFamily: v.uiFont,
          fontSize: compact ? 11 : 12,
        }}
      >
        Trial ends · Apr 30, 2026
      </div>
      <div
        style={{
          background: v.accent,
          color: v.accentContrast,
          fontFamily: v.uiFont,
          fontWeight: 600,
          fontSize: compact ? 11 : 12,
          padding: compact ? "6px 10px" : "8px 14px",
          borderRadius: v.radius,
        }}
      >
        Get lifetime access
      </div>
    </div>
  );
}

function MockModePicker({
  v,
  active,
  compact = false,
}: {
  v: VariantTokens;
  active: PracticeMode;
  compact?: boolean;
}) {
  return (
    <Panel v={v} compact={compact}>
      <SectionLabel v={v}>Practice mode</SectionLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: compact ? 8 : 10,
        }}
      >
        <ModeChip v={v} active={active === "k2r"} compact={compact}>
          Kana → Romaji
        </ModeChip>
        <ModeChip v={v} active={active === "r2k"} compact={compact}>
          Romaji → Kana
        </ModeChip>
        <div style={{ gridColumn: "1 / -1" }}>
          <ModeChip
            v={v}
            active={active === "writing"}
            compact={compact}
            leading={<FeatherIcon v={v} active={active === "writing"} />}
          >
            Writing
          </ModeChip>
        </div>
      </div>
    </Panel>
  );
}

function MockQuickAccess({
  v,
  compact = false,
}: {
  v: VariantTokens;
  compact?: boolean;
}) {
  return (
    <Panel v={v} compact={compact}>
      <Stack gap={compact ? 8 : 10}>
        <SetRow
          v={v}
          icon={<GridIcon v={v} />}
          title="Custom set"
          subtitle="Pick individual kana"
          compact={compact}
        />
        <SetRow
          v={v}
          icon={<BookIcon v={v} />}
          title="Word practice"
          subtitle="Real Japanese words by theme"
          compact={compact}
        />
      </Stack>
    </Panel>
  );
}

function MockSetCard({
  v,
  kind,
  compact = false,
}: {
  v: VariantTokens;
  kind: "hiragana" | "katakana";
  compact?: boolean;
}) {
  const title = kind === "hiragana" ? "Hiragana sets" : "Katakana sets";
  const watermark = kind === "hiragana" ? "かかか" : "カカカ";
  const firstLabel =
    kind === "hiragana" ? "First 10 Hiragana" : "First 10 Katakana";
  const allLabel = kind === "hiragana" ? "All Hiragana" : "All Katakana";
  const cta =
    kind === "hiragana" ? "Start Hiragana practice" : "Start Katakana practice";
  const activeLevels =
    kind === "hiragana" ? ["Basic"] : ["Basic", "Dakuten"];

  return (
    <div
      style={{
        background: v.surface,
        border: `1px solid ${v.stroke}`,
        borderRadius: v.radius,
        padding: compact ? 16 : 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -24,
          left: -18,
          fontFamily: v.kanaFont,
          fontSize: compact ? 120 : 180,
          fontWeight: 700,
          lineHeight: 1,
          color: v.accent,
          opacity: v === WASHI ? 0.07 : 0.1,
          letterSpacing: -8,
          transform: "rotate(-8deg)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {watermark}
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <SectionLabel v={v}>{title}</SectionLabel>
        <Stack gap={compact ? 8 : 10}>
          <SetRow v={v} title={firstLabel} compact={compact} minimal />
          <SetRow v={v} title={allLabel} compact={compact} minimal />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginTop: compact ? 2 : 4,
            }}
          >
            {["Basic", "Dakuten", "Handakuten", "Yoon"].map((lvl) => (
              <LevelChip
                key={lvl}
                v={v}
                active={activeLevels.includes(lvl)}
                compact={compact}
              >
                {lvl}
              </LevelChip>
            ))}
          </div>
          <PrimaryCTA v={v} compact={compact}>
            {cta}
          </PrimaryCTA>
        </Stack>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

function Panel({
  v,
  compact,
  children,
}: {
  v: VariantTokens;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: v.surface,
        border: `1px solid ${v.stroke}`,
        borderRadius: v.radius,
        padding: compact ? 14 : 18,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({
  v,
  children,
}: {
  v: VariantTokens;
  children: ReactNode;
}) {
  return (
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
      {children}
    </div>
  );
}

function ModeChip({
  v,
  active,
  compact,
  leading,
  children,
}: {
  v: VariantTokens;
  active: boolean;
  compact?: boolean;
  leading?: ReactNode;
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
        padding: compact ? "10px 12px" : "14px 16px",
        fontFamily: v.uiFont,
        fontSize: compact ? 13 : 14,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        textAlign: "center",
      }}
    >
      {leading}
      {children}
    </div>
  );
}

function SetRow({
  v,
  icon,
  title,
  subtitle,
  compact,
  minimal,
}: {
  v: VariantTokens;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  compact?: boolean;
  minimal?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: v.surfaceElevated,
        border: `1px solid ${v.strokeSubtle}`,
        borderRadius: v.radius,
        padding: compact
          ? minimal
            ? "10px 12px"
            : "12px 14px"
          : minimal
            ? "12px 14px"
            : "14px 16px",
      }}
    >
      {icon && (
        <div
          style={{
            color: v.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: v.text,
            fontFamily: v.uiFont,
            fontWeight: 600,
            fontSize: compact ? 13 : 14,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              color: v.textSecondary,
              fontFamily: v.uiFont,
              fontSize: compact ? 11 : 12,
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      <div
        aria-hidden
        style={{
          color: v.textTertiary,
          fontFamily: v.uiFont,
          fontSize: 16,
        }}
      >
        ›
      </div>
    </div>
  );
}

function LevelChip({
  v,
  active,
  compact,
  children,
}: {
  v: VariantTokens;
  active: boolean;
  compact?: boolean;
  children: ReactNode;
}) {
  const style: CSSProperties = active
    ? {
        background: v.accentSoft,
        color: v.accent,
        border: `1px solid ${v.accent}`,
      }
    : {
        background: "transparent",
        color: v.textSecondary,
        border: `1px solid ${v.stroke}`,
      };
  return (
    <span
      style={{
        ...style,
        borderRadius: v.radius,
        padding: compact ? "4px 9px" : "5px 11px",
        fontFamily: v.uiFont,
        fontSize: compact ? 11 : 12,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

function PrimaryCTA({
  v,
  compact,
  children,
}: {
  v: VariantTokens;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: v.accent,
        color: v.accentContrast,
        borderRadius: v.radius,
        padding: compact ? "10px 14px" : "12px 16px",
        fontFamily: v.uiFont,
        fontWeight: 700,
        fontSize: compact ? 13 : 14,
        textAlign: "center",
        letterSpacing: 0.2,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tiny inline icons (SVG, no decoration — structural illustrations)
// ---------------------------------------------------------------------------

function FeatherIcon({
  v,
  active,
}: {
  v: VariantTokens;
  active: boolean;
}) {
  const color = active ? v.accentContrast : v.textSecondary;
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  );
}

function GridIcon({ v }: { v: VariantTokens }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={v.accent}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function BookIcon({ v }: { v: VariantTokens }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={v.accent}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Token recap (reused from Practice canvas, trimmed to menu-relevant roles)
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
          [<Code>surface</Code>, "Section panels", v.surface],
          [<Code>surface.elev</Code>, "Rows / inputs", v.surfaceElevated],
          [<Code>accent</Code>, "Primary CTA, active mode", v.accent],
          [<Code>accent.soft</Code>, "Active level chip fill", v.accentSoft],
          [<Code>stroke</Code>, "Panel borders", v.stroke],
          [<Code>text.primary</Code>, "Titles", v.text],
          [<Code>text.secondary</Code>, "Subtitles", v.textSecondary],
          [<Code>text.tertiary</Code>, "Section labels", v.textTertiary],
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
    { name: "soft", color: v.accentSoft },
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
