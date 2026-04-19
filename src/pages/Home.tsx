import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
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

export function Home() {
  const navigate = useNavigate();
  const { user, startGoogleLogin, loading } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-10">
      <div className="flex w-full max-w-[420px] flex-col items-stretch gap-7 px-3 text-center">
        <div className="flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/menu")}
            className="cursor-pointer border-none bg-transparent p-0"
            style={{
              color: "var(--practice-accent)",
              fontFamily: "var(--practice-ui-font)",
              fontSize: "clamp(44px, 12vw, 52px)",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
            aria-label="Start practicing"
          >
            KanaReps
          </button>
          <p
            style={{
              color: "var(--practice-text-secondary)",
              fontFamily: "var(--practice-ui-font)",
              fontSize: 18,
              fontWeight: 500,
              margin: 0,
            }}
          >
            Non-stop kana drills
          </p>
          <p
            style={{
              color: "var(--practice-text-tertiary)",
              fontFamily: "var(--practice-ui-font)",
              fontSize: 13,
              lineHeight: 1.5,
              maxWidth: 320,
              margin: 0,
            }}
          >
            Master Japanese Hiragana and Katakana through interactive practice
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2.5">
          <PrimaryButton onClick={() => navigate("/menu")}>
            Start practicing
          </PrimaryButton>
          {!user && !loading && (
            <SecondaryButton onClick={() => startGoogleLogin("/menu")}>
              <GoogleGlyph className="h-[18px] w-[18px] shrink-0" />
              <span style={{ fontWeight: 600 }}>Sign in with Google</span>
            </SecondaryButton>
          )}
          <p
            style={{
              color: "var(--practice-text-tertiary)",
              fontFamily: "var(--practice-ui-font)",
              fontSize: 12,
              margin: "2px 0 0",
            }}
          >
            Get 7 days free trial · No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buttons — full-width of the narrow content column.
// ---------------------------------------------------------------------------

function PrimaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  const style: CSSProperties = {
    background: "var(--practice-accent)",
    color: "var(--practice-accent-ink)",
    padding: "12px 18px",
    borderRadius: "var(--practice-radius)",
    border: "none",
    fontFamily: "var(--practice-ui-font)",
    fontSize: 15,
    fontWeight: 600,
    textAlign: "center",
    cursor: "pointer",
    transition: "opacity 120ms ease",
  };
  return (
    <button
      type="button"
      style={style}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.9";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  const style: CSSProperties = {
    background: "var(--practice-surface)",
    color: "var(--practice-text)",
    padding: "11px 18px",
    borderRadius: "var(--practice-radius)",
    border: "1px solid var(--practice-stroke)",
    fontFamily: "var(--practice-ui-font)",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    cursor: "pointer",
    transition: "background-color 120ms ease",
  };
  return (
    <button
      type="button"
      style={style}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--practice-hover-tint)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--practice-surface)";
      }}
    >
      {children}
    </button>
  );
}
