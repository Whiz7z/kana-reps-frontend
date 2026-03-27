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
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session_id")) {
      void refresh();
    }
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
