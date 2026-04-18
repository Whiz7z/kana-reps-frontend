import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useColorMode } from "@/context/ColorModeContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: ReactNode }) {
  const { user, startGoogleLogin, logout } = useAuth();
  const { mode, toggleMode } = useColorMode();
  const { pathname } = useLocation();
  const fullWidthMain = pathname === "/custom";

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-paper)]/80 shadow-sm backdrop-blur-xl dark:bg-[var(--color-paper)]/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3 lg:px-8">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-[var(--color-primary)] sm:text-2xl"
          >
            KanaReps 
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-200 sm:gap-2">
            <Link
              className="rounded-lg px-2 py-1.5 transition hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-white/10 dark:hover:text-[var(--color-primary)]"
              to="/menu"
            >
              Menu
            </Link>
            <Link
              className="rounded-lg px-2 py-1.5 transition hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-white/10 dark:hover:text-[var(--color-primary)]"
              to="/custom"
            >
              Custom
            </Link>
            {user && (
              <>
                <Link
                  className="rounded-lg px-2 py-1.5 transition hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-white/10 dark:hover:text-[var(--color-primary)]"
                  to="/profile"
                >
                  Profile
                </Link>
                {user.role === "admin" && (
                  <Link
                    className="rounded-lg px-2 py-1.5 transition hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-white/10 dark:hover:text-[var(--color-primary)]"
                    to="/admin"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
            <button
              type="button"
              onClick={toggleMode}
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition",
                "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
                "dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-[var(--color-primary)]"
              )}
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
                <Moon className="h-5 w-5" aria-hidden />
              ) : (
                <Sun className="h-5 w-5" aria-hidden />
              )}
            </button>
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="!px-2"
                onClick={() => void logout()}
              >
                Sign out
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="!px-2"
                onClick={() => startGoogleLogin("/menu")}
              >
                Sign in
              </Button>
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
