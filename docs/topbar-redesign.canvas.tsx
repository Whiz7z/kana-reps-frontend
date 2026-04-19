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
// Literal hex values are the deliverable; canvas host tokens wrap outer chrome.
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
  hoverTint: string;
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
  hoverTint: "#EFE6D2",
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
  hoverTint: "#1B1E2A",
  kanaFont: '"Zen Kaku Gothic New", "Noto Sans JP", system-ui, sans-serif',
  uiFont: '"Inter", "SF Pro Display", system-ui, sans-serif',
  radius: 6,
};

// ---------------------------------------------------------------------------

type AuthState = "guest" | "user" | "admin";

export default function TopbarRedesign() {
  const { tokens: t } = useHostTheme();
  const [variant, setVariant] = useCanvasState<"washi" | "dark">(
    "topbar-variant",
    "washi"
  );
  const [auth, setAuth] = useCanvasState<AuthState>("topbar-auth", "user");
  const [route, setRoute] = useCanvasState<string>("topbar-route", "/menu");
  const v = variant === "washi" ? WASHI : DARK;

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Top Navigation Bar</H1>
        <Text tone="secondary">
          Global header present on every route. Renders the brand mark on the
          left and a grouped nav + auth cluster on the right, with a theme
          toggle wedged between. Visibility of <Code>/profile</Code>,{" "}
          <Code>/admin</Code>, and the sign-in/sign-out control varies with
          auth state — this canvas spreads those states out so you can audit
          the visible-items count and the spacing at each.
        </Text>
      </Stack>

      <H2>Side-by-side comparison</H2>
      <Grid columns={1} gap={20} align="start">
        <VariantFrame variant={WASHI} tokens={t}>
          <TopbarMock v={WASHI} auth="user" active="/menu" />
        </VariantFrame>
        <VariantFrame variant={DARK} tokens={t}>
          <TopbarMock v={DARK} auth="user" active="/menu" />
        </VariantFrame>
      </Grid>

      <Divider />

      <Stack gap={12}>
        <H2>Focused preview</H2>
        <Text tone="secondary">
          Flip auth state and active route to exercise what the topbar renders.
          Guest shows a <Code>Sign in</Code> button and hides{" "}
          <Code>/profile</Code>. Authed user adds <Code>Profile</Code> and a{" "}
          <Code>Sign out</Code> ghost button. Admin adds an{" "}
          <Code>Admin</Code> link before the theme toggle.
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
            <Pill active={auth === "admin"} onClick={() => setAuth("admin")}>
              Admin
            </Pill>
          </Row>
          <Row gap={8}>
            <Pill active={route === "/menu"} onClick={() => setRoute("/menu")}>
              / menu
            </Pill>
            <Pill
              active={route === "/custom"}
              onClick={() => setRoute("/custom")}
            >
              / custom
            </Pill>
            <Pill
              active={route === "/profile"}
              onClick={() => setRoute("/profile")}
            >
              / profile
            </Pill>
          </Row>
        </Row>
        <div
          style={{
            background: v.bg,
            borderRadius: 12,
            border: `1px solid ${t.stroke.primary}`,
            padding: 24,
          }}
        >
          <TopbarMock v={v} auth={auth} active={route} wide />
        </div>
      </Stack>

      <Divider />

      <H2>State matrix</H2>
      <Text tone="secondary">
        All three auth states rendered in the currently selected variant, so
        you can eyeball the spacing deltas. The rightmost cluster grows by one
        item per step: guest (4) → user (6) → admin (7), counting the theme
        toggle.
      </Text>
      <Stack gap={14}>
        <StateRow v={v} auth="guest" active="/menu" label="Guest" />
        <StateRow v={v} auth="user" active="/menu" label="Authed user" />
        <StateRow v={v} auth="admin" active="/menu" label="Admin" />
      </Stack>

      <Divider />

      <H2>Design decisions</H2>
      <Grid columns={2} gap={20} align="start">
        <Stack gap={8}>
          <H3>Brand mark</H3>
          <Text size="small" tone="secondary">
            <Code>KanaReps</Code> wordmark, accent color, semibold. No logo
            glyph to keep the bar calm. Links to <Code>/</Code>. Washi uses the
            vermillion accent; Dark uses violet. Both sit flush-left at the
            max-width container edge.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Nav cluster</H3>
          <Text size="small" tone="secondary">
            Links laid out horizontally with <Code>6–8px</Code> gap. Active
            route uses a filled soft tint; inactive routes get a hover tint
            only. No underline, no dot indicator — the filled chip is enough.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Theme toggle</H3>
          <Text size="small" tone="secondary">
            Square 36×36 button sitting between the nav links and the auth
            button, so it reads as a utility control rather than a nav item.
            Moon icon in light, sun icon in dark.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Auth control</H3>
          <Text size="small" tone="secondary">
            Guest gets a filled <Code>Sign in</Code> secondary button. Authed
            users get a ghost <Code>Sign out</Code> so it doesn't compete with
            the primary CTA on the page below. Admin link sits{" "}
            <Text weight="semibold">before</Text> the theme toggle so the
            toggle always hugs the auth control.
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
          padding: 16,
        }}
      >
        {children}
      </div>
    </Stack>
  );
}

function StateRow({
  v,
  auth,
  active,
  label,
}: {
  v: VariantTokens;
  auth: AuthState;
  active: string;
  label: string;
}) {
  const { tokens: t } = useHostTheme();
  return (
    <Stack gap={6}>
      <Text size="small" tone="secondary">
        {label}
      </Text>
      <div
        style={{
          background: v.bg,
          borderRadius: 12,
          border: `1px solid ${t.stroke.primary}`,
          padding: 12,
        }}
      >
        <TopbarMock v={v} auth={auth} active={active} wide />
      </div>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// The topbar itself
// ---------------------------------------------------------------------------

function TopbarMock({
  v,
  auth,
  active,
  wide = false,
}: {
  v: VariantTokens;
  auth: AuthState;
  active: string;
  wide?: boolean;
}) {
  const navLinks: { href: string; label: string }[] = [
    { href: "/menu", label: "Menu" },
    { href: "/custom", label: "Custom" },
  ];
  if (auth !== "guest") navLinks.push({ href: "/profile", label: "Profile" });
  if (auth === "admin") navLinks.push({ href: "/admin", label: "Admin" });

  return (
    <div
      style={{
        background: v.surface,
        borderBottom: `1px solid ${v.stroke}`,
        borderRadius: v.radius,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: wide ? "12px 24px" : "10px 14px",
        }}
      >
        <BrandMark v={v} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {navLinks.map((l) => (
            <NavLink
              key={l.href}
              v={v}
              label={l.label}
              active={active === l.href}
            />
          ))}
          <ThemeToggle v={v} />
          {auth === "guest" ? (
            <AuthButton v={v} label="Sign in" tone="primary" />
          ) : (
            <AuthButton v={v} label="Sign out" tone="ghost" />
          )}
        </div>
      </div>
    </div>
  );
}

function BrandMark({ v }: { v: VariantTokens }) {
  return (
    <div
      style={{
        color: v.accent,
        fontFamily: v.uiFont,
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "-0.01em",
      }}
    >
      KanaReps
    </div>
  );
}

function NavLink({
  v,
  label,
  active,
}: {
  v: VariantTokens;
  label: string;
  active: boolean;
}) {
  const base: CSSProperties = {
    padding: "6px 10px",
    borderRadius: v.radius,
    fontFamily: v.uiFont,
    fontSize: 13,
    fontWeight: 500,
  };
  if (active) {
    return (
      <span
        style={{
          ...base,
          background: v.accentSoft,
          color: v.accent,
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    );
  }
  return (
    <span
      style={{
        ...base,
        background: "transparent",
        color: v.textSecondary,
      }}
    >
      {label}
    </span>
  );
}

function ThemeToggle({ v }: { v: VariantTokens }) {
  const isLight = v === WASHI;
  return (
    <div
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      style={{
        width: 36,
        height: 36,
        borderRadius: v.radius,
        border: `1px solid ${v.strokeSubtle}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: v.textSecondary,
      }}
    >
      {isLight ? <MoonGlyph /> : <SunGlyph />}
    </div>
  );
}

function AuthButton({
  v,
  label,
  tone,
}: {
  v: VariantTokens;
  label: string;
  tone: "primary" | "ghost";
}) {
  const isPrimary = tone === "primary";
  return (
    <span
      style={{
        padding: "7px 14px",
        borderRadius: v.radius,
        fontFamily: v.uiFont,
        fontSize: 13,
        fontWeight: 600,
        border: isPrimary ? "none" : `1px solid ${v.strokeSubtle}`,
        background: isPrimary ? v.accent : "transparent",
        color: isPrimary ? v.accentContrast : v.textSecondary,
      }}
    >
      {label}
    </span>
  );
}

function MoonGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx={12}
        cy={12}
        r={4}
        stroke="currentColor"
        strokeWidth={1.6}
      />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const rad = (a * Math.PI) / 180;
        const x1 = 12 + Math.cos(rad) * 7;
        const y1 = 12 + Math.sin(rad) * 7;
        const x2 = 12 + Math.cos(rad) * 9.5;
        const y2 = 12 + Math.sin(rad) * 9.5;
        return (
          <line
            key={a}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        );
      })}
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
    ["accent", v.accent],
    ["accentSoft", v.accentSoft],
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
