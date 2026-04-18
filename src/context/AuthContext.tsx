import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useGoogleLogin } from "@react-oauth/google";
import {
  ApiRequestError,
  clearAuthToken,
  exchangeGoogleAuthCode,
  getAuthToken,
  getMe,
  logout as apiLogout,
  setAuthToken,
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getAuthToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 401) {
        clearAuthToken();
        setUser(null);
      } else {
        console.error(e);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (resp) => {
      try {
        const { token, user: me } = await exchangeGoogleAuthCode(resp.code);
        setAuthToken(token);
        setUser(me);
      } catch (e) {
        console.error(e);
        clearAuthToken();
        setUser(null);
      }
    },
    onError: (err) => {
      console.error("Google login failed", err);
    },
  });

  // Stable ref so `startGoogleLogin` identity doesn't change every render and we
  // don't have to thread the hook's current login through memo deps.
  const googleLoginRef = useRef(googleLogin);
  useEffect(() => {
    googleLoginRef.current = googleLogin;
  }, [googleLogin]);

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
            window.gtag_report_conversion!(undefined, sid);
          } else if (import.meta.env.DEV) {
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

  const startGoogleLogin = useCallback((_redirectPath?: string) => {
    // redirectPath is a legacy arg from the old redirect flow; the popup flow returns
    // to the same page, so we simply ignore it.
    void _redirectPath;
    googleLoginRef.current();
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
