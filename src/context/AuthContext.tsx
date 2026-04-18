import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ApiRequestError,
  clearGoogleOAuthPending,
  getMe,
  logout as apiLogout,
  startGoogleAuthRedirect,
  takeGoogleOAuthRetryHint,
  verifyCheckoutSession,
} from "@/api/client";
import type { MeResponse } from "@/api/types";

type AuthState = {
  user: MeResponse | null;
  loading: boolean;
  refresh: () => Promise<void>;
  startGoogleLogin: (redirectPath?: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/** After Google redirects back, some mobile browsers attach the session cookie a tick late; one retry helps. */
const POST_OAUTH_ME_RETRY_MS = 280;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const me = await getMe();
        setUser(me);
        clearGoogleOAuthPending();
        return;
      } catch (e) {
        if (e instanceof ApiRequestError && e.status === 401) {
          if (takeGoogleOAuthRetryHint()) {
            await new Promise((r) => setTimeout(r, POST_OAUTH_ME_RETRY_MS));
            try {
              const me = await getMe(true);
              setUser(me);
              clearGoogleOAuthPending();
              return;
            } catch (e2) {
              if (e2 instanceof ApiRequestError && e2.status === 401) {
                setUser(null);
                return;
              }
              console.error(e2);
              setUser(null);
              return;
            }
          }
          setUser(null);
          return;
        }
        console.error(e);
        setUser(null);
        clearGoogleOAuthPending();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const sid = new URLSearchParams(window.location.search).get(
        "session_id"
      );
      await refresh();
      if (cancelled) return;

      if (sid) {
        try {
          const { verified } = await verifyCheckoutSession(sid);
          if (cancelled) return;
          if (import.meta.env.DEV) {
            console.info("[gads] Stripe checkout-session verified:", verified);
          }
          if (verified) {
            console.log("verified", sid);
            window.gtag_report_conversion!(undefined, sid)
          }
          else if (import.meta.env.DEV) {
            console.warn(
              "[gads] Session not verified — no conversion (check trial/payment_status, customer match, API URL)"
            );
          }
        } catch (e) {
          console.error(e);
        } finally {
          const path = window.location.pathname + window.location.hash;
          window.history.replaceState({}, "", path);
          if (!cancelled) await refresh();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  // iOS Safari often serves a frozen BFCache page after OAuth; session may exist but React state is stale.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) void refresh();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [refresh]);

  const startGoogleLogin = useCallback((redirectPath = "/menu") => {
    startGoogleAuthRedirect(redirectPath);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      startGoogleLogin,
      logout,
    }),
    [user, loading, refresh, startGoogleLogin, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
