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
// Shared Washi + Dark palette (kept in sync with the other redesign canvases).
// Both variants use a 6px radius. Literal hex values are the deliverable;
// canvas host tokens only wrap the outer frames.
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
  successSoft: string;
  danger: string;
  disabledBg: string;
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
  successSoft: "#E2ECD9",
  danger: "#B13A2F",
  disabledBg: "#EFE8D8",
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
  successSoft: "#1A2B1F",
  danger: "#F87171",
  disabledBg: "#1A1D28",
  kanaFont: '"Zen Kaku Gothic New", "Noto Sans JP", system-ui, sans-serif',
  uiFont: '"Inter", "SF Pro Display", system-ui, sans-serif',
  radius: 6,
};

// ---------------------------------------------------------------------------
// Illustrative data
// ---------------------------------------------------------------------------

type NavLink = {
  id: string;
  label: string;
  href: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { id: "menu", label: "Menu", href: "/menu" },
  { id: "custom", label: "Custom", href: "/custom" },
  { id: "profile", label: "Profile", href: "/profile", requiresAuth: true },
];

// ---------------------------------------------------------------------------

export default function ShellScreensRedesign() {
  const { tokens: t } = useHostTheme();
  const [focused, setFocused] = useCanvasState<"washi" | "dark">(
    "shell-focused-variant",
    "washi"
  );
  const [surface, setSurface] = useCanvasState<"landing" | "profile" | "nav">(
    "shell-focused-surface",
    "landing"
  );
  const [authed, setAuthed] = useCanvasState<boolean>(
    "shell-focused-authed",
    true
  );
  const [activeRoute, setActiveRoute] = useCanvasState<string>(
    "shell-focused-route",
    "/profile"
  );
  const v = focused === "washi" ? WASHI : DARK;

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>App Shell — Nav, Landing, Profile</H1>
        <Text tone="secondary">
          Three surfaces that frame every other page: the top navigation bar
          (persistent), the <Code>/</Code> landing page (entry point), and the
          Profile page (account + lifetime access). Redesigned to match the
          Washi Minimal light theme and the Modern Dark theme with the shared
          6px radius and the same flat hairline borders.
        </Text>
      </Stack>

      <H2>Nav bar — side-by-side</H2>
      <Text size="small" tone="secondary">
        Persistent header. Logged-in state shown with an active route indicator
        (underline) and a visible Sign out action. The theme toggle is an
        icon-only ghost button with a 6px radius.
      </Text>
      <Grid columns={1} gap={16} align="start">
        <NavFrame variant={WASHI} tokens={t}>
          <NavBarMock v={WASHI} authed active="/profile" />
        </NavFrame>
        <NavFrame variant={DARK} tokens={t}>
          <NavBarMock v={DARK} authed active="/profile" />
        </NavFrame>
      </Grid>
      <Grid columns={1} gap={16} align="start">
        <NavFrame variant={WASHI} tokens={t} label="Signed out">
          <NavBarMock v={WASHI} authed={false} active="/" />
        </NavFrame>
        <NavFrame variant={DARK} tokens={t} label="Signed out">
          <NavBarMock v={DARK} authed={false} active="/" />
        </NavFrame>
      </Grid>

      <Divider />

      <H2>Landing page — side-by-side</H2>
      <Grid columns={2} gap={20} align="start">
        <VariantFrame variant={WASHI} tokens={t}>
          <LandingMock v={WASHI} authed={false} />
        </VariantFrame>
        <VariantFrame variant={DARK} tokens={t}>
          <LandingMock v={DARK} authed={false} />
        </VariantFrame>
      </Grid>

      <Divider />

      <H2>Profile page — side-by-side</H2>
      <Grid columns={2} gap={20} align="start">
        <VariantFrame variant={WASHI} tokens={t}>
          <ProfileMock v={WASHI} />
        </VariantFrame>
        <VariantFrame variant={DARK} tokens={t}>
          <ProfileMock v={DARK} />
        </VariantFrame>
      </Grid>

      <Divider />

      <Stack gap={12}>
        <H2>Focused preview</H2>
        <Text tone="secondary">
          Toggle the variant, surface, and auth state (for nav + landing). Nav
          also lets you switch the active route so you can see the indicator
          move.
        </Text>
        <Row gap={16} wrap>
          <Row gap={8}>
            <Pill
              active={focused === "washi"}
              onClick={() => setFocused("washi")}
            >
              Minimal 和紙
            </Pill>
            <Pill
              active={focused === "dark"}
              onClick={() => setFocused("dark")}
            >
              Modern Dark
            </Pill>
          </Row>
          <Row gap={8}>
            <Pill
              active={surface === "landing"}
              onClick={() => setSurface("landing")}
            >
              Landing
            </Pill>
            <Pill
              active={surface === "profile"}
              onClick={() => setSurface("profile")}
            >
              Profile
            </Pill>
            <Pill active={surface === "nav"} onClick={() => setSurface("nav")}>
              Nav only
            </Pill>
          </Row>
          <Row gap={8}>
            <Pill active={authed} onClick={() => setAuthed(true)}>
              Signed in
            </Pill>
            <Pill active={!authed} onClick={() => setAuthed(false)}>
              Signed out
            </Pill>
          </Row>
          {surface === "nav" && (
            <Row gap={8}>
              {["/", "/menu", "/custom", "/profile"].map((r) => (
                <Pill
                  key={r}
                  active={activeRoute === r}
                  onClick={() => setActiveRoute(r)}
                >
                  {r}
                </Pill>
              ))}
            </Row>
          )}
        </Row>
        <div
          style={{
            background: v.bg,
            borderRadius: 12,
            border: `1px solid ${t.stroke.primary}`,
            padding: 0,
            overflow: "hidden",
          }}
        >
          <NavBarMock
            v={v}
            authed={authed}
            active={
              surface === "nav"
                ? activeRoute
                : surface === "profile"
                  ? "/profile"
                  : "/"
            }
          />
          {surface === "landing" && (
            <div style={{ padding: "64px 32px 48px" }}>
              <LandingMock v={v} authed={authed} large />
            </div>
          )}
          {surface === "profile" && (
            <div style={{ padding: "32px 32px 48px" }}>
              <ProfileMock v={v} large />
            </div>
          )}
          {surface === "nav" && (
            <div
              style={{
                padding: "48px 32px",
                color: v.textTertiary,
                fontFamily: v.uiFont,
                fontSize: 13,
                textAlign: "center",
              }}
            >
              (page content below nav — intentionally empty to focus on the
              header)
            </div>
          )}
        </div>
      </Stack>

      <Divider />

      <H2>Design decisions</H2>
      <Grid columns={2} gap={20} align="start">
        <Stack gap={8}>
          <H3>Nav: active route indicator</H3>
          <Text size="small" tone="secondary">
            The current implementation only styles hover. New design adds an{" "}
            <Text weight="semibold">underline indicator</Text> under the active
            link (accent color, 2px, sitting on the header bottom border) so
            users always know where they are. Hover reuses the same color at a
            lower tone so it reads as a preview of the active state.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Nav: flat chrome, no blur</H3>
          <Text size="small" tone="secondary">
            Drop the translucent backdrop blur — it fights the warm Washi
            paper. Use a solid <Code>surface</Code> fill with a single
            <Code>border-bottom</Code> hairline. Dark mode mirrors this: solid
            near-black surface, no glass.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Nav: compact auth slot</H3>
          <Text size="small" tone="secondary">
            Sign in / Sign out collapses to a ghost button adjacent to the
            theme toggle. On narrow screens the whole nav wraps normally (flex
            wrap retained). The wordmark stays alone on the left —{" "}
            <Code>KanaReps</Code> in the accent color, 1.125rem semibold, no
            gradient.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Landing: calm hero, single CTA</H3>
          <Text size="small" tone="secondary">
            Replace the gradient-glow title with a flat accent wordmark, the
            <Code>あ</Code> watermark behind it (Washi only, very low opacity)
            for a subtle nod to the subject. One primary CTA; "Sign in with
            Google" surfaces as an outline button only when the user is
            signed out. Trust line stays below in muted tertiary.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Profile: hairline cards, 6px radius</H3>
          <Text size="small" tone="secondary">
            Existing cards use <Code>rounded-3xl</Code> + heavy shadow; new
            cards use <Code>rounded-md</Code> (6px) and a single flat border,
            matching the other pages. Section title is a 13px semibold label
            with a leading icon in the accent color — no separate <Code>H2</Code>.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Profile: inline save, disabled email</H3>
          <Text size="small" tone="secondary">
            The display-name save button sits inline with the input (same 6px
            radius, accent fill, compact icon). Email is read-only — rendered
            as a flat disabled field on a muted background so it's obviously
            non-editable without looking broken. Status is a tone-aware pill
            (success / info / warning) instead of a custom badge.
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
// Frames
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

function NavFrame({
  variant,
  tokens,
  label,
  children,
}: {
  variant: VariantTokens;
  tokens: ReturnType<typeof useHostTheme>["tokens"];
  label?: string;
  children: ReactNode;
}) {
  return (
    <Stack gap={6}>
      <Row gap={8} align="center">
        <Text weight="semibold">{variant.name}</Text>
        {label && (
          <Text size="small" tone="tertiary">
            · {label}
          </Text>
        )}
      </Row>
      <div
        style={{
          background: variant.bg,
          borderRadius: 10,
          border: `1px solid ${tokens.stroke.primary}`,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Nav bar mock
// ---------------------------------------------------------------------------

function NavBarMock({
  v,
  authed,
  active,
}: {
  v: VariantTokens;
  authed: boolean;
  active: string;
}) {
  const links = NAV_LINKS.filter((l) => !l.requiresAuth || authed);
  return (
    <div
      style={{
        background: v.surface,
        borderBottom: `1px solid ${v.stroke}`,
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        fontFamily: v.uiFont,
      }}
    >
      <div
        style={{
          color: v.accent,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "-0.01em",
        }}
      >
        KanaReps
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {links.map((link) => {
          const isActive = active === link.href;
          return (
            <div
              key={link.id}
              style={{
                position: "relative",
                padding: "6px 10px",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? v.accent : v.textSecondary,
                borderRadius: v.radius,
              }}
            >
              {link.label}
              {isActive && (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 10,
                    right: 10,
                    bottom: -15,
                    height: 2,
                    background: v.accent,
                    borderRadius: 2,
                  }}
                />
              )}
            </div>
          );
        })}
        <div style={{ width: 8 }} />
        <IconButton v={v} ariaLabel="Toggle theme">
          <MoonIcon color={v.textSecondary} />
        </IconButton>
        {authed ? (
          <GhostButton v={v}>Sign out</GhostButton>
        ) : (
          <SolidButton v={v} compact>
            Sign in
          </SolidButton>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Landing mock
// ---------------------------------------------------------------------------

function LandingMock({
  v,
  authed,
  large = false,
}: {
  v: VariantTokens;
  authed: boolean;
  large?: boolean;
}) {
  const titleSize = large ? 72 : 44;
  const taglineSize = large ? 18 : 15;
  const descSize = large ? 14 : 12;
  return (
    <div
      style={{
        padding: large ? "72px 16px 48px" : "36px 16px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 8,
        position: "relative",
        overflow: "hidden",
        fontFamily: v.uiFont,
      }}
    >
      {v.name === WASHI.name && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: large ? 20 : 12,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: v.kanaFont,
            fontSize: large ? 320 : 180,
            lineHeight: 1,
            color: v.accent,
            opacity: 0.06,
            pointerEvents: "none",
            userSelect: "none",
            fontWeight: 400,
          }}
        >
          あ
        </div>
      )}
      <div
        style={{
          color: v.accent,
          fontSize: titleSize,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
          position: "relative",
          zIndex: 1,
        }}
      >
        KanaReps
      </div>
      <div
        style={{
          color: v.text,
          fontSize: taglineSize,
          fontWeight: 500,
          marginTop: 6,
          position: "relative",
          zIndex: 1,
        }}
      >
        Non-stop kana drills
      </div>
      <div
        style={{
          color: v.textSecondary,
          fontSize: descSize,
          maxWidth: large ? 440 : 300,
          lineHeight: 1.5,
          position: "relative",
          zIndex: 1,
        }}
      >
        Master Japanese Hiragana and Katakana through interactive practice.
      </div>
      <div
        style={{
          marginTop: large ? 28 : 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 10,
          width: large ? 360 : 240,
          position: "relative",
          zIndex: 1,
        }}
      >
        <SolidButton v={v} full large={large}>
          Start practicing
        </SolidButton>
        {!authed && (
          <OutlineButton v={v} full large={large} icon={<GoogleGlyph />}>
            Sign in with Google
          </OutlineButton>
        )}
        <div
          style={{
            color: v.textTertiary,
            fontSize: large ? 12 : 11,
            marginTop: 4,
          }}
        >
          Get 7 days free trial · No credit card required
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile mock
// ---------------------------------------------------------------------------

function ProfileMock({ v, large = false }: { v: VariantTokens; large?: boolean }) {
  return (
    <div
      style={{
        padding: large ? "24px 16px 32px" : "16px 14px 20px",
        display: "flex",
        flexDirection: "column",
        gap: large ? 20 : 14,
        maxWidth: large ? 640 : undefined,
        margin: large ? "0 auto" : undefined,
        fontFamily: v.uiFont,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IconButton v={v} ariaLabel="Back" framed>
          <ArrowLeftIcon color={v.textSecondary} />
        </IconButton>
        <div
          style={{
            color: v.text,
            fontSize: large ? 28 : 20,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          Profile
        </div>
      </div>

      <ProfileCard v={v} large={large} icon={<UserIcon color={v.accent} />} title="Account information">
        <Stack gap={14}>
          <Field v={v} label="Display name">
            <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
              <FakeInput v={v} value="Євген Євстратов" grow />
              <SolidIconButton v={v} ariaLabel="Save name">
                <SaveIcon color={v.accentContrast} />
              </SolidIconButton>
            </div>
          </Field>
          <Field v={v} label="Email">
            <FakeInput v={v} value="gjevstratov@gmail.com" disabled />
          </Field>
        </Stack>
      </ProfileCard>

      <ProfileCard v={v} large={large} icon={<CardIcon color={v.accent} />} title="Lifetime access">
        <Stack gap={10}>
          <div
            style={{
              color: v.textSecondary,
              fontSize: 12,
              lineHeight: 1.5,
              marginBottom: 2,
            }}
          >
            Thanks for supporting KanaReps — you're unlocked forever.
          </div>
          <KeyValueRow
            v={v}
            label="Status"
            value={<StatusPill v={v} tone="success">active</StatusPill>}
          />
          <KeyValueRow v={v} label="Purchased" value="April 19, 2026" />
        </Stack>
      </ProfileCard>
    </div>
  );
}

function ProfileCard({
  v,
  large,
  icon,
  title,
  children,
}: {
  v: VariantTokens;
  large: boolean;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: v.surface,
        border: `1px solid ${v.stroke}`,
        borderRadius: v.radius,
        padding: large ? 18 : 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: v.text,
          fontSize: 13,
          fontWeight: 600,
          marginBottom: large ? 14 : 10,
        }}
      >
        <span style={{ display: "inline-flex", width: 16, height: 16 }}>
          {icon}
        </span>
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({
  v,
  label,
  children,
}: {
  v: VariantTokens;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          color: v.textSecondary,
          fontSize: 11,
          fontWeight: 500,
          marginBottom: 6,
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function FakeInput({
  v,
  value,
  disabled = false,
  grow = false,
}: {
  v: VariantTokens;
  value: string;
  disabled?: boolean;
  grow?: boolean;
}) {
  return (
    <div
      style={{
        flex: grow ? 1 : undefined,
        background: disabled ? v.disabledBg : v.surfaceElevated,
        border: `1px solid ${disabled ? v.strokeSubtle : v.stroke}`,
        borderRadius: v.radius,
        padding: "8px 10px",
        color: disabled ? v.textTertiary : v.text,
        fontSize: 13,
        minHeight: 34,
        display: "flex",
        alignItems: "center",
        fontFamily: v.uiFont,
      }}
    >
      {value}
    </div>
  );
}

function KeyValueRow({
  v,
  label,
  value,
}: {
  v: VariantTokens;
  label: string;
  value: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        fontSize: 12,
      }}
    >
      <span style={{ color: v.textSecondary }}>{label}</span>
      <span style={{ color: v.text, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function StatusPill({
  v,
  tone,
  children,
}: {
  v: VariantTokens;
  tone: "success";
  children: ReactNode;
}) {
  const bg = tone === "success" ? v.successSoft : v.accentSoft;
  const fg = tone === "success" ? v.success : v.accent;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: bg,
        color: fg,
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 999,
        fontFamily: v.uiFont,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Shared buttons / icons
// ---------------------------------------------------------------------------

function IconButton({
  v,
  children,
  ariaLabel,
  framed = false,
}: {
  v: VariantTokens;
  children: ReactNode;
  ariaLabel: string;
  framed?: boolean;
}) {
  return (
    <div
      role="button"
      aria-label={ariaLabel}
      style={{
        width: 32,
        height: 32,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: v.radius,
        border: framed ? `1px solid ${v.stroke}` : "1px solid transparent",
        background: framed ? v.surface : "transparent",
      }}
    >
      {children}
    </div>
  );
}

function SolidIconButton({
  v,
  children,
  ariaLabel,
}: {
  v: VariantTokens;
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <div
      role="button"
      aria-label={ariaLabel}
      style={{
        width: 36,
        height: 36,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: v.radius,
        background: v.accent,
        color: v.accentContrast,
      }}
    >
      {children}
    </div>
  );
}

function SolidButton({
  v,
  children,
  full = false,
  compact = false,
  large = false,
}: {
  v: VariantTokens;
  children: ReactNode;
  full?: boolean;
  compact?: boolean;
  large?: boolean;
}) {
  const padY = compact ? 6 : large ? 12 : 10;
  const padX = compact ? 10 : large ? 20 : 16;
  const fz = compact ? 12 : large ? 14 : 13;
  const style: CSSProperties = {
    background: v.accent,
    color: v.accentContrast,
    fontWeight: 600,
    fontSize: fz,
    padding: `${padY}px ${padX}px`,
    borderRadius: v.radius,
    width: full ? "100%" : undefined,
    textAlign: "center",
    fontFamily: v.uiFont,
    display: full ? "block" : "inline-flex",
  };
  return <div style={style}>{children}</div>;
}

function OutlineButton({
  v,
  children,
  full = false,
  large = false,
  icon,
}: {
  v: VariantTokens;
  children: ReactNode;
  full?: boolean;
  large?: boolean;
  icon?: ReactNode;
}) {
  const padY = large ? 12 : 10;
  const padX = large ? 20 : 16;
  const fz = large ? 14 : 13;
  return (
    <div
      style={{
        background: "transparent",
        color: v.text,
        fontWeight: 600,
        fontSize: fz,
        padding: `${padY}px ${padX}px`,
        borderRadius: v.radius,
        border: `1px solid ${v.stroke}`,
        width: full ? "100%" : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: v.uiFont,
      }}
    >
      {icon}
      {children}
    </div>
  );
}

function GhostButton({
  v,
  children,
}: {
  v: VariantTokens;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        color: v.textSecondary,
        fontSize: 12,
        fontWeight: 500,
        padding: "6px 8px",
        borderRadius: v.radius,
        fontFamily: v.uiFont,
      }}
    >
      {children}
    </div>
  );
}

// ---- Icons (inline SVG, sized per caller) ----------------------------------

function MoonIcon({ color }: { color: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ArrowLeftIcon({ color }: { color: string }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function UserIcon({ color }: { color: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CardIcon({ color }: { color: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function SaveIcon({ color }: { color: string }) {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden>
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
// Token recap
// ---------------------------------------------------------------------------

function TokenBlock({ variant: v }: { variant: VariantTokens }) {
  return (
    <Stack gap={10}>
      <Text weight="semibold">{v.name}</Text>
      <Table
        headers={["Token", "Value", "Swatch"]}
        columnAlign={["left", "left", "center"]}
        rows={[
          ["background", <Code key="bg">{v.bg}</Code>, <Swatch key="s-bg" color={v.bg} />],
          ["surface", <Code key="sf">{v.surface}</Code>, <Swatch key="s-sf" color={v.surface} />],
          [
            "surfaceElevated",
            <Code key="sfe">{v.surfaceElevated}</Code>,
            <Swatch key="s-sfe" color={v.surfaceElevated} />,
          ],
          ["stroke", <Code key="st">{v.stroke}</Code>, <Swatch key="s-st" color={v.stroke} />],
          [
            "text",
            <Code key="t">{v.text}</Code>,
            <Swatch key="s-t" color={v.text} />,
          ],
          [
            "textSecondary",
            <Code key="t2">{v.textSecondary}</Code>,
            <Swatch key="s-t2" color={v.textSecondary} />,
          ],
          [
            "accent",
            <Code key="a">{v.accent}</Code>,
            <Swatch key="s-a" color={v.accent} />,
          ],
          [
            "accentSoft",
            <Code key="as">{v.accentSoft}</Code>,
            <Swatch key="s-as" color={v.accentSoft} />,
          ],
          [
            "success",
            <Code key="ok">{v.success}</Code>,
            <Swatch key="s-ok" color={v.success} />,
          ],
          ["radius", <Code key="r">{v.radius}px</Code>, "—"],
        ]}
      />
    </Stack>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <div
      style={{
        display: "inline-block",
        width: 20,
        height: 12,
        background: color,
        border: "1px solid rgba(0,0,0,0.15)",
        borderRadius: 3,
      }}
    />
  );
}
