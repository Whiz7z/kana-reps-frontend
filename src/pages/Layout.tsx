import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export function Layout({ children }: { children: ReactNode }) {
  const { user, startGoogleLogin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#fef9f3] text-slate-900 antialiased">
      <header className="border-b border-indigo-100/50 bg-white/80 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3 lg:px-8">
          <Link
            to="/"
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl"
          >
            KanaRep
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-medium text-slate-700 sm:gap-2">
            <Link
              className="rounded-lg px-2 py-1.5 transition hover:bg-indigo-50 hover:text-indigo-700"
              to="/menu"
            >
              Menu
            </Link>
            <Link
              className="rounded-lg px-2 py-1.5 transition hover:bg-indigo-50 hover:text-indigo-700"
              to="/custom"
            >
              Custom
            </Link>
            {user && (
              <>
                <Link
                  className="rounded-lg px-2 py-1.5 transition hover:bg-indigo-50 hover:text-indigo-700"
                  to="/profile"
                >
                  Profile
                </Link>
                {user.role === "admin" && (
                  <Link
                    className="rounded-lg px-2 py-1.5 transition hover:bg-indigo-50 hover:text-indigo-700"
                    to="/admin"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
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
      <main className="mx-auto max-w-7xl px-6 py-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
