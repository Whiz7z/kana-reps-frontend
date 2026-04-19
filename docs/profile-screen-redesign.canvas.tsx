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
  Text,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

// ---------------------------------------------------------------------------
// Shared Washi + Dark palette (same as the other redesign canvases).
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
  inputBg: string;
  inputBgDisabled: string;
  success: string;
  successSoft: string;
  info: string;
  infoSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
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
  inputBg: "#FFFDF7",
  inputBgDisabled: "#EFE7D4",
  success: "#4F7A4B",
  successSoft: "#DDE7CF",
  info: "#3D5A80",
  infoSoft: "#DAE3EE",
  warning: "#A17A2B",
  warningSoft: "#EFE3C2",
  danger: "#B13A2F",
  dangerSoft: "#F1DAD4",
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
  inputBg: "#0F111A",
  inputBgDisabled: "#191C27",
  success: "#4ADE80",
  successSoft: "#14301F",
  info: "#60A5FA",
  infoSoft: "#142238",
  warning: "#FACC15",
  warningSoft: "#2A2410",
  danger: "#F87171",
  dangerSoft: "#2F1618",
  kanaFont: '"Zen Kaku Gothic New", "Noto Sans JP", system-ui, sans-serif',
  uiFont: '"Inter", "SF Pro Display", system-ui, sans-serif',
  radius: 6,
};

// ---------------------------------------------------------------------------

type AccessState =
  | "lifetime"
  | "trial"
  | "expired"
  | "cancelled"
  | "legacy_active";

type StatusTone = "success" | "info" | "warning" | "danger" | "neutral";

const STATUS_MAP: Record<AccessState, { label: string; tone: StatusTone }> = {
  lifetime: { label: "active", tone: "success" },
  legacy_active: { label: "active", tone: "success" },
  trial: { label: "trial", tone: "info" },
  expired: { label: "expired", tone: "danger" },
  cancelled: { label: "cancelled", tone: "neutral" },
};

// ---------------------------------------------------------------------------

export default function ProfileScreenRedesign() {
  const { tokens: t } = useHostTheme();
  const [variant, setVariant] = useCanvasState<"washi" | "dark">(
    "profile-variant",
    "washi"
  );
  const [access, setAccess] = useCanvasState<AccessState>(
    "profile-access",
    "lifetime"
  );
  const v = variant === "washi" ? WASHI : DARK;

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Profile Page</H1>
        <Text tone="secondary">
          User-facing account screen — display name (editable inline with
          save), read-only email, and an access card that changes shape based
          on the subscription/purchase state. Max-width column (~640px),
          centered. Back arrow on top-left returns to <Code>/menu</Code>.
        </Text>
      </Stack>

      <H2>Side-by-side comparison</H2>
      <Grid columns={2} gap={20} align="start">
        <VariantFrame variant={WASHI} tokens={t}>
          <ProfileMock v={WASHI} access="lifetime" compact />
        </VariantFrame>
        <VariantFrame variant={DARK} tokens={t}>
          <ProfileMock v={DARK} access="lifetime" compact />
        </VariantFrame>
      </Grid>

      <Divider />

      <Stack gap={12}>
        <H2>Focused preview</H2>
        <Text tone="secondary">
          Cycle through access states. <Code>Lifetime</Code> shows the
          purchase date and no CTA. <Code>Trial</Code> shows the expiration
          and a primary <Code>Get lifetime access</Code> CTA.{" "}
          <Code>Expired</Code> / <Code>Cancelled</Code> add a warning callout
          above the CTA. <Code>Legacy subscriber</Code> swaps the CTA for a
          secondary <Code>Manage billing</Code>.
        </Text>
        <Row gap={16} wrap>
          <Row gap={8}>
            <Pill
              active={variant === "washi"}
              onClick={() => setVariant("washi")}
            >
              Minimal 和紙
            </Pill>
            <Pill
              active={variant === "dark"}
              onClick={() => setVariant("dark")}
            >
              Modern Dark
            </Pill>
          </Row>
          <Row gap={8}>
            <Pill
              active={access === "lifetime"}
              onClick={() => setAccess("lifetime")}
            >
              Lifetime
            </Pill>
            <Pill
              active={access === "trial"}
              onClick={() => setAccess("trial")}
            >
              Trial
            </Pill>
            <Pill
              active={access === "expired"}
              onClick={() => setAccess("expired")}
            >
              Expired
            </Pill>
            <Pill
              active={access === "cancelled"}
              onClick={() => setAccess("cancelled")}
            >
              Cancelled
            </Pill>
            <Pill
              active={access === "legacy_active"}
              onClick={() => setAccess("legacy_active")}
            >
              Legacy
            </Pill>
          </Row>
        </Row>
        <div
          style={{
            background: v.bg,
            borderRadius: 12,
            border: `1px solid ${t.stroke.primary}`,
            padding: 28,
          }}
        >
          <ProfileMock v={v} access={access} />
        </div>
      </Stack>

      <Divider />

      <H2>Access-card state matrix</H2>
      <Text tone="secondary">
        The Account info card never changes — only the Access card morphs.
        Below: each state rendered in isolation so you can compare at a
        glance. Status badge tone tracks the state; CTA area is where the
        meaningful change lives.
      </Text>
      <Grid columns={2} gap={16} align="start">
        {(
          [
            "lifetime",
            "trial",
            "expired",
            "cancelled",
            "legacy_active",
          ] as AccessState[]
        ).map((s) => (
          <Stack key={s} gap={6}>
            <Text size="small" weight="semibold">
              {labelFor(s)}
            </Text>
            <div
              style={{
                background: v.bg,
                borderRadius: 12,
                border: `1px solid ${t.stroke.primary}`,
                padding: 14,
              }}
            >
              <AccessCard v={v} access={s} />
            </div>
          </Stack>
        ))}
      </Grid>

      <Divider />

      <H2>Design decisions</H2>
      <Grid columns={2} gap={20} align="start">
        <Stack gap={8}>
          <H3>Two-card spine</H3>
          <Text size="small" tone="secondary">
            Profile is two stacked cards: Account and Access. Both use the
            same surface, stroke, and 6px radius — no visual hierarchy
            between them, since users want to reach either with one scroll.
            No heavy shadows; depth comes from stroke + subtle{" "}
            <Code>surfaceElevated</Code> inside the card.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Editable display name</H3>
          <Text size="small" tone="secondary">
            Label on top, input + save button in a flex row. Save button is
            icon-only (square, accent-filled) and only enables when the value
            changes and is non-empty — no separate "Edit" button, no modal.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Read-only email</H3>
          <Text size="small" tone="secondary">
            Rendered as a disabled input rather than plain text so it reads
            as "this is a field, just locked". Subtle <Code>inputBgDisabled</Code>{" "}
            tint differentiates it from the editable one above.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Access card morphs, doesn't swap</H3>
          <Text size="small" tone="secondary">
            Same heading, same status row, same "timestamp" row — only the
            labels, tones, and CTA change. Keeps layout height stable so the
            back arrow and card boundaries don't jump when a user transitions
            from trial to expired.
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

function labelFor(s: AccessState): string {
  switch (s) {
    case "lifetime":
      return "Lifetime owner";
    case "trial":
      return "Trial";
    case "expired":
      return "Expired";
    case "cancelled":
      return "Cancelled";
    case "legacy_active":
      return "Legacy subscriber (active)";
  }
}

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

// ---------------------------------------------------------------------------
// Full profile mock
// ---------------------------------------------------------------------------

function ProfileMock({
  v,
  access,
  compact = false,
}: {
  v: VariantTokens;
  access: AccessState;
  compact?: boolean;
}) {
  return (
    <Stack gap={compact ? 14 : 18}>
      <PageHeader v={v} compact={compact} />
      <AccountCard v={v} compact={compact} />
      <AccessCard v={v} access={access} compact={compact} />
    </Stack>
  );
}

function PageHeader({
  v,
  compact,
}: {
  v: VariantTokens;
  compact?: boolean;
}) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: compact ? 10 : 14 }}
    >
      <div
        aria-label="Back to menu"
        style={{
          width: compact ? 32 : 36,
          height: compact ? 32 : 36,
          borderRadius: v.radius,
          border: `1px solid ${v.stroke}`,
          background: v.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: v.textSecondary,
        }}
      >
        <ArrowLeftGlyph />
      </div>
      <div
        style={{
          color: v.accent,
          fontFamily: v === WASHI ? v.kanaFont : v.uiFont,
          fontSize: compact ? 22 : 28,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        Profile
      </div>
    </div>
  );
}

function AccountCard({
  v,
  compact,
}: {
  v: VariantTokens;
  compact?: boolean;
}) {
  return (
    <Card v={v} compact={compact}>
      <CardHeading v={v} icon={<UserGlyph />} compact={compact}>
        Account information
      </CardHeading>
      <div style={{ marginTop: compact ? 12 : 16, display: "grid", gap: 14 }}>
        <Field v={v} label="Display name" compact={compact}>
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                flex: 1,
                background: v.inputBg,
                border: `1px solid ${v.stroke}`,
                borderRadius: v.radius,
                padding: compact ? "7px 10px" : "9px 12px",
                fontFamily: v.uiFont,
                fontSize: 13,
                color: v.text,
              }}
            >
              Євген Євстратов
            </div>
            <div
              aria-label="Save name"
              style={{
                width: compact ? 32 : 38,
                height: compact ? 32 : 38,
                background: v.accentSoft,
                color: v.accent,
                borderRadius: v.radius,
                border: `1px solid ${v.stroke}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SaveGlyph />
            </div>
          </div>
        </Field>
        <Field v={v} label="Email" compact={compact}>
          <div
            style={{
              background: v.inputBgDisabled,
              border: `1px solid ${v.strokeSubtle}`,
              borderRadius: v.radius,
              padding: compact ? "7px 10px" : "9px 12px",
              fontFamily: v.uiFont,
              fontSize: 13,
              color: v.textSecondary,
            }}
          >
            gjevstratov@gmail.com
          </div>
        </Field>
      </div>
    </Card>
  );
}

function AccessCard({
  v,
  access,
  compact,
}: {
  v: VariantTokens;
  access: AccessState;
  compact?: boolean;
}) {
  const isLifetime = access === "lifetime";
  const isLegacy = access === "legacy_active";
  const isTrial = access === "trial";
  const needsUpsell = access === "expired" || access === "cancelled";

  const heading = isLifetime ? "Lifetime access" : "Access";
  const subtitle = isLifetime
    ? "Thanks for supporting KanaReps — you're unlocked forever."
    : isLegacy
    ? "Manage your legacy subscription and billing."
    : "Unlock writing mode, word practice, and unlimited custom sets with a one-time payment.";

  return (
    <Card v={v} compact={compact}>
      <CardHeading v={v} icon={<CardGlyph />} compact={compact}>
        {heading}
      </CardHeading>
      <div
        style={{
          marginTop: 4,
          color: v.textSecondary,
          fontFamily: v.uiFont,
          fontSize: 12,
        }}
      >
        {subtitle}
      </div>
      <div
        style={{
          marginTop: compact ? 12 : 16,
          display: "grid",
          gap: 10,
        }}
      >
        <MetaRow v={v} label="Status" compact={compact}>
          <StatusBadge v={v} access={access} />
        </MetaRow>
        {isLifetime && (
          <MetaRow v={v} label="Purchased" compact={compact}>
            <span
              style={{
                fontFamily: v.uiFont,
                fontSize: 13,
                fontWeight: 600,
                color: v.text,
              }}
            >
              April 19, 2026
            </span>
          </MetaRow>
        )}
        {isTrial && (
          <MetaRow v={v} label="Trial expires" compact={compact}>
            <span
              style={{
                fontFamily: v.uiFont,
                fontSize: 13,
                fontWeight: 600,
                color: v.text,
              }}
            >
              April 26, 2026
            </span>
          </MetaRow>
        )}
        {isLegacy && (
          <MetaRow v={v} label="Next billing" compact={compact}>
            <span
              style={{
                fontFamily: v.uiFont,
                fontSize: 13,
                fontWeight: 600,
                color: v.text,
              }}
            >
              May 19, 2026
            </span>
          </MetaRow>
        )}
        {needsUpsell && (
          <div
            style={{
              background: v.warningSoft,
              border: `1px solid ${v.warning}33`,
              borderRadius: v.radius,
              padding: compact ? "9px 12px" : "11px 14px",
              color: v === WASHI ? "#6A4F1A" : "#EFD98A",
              fontFamily: v.uiFont,
              fontSize: 12,
            }}
          >
            Get lifetime access to keep writing mode and premium sets unlocked
            forever.
          </div>
        )}
        {(isTrial || needsUpsell) && (
          <div style={{ marginTop: 4 }}>
            <CTAButton v={v} compact={compact}>
              Get lifetime access
            </CTAButton>
          </div>
        )}
        {isLegacy && (
          <div style={{ marginTop: 4 }}>
            <SecondaryCTA v={v} compact={compact}>
              Manage billing
            </SecondaryCTA>
          </div>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------

function Card({
  v,
  children,
  compact,
}: {
  v: VariantTokens;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        background: v.surface,
        border: `1px solid ${v.stroke}`,
        borderRadius: v.radius,
        padding: compact ? 14 : 20,
      }}
    >
      {children}
    </div>
  );
}

function CardHeading({
  v,
  icon,
  compact,
  children,
}: {
  v: VariantTokens;
  icon: ReactNode;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: v.accent, display: "flex" }}>{icon}</span>
      <span
        style={{
          color: v.text,
          fontFamily: v.uiFont,
          fontWeight: 600,
          fontSize: compact ? 14 : 15,
        }}
      >
        {children}
      </span>
    </div>
  );
}

function Field({
  v,
  label,
  compact,
  children,
}: {
  v: VariantTokens;
  label: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          color: v.textSecondary,
          fontFamily: v.uiFont,
          fontSize: 12,
          marginBottom: compact ? 4 : 6,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function MetaRow({
  v,
  label,
  children,
  compact,
}: {
  v: VariantTokens;
  label: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        fontFamily: v.uiFont,
        fontSize: compact ? 12 : 13,
      }}
    >
      <span style={{ color: v.textSecondary }}>{label}</span>
      {children}
    </div>
  );
}

function StatusBadge({
  v,
  access,
}: {
  v: VariantTokens;
  access: AccessState;
}) {
  const meta = STATUS_MAP[access];
  const toneColors = toneFor(v, meta.tone);
  return (
    <span
      style={{
        padding: "2px 10px",
        borderRadius: 999,
        fontFamily: v.uiFont,
        fontSize: 11,
        fontWeight: 600,
        background: toneColors.bg,
        color: toneColors.fg,
        border: `1px solid ${toneColors.border}`,
      }}
    >
      {meta.label}
    </span>
  );
}

function toneFor(
  v: VariantTokens,
  tone: StatusTone
): { bg: string; fg: string; border: string } {
  switch (tone) {
    case "success":
      return { bg: v.successSoft, fg: v.success, border: `${v.success}33` };
    case "info":
      return { bg: v.infoSoft, fg: v.info, border: `${v.info}33` };
    case "warning":
      return {
        bg: v.warningSoft,
        fg: v.warning,
        border: `${v.warning}33`,
      };
    case "danger":
      return { bg: v.dangerSoft, fg: v.danger, border: `${v.danger}33` };
    case "neutral":
    default:
      return {
        bg: v.surfaceElevated,
        fg: v.textSecondary,
        border: v.strokeSubtle,
      };
  }
}

function CTAButton({
  v,
  children,
  compact,
}: {
  v: VariantTokens;
  children: ReactNode;
  compact?: boolean;
}) {
  const style: CSSProperties = {
    background: v.accent,
    color: v.accentContrast,
    padding: compact ? "9px 14px" : "11px 16px",
    borderRadius: v.radius,
    fontFamily: v.uiFont,
    fontSize: 13,
    fontWeight: 600,
    textAlign: "center",
  };
  return <div style={style}>{children}</div>;
}

function SecondaryCTA({
  v,
  children,
  compact,
}: {
  v: VariantTokens;
  children: ReactNode;
  compact?: boolean;
}) {
  const style: CSSProperties = {
    background: v.surfaceElevated,
    color: v.text,
    padding: compact ? "9px 14px" : "11px 16px",
    borderRadius: v.radius,
    border: `1px solid ${v.stroke}`,
    fontFamily: v.uiFont,
    fontSize: 13,
    fontWeight: 600,
    textAlign: "center",
  };
  return <div style={style}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Glyphs
// ---------------------------------------------------------------------------

function ArrowLeftGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx={12}
        cy={8}
        r={4}
        stroke="currentColor"
        strokeWidth={1.7}
      />
      <path
        d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}

function CardGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x={3}
        y={6}
        width={18}
        height={12}
        rx={2}
        stroke="currentColor"
        strokeWidth={1.7}
      />
      <path d="M3 10h18" stroke="currentColor" strokeWidth={1.7} />
    </svg>
  );
}

function SaveGlyph() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 3h11l4 4v14H5z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <path
        d="M8 3v5h7V3M8 21v-7h8v7"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------

function TokenBlock({ variant: v }: { variant: VariantTokens }) {
  const rows: [string, string][] = [
    ["surface", v.surface],
    ["stroke", v.stroke],
    ["inputBg", v.inputBg],
    ["inputBgDisabled", v.inputBgDisabled],
    ["accent", v.accent],
    ["accentSoft", v.accentSoft],
    ["success", v.success],
    ["warning", v.warning],
    ["danger", v.danger],
    ["radius", `${v.radius}px`],
  ];
  return (
    <Stack gap={8}>
      <Text weight="semibold">{v.name}</Text>
      <Stack gap={4}>
        {rows.map(([k, val]) => (
          <Row key={k} gap={8} align="center">
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: val.startsWith("#") ? val : v.surface,
                border: `1px solid ${v.strokeSubtle}`,
              }}
            />
            <Text size="small" tone="secondary">
              <Code>{k}</Code> {val}
            </Text>
          </Row>
        ))}
      </Stack>
    </Stack>
  );
}
