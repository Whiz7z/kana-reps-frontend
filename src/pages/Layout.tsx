import { Link, useLocation } from "react-router-dom";
import type { CSSProperties, ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useColorMode } from "@/context/ColorModeContext";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: ReactNode }) {
  const { user, startGoogleLogin, logout } = useAuth();
  const { mode, toggleMode } = useColorMode();
  const { pathname } = useLocation();
  const fullWidthMain = pathname === "/custom";

  const navLinks: { href: string; label: string }[] = [
    { href: "/menu", label: "Menu" },
    { href: "/custom", label: "Custom" },
  ];
  if (user) navLinks.push({ href: "/profile", label: "Profile" });
  if (user?.role === "admin") navLinks.push({ href: "/admin", label: "Admin" });

  return (
    <div
      className="practice-root min-h-screen antialiased"
      style={{
        background: "var(--practice-bg)",
        color: "var(--practice-text)",
      }}
    >
      <header
        style={{
          background: "var(--practice-surface)",
          borderBottom: "1px solid var(--practice-stroke)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3 lg:px-8">
          <Link
            to="/"
            className="font-bold tracking-tight"
            style={{
              color: "var(--practice-accent)",
              fontFamily: "var(--practice-ui-font)",
              fontSize: 18,
              letterSpacing: "-0.01em",
            }}
          >
            KanaReps
          </Link>
          <nav className="flex flex-wrap items-center gap-1.5 sm:gap-1.5">
            {navLinks.map((l) => (
              <NavLink
                key={l.href}
                to={l.href}
                active={pathname === l.href}
                label={l.label}
              />
            ))}
            <button
              type="button"
              onClick={toggleMode}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center transition"
              style={{
                borderRadius: "var(--practice-radius)",
                border: "1px solid var(--practice-stroke-subtle)",
                color: "var(--practice-text-secondary)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--practice-hover-tint)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              aria-label={
                mode === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
              title={
                mode === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
            >
              {mode === "light" ? (
                <Moon className="h-4 w-4" aria-hidden />
              ) : (
                <Sun className="h-4 w-4" aria-hidden />
              )}
            </button>
            {user ? (
              <AuthButton tone="ghost" onClick={() => void logout()}>
                Sign out
              </AuthButton>
            ) : (
              <AuthButton tone="primary" onClick={() => startGoogleLogin("/menu")}>
                Sign in
              </AuthButton>
            )}
          </nav>
        </div>
      </header>
      <main
        className={cn(
          "mx-auto py-6 sm:py-8 md:pb-24",
          fullWidthMain
            ? "w-full max-w-none px-4 sm:px-6 lg:px-8"
            : "max-w-7xl px-1 lg:px-8"
        )}
      >
        {children}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Topbar link — transparent inactive, soft accent tint when active.
// ---------------------------------------------------------------------------

function NavLink({
  to,
  label,
  active,
}: {
  to: string;
  label: string;
  active: boolean;
}) {
  const base: CSSProperties = {
    padding: "6px 10px",
    borderRadius: "var(--practice-radius)",
    fontFamily: "var(--practice-ui-font)",
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    transition: "background-color 120ms ease",
  };
  const styled: CSSProperties = active
    ? {
        ...base,
        background: "var(--practice-accent-soft)",
        color: "var(--practice-accent)",
      }
    : {
        ...base,
        background: "transparent",
        color: "var(--practice-text-secondary)",
      };
  return (
    <Link
      to={to}
      style={styled}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "var(--practice-hover-tint)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      {label}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Auth control — filled primary for guests, ghost for authed users.
// ---------------------------------------------------------------------------

function AuthButton({
  tone,
  children,
  onClick,
}: {
  tone: "primary" | "ghost";
  children: ReactNode;
  onClick: () => void;
}) {
  const isPrimary = tone === "primary";
  const style: CSSProperties = {
    padding: "7px 14px",
    borderRadius: "var(--practice-radius)",
    fontFamily: "var(--practice-ui-font)",
    fontSize: 13,
    fontWeight: 600,
    border: isPrimary ? "none" : "1px solid var(--practice-stroke-subtle)",
    background: isPrimary ? "var(--practice-accent)" : "transparent",
    color: isPrimary
      ? "var(--practice-accent-ink)"
      : "var(--practice-text-secondary)",
    transition: "background-color 120ms ease, opacity 120ms ease",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      onMouseEnter={(e) => {
        if (isPrimary) {
          e.currentTarget.style.opacity = "0.9";
        } else {
          e.currentTarget.style.background = "var(--practice-hover-tint)";
        }
      }}
      onMouseLeave={(e) => {
        if (isPrimary) {
          e.currentTarget.style.opacity = "1";
        } else {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      {children}
    </button>
  );
}
