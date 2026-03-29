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
  getMe,
  googleAuthUrl,
  logout as apiLogout,
  verifyCheckoutSession,
} from "@/api/client";
import { fireSubscriptionConversion } from "@/lib/googleAdsConversion";
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
    try {
      const me = await getMe();
      setUser(me);
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 401) {
        setUser(null);
      } else {
        console.error(e);
        setUser(null);
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
          if (verified) fireSubscriptionConversion(sid);
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

  const startGoogleLogin = useCallback((redirectPath = "/menu") => {
    window.location.href = googleAuthUrl(redirectPath);
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
