import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export function Layout({ children }: { children: ReactNode }) {
  const { user, startGoogleLogin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 text-gray-900">
      <header className="border-b border-white/40 bg-white/30 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-6">
          <Link
            to="/"
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl"
          >
            KanaReps
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-medium text-gray-800 sm:gap-2">
            <Link
              className="rounded-lg px-2 py-1.5 hover:bg-white/50"
              to="/menu"
            >
              Menu
            </Link>
            <Link
              className="rounded-lg px-2 py-1.5 hover:bg-white/50"
              to="/custom"
            >
              Custom
            </Link>
            {user && (
              <>
                <Link
                  className="rounded-lg px-2 py-1.5 hover:bg-white/50"
                  to="/profile"
                >
                  Profile
                </Link>
                {user.role === "admin" && (
                  <Link
                    className="rounded-lg px-2 py-1.5 hover:bg-white/50"
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
      <main className="mx-auto max-w-6xl px-3 py-6 sm:p-6 sm:py-8">{children}</main>
    </div>
  );
}
