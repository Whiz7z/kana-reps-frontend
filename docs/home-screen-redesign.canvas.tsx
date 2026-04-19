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
  kanaFont: '"Zen Kaku Gothic New", "Noto Sans JP", system-ui, sans-serif',
  uiFont: '"Inter", "SF Pro Display", system-ui, sans-serif',
  radius: 6,
};

// ---------------------------------------------------------------------------

type AuthState = "guest" | "user";

export default function HomeScreenRedesign() {
  const { tokens: t } = useHostTheme();
  const [variant, setVariant] = useCanvasState<"washi" | "dark">(
    "home-variant",
    "washi"
  );
  const [auth, setAuth] = useCanvasState<AuthState>("home-auth", "guest");
  const v = variant === "washi" ? WASHI : DARK;

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Landing Page · "/" route</H1>
        <Text tone="secondary">
          The first surface a visitor sees. Minimal marketing: brand mark
          (clickable — routes to <Code>/menu</Code>), tagline, supporting
          description, primary <Code>Start practicing</Code> CTA, and a
          conditional <Code>Sign in with Google</Code> secondary for guests.
          Centered vertically inside the main content area (below the global
          topbar).
        </Text>
      </Stack>

      <H2>Side-by-side comparison</H2>
      <Grid columns={2} gap={20} align="start">
        <VariantFrame variant={WASHI} tokens={t}>
          <HomeMock v={WASHI} auth="guest" />
        </VariantFrame>
        <VariantFrame variant={DARK} tokens={t}>
          <HomeMock v={DARK} auth="guest" />
        </VariantFrame>
      </Grid>

      <Divider />

      <Stack gap={12}>
        <H2>Focused preview</H2>
        <Text tone="secondary">
          Toggle variant and auth state. Authed users skip the Google sign-in
          button; everything else stays identical — the "Start practicing" CTA
          is the primary action for every visitor.
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
            <Pill active={auth === "guest"} onClick={() => setAuth("guest")}>
              Guest
            </Pill>
            <Pill active={auth === "user"} onClick={() => setAuth("user")}>
              Authed
            </Pill>
          </Row>
        </Row>
        <div
          style={{
            background: v.bg,
            borderRadius: 12,
            border: `1px solid ${t.stroke.primary}`,
            overflow: "hidden",
          }}
        >
          <HomeMock v={v} auth={auth} withTopbar tall />
        </div>
      </Stack>

      <Divider />

      <H2>Design decisions</H2>
      <Grid columns={2} gap={20} align="start">
        <Stack gap={8}>
          <H3>Hero as brand beat</H3>
          <Text size="small" tone="secondary">
            The brand wordmark doubles as the hero title — no duplicate logo,
            no "welcome to". Clickable → routes to <Code>/menu</Code> so
            returning users can bypass the CTA. Washi uses the serif{" "}
            <Code>Noto Serif JP</Code> for the title to lean into the
            "paper + ink" feel; Dark keeps Inter semibold and leans on the
            violet accent for weight.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Copy hierarchy</H3>
          <Text size="small" tone="secondary">
            Three lines: title (48–56px) · tagline{" "}
            <Code>Non-stop kana drills</Code> (20px, secondary) · supporting
            description (14–16px, tertiary). Each tier shrinks and fades so
            the eye lands on the CTA, not the copy.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Primary CTA only</H3>
          <Text size="small" tone="secondary">
            One filled button, full-width of the narrow content column
            (max-width ~420px). Secondary Google sign-in only appears for
            guests, with a glyph to anchor provider recognition. The "7 days
            free trial" microcopy sits below, muted, acting as a guarantee
            line — not a second CTA.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Vertical rhythm</H3>
          <Text size="small" tone="secondary">
            Content is vertically centered in the viewport below the topbar
            (<Code>min-height: calc(100vh - 8rem)</Code>). On short viewports
            it collapses to top-aligned with generous <Code>py-10</Code>.
            Keeps the landing from feeling "top-heavy" on desktop without
            breaking mobile.
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
          padding: 0,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Home mock
// ---------------------------------------------------------------------------

function HomeMock({
  v,
  auth,
  withTopbar = true,
  tall = false,
}: {
  v: VariantTokens;
  auth: AuthState;
  withTopbar?: boolean;
  tall?: boolean;
}) {
  return (
    <div style={{ background: v.bg }}>
      {withTopbar && <MiniTopbar v={v} auth={auth} />}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: tall ? "64px 24px" : "40px 20px",
          minHeight: tall ? 420 : undefined,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: 28,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                color: v.accent,
                fontFamily: v === WASHI ? v.kanaFont : v.uiFont,
                fontSize: tall ? 52 : 44,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              KanaReps
            </div>
            <div
              style={{
                color: v.textSecondary,
                fontFamily: v.uiFont,
                fontSize: tall ? 18 : 16,
                fontWeight: 500,
              }}
            >
              Non-stop kana drills
            </div>
            <div
              style={{
                color: v.textTertiary,
                fontFamily: v.uiFont,
                fontSize: 13,
                lineHeight: 1.5,
                maxWidth: 320,
              }}
            >
              Master Japanese Hiragana and Katakana through interactive
              practice
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: 10,
            }}
          >
            <PrimaryButton v={v}>Start practicing</PrimaryButton>
            {auth === "guest" && (
              <SecondaryButton v={v}>
                <GoogleGlyph />
                <span style={{ fontWeight: 600 }}>Sign in with Google</span>
              </SecondaryButton>
            )}
            <div
              style={{
                color: v.textTertiary,
                fontFamily: v.uiFont,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              Get 7 days free trial · No credit card required
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniTopbar({ v, auth }: { v: VariantTokens; auth: AuthState }) {
  const links = ["Menu", "Custom"];
  if (auth === "user") links.push("Profile");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        background: v.surface,
        borderBottom: `1px solid ${v.stroke}`,
      }}
    >
      <div
        style={{
          color: v.accent,
          fontFamily: v.uiFont,
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        KanaReps
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {links.map((l) => (
          <span
            key={l}
            style={{
              padding: "5px 8px",
              borderRadius: v.radius,
              fontFamily: v.uiFont,
              fontSize: 12,
              fontWeight: 500,
              color: v.textSecondary,
            }}
          >
            {l}
          </span>
        ))}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: v.radius,
            border: `1px solid ${v.strokeSubtle}`,
          }}
        />
        <span
          style={{
            padding: "5px 10px",
            borderRadius: v.radius,
            fontFamily: v.uiFont,
            fontSize: 12,
            fontWeight: 600,
            color: v.textSecondary,
            border: `1px solid ${v.strokeSubtle}`,
          }}
        >
          {auth === "guest" ? "Sign in" : "Sign out"}
        </span>
      </div>
    </div>
  );
}

function PrimaryButton({
  v,
  children,
}: {
  v: VariantTokens;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: v.accent,
        color: v.accentContrast,
        padding: "12px 18px",
        borderRadius: v.radius,
        fontFamily: v.uiFont,
        fontSize: 15,
        fontWeight: 600,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

function SecondaryButton({
  v,
  children,
}: {
  v: VariantTokens;
  children: ReactNode;
}) {
  const style: CSSProperties = {
    background: v.surface,
    color: v.text,
    padding: "11px 18px",
    borderRadius: v.radius,
    border: `1px solid ${v.stroke}`,
    fontFamily: v.uiFont,
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  };
  return <div style={style}>{children}</div>;
}

function GoogleGlyph() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------

function TokenBlock({ variant: v }: { variant: VariantTokens }) {
  const rows: [string, string][] = [
    ["bg", v.bg],
    ["surface", v.surface],
    ["stroke", v.stroke],
    ["text", v.text],
    ["textSecondary", v.textSecondary],
    ["accent", v.accent],
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
