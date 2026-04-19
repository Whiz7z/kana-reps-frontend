import type { KanaRow, MeResponse, WordCategorySummary } from "./types";

const base = () =>
  (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

const AUTH_TOKEN_KEY = "kanareps-auth-token";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    /* quota / private mode */
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    /* noop */
  }
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string> | undefined) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    if (res.status === 401) clearAuthToken();
    const body = await res.json().catch(() => ({}));
    const msg =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error?: { message?: string } }).error?.message ===
        "string"
        ? (body as { error: { message: string } }).error.message
        : res.statusText;
    throw new ApiRequestError(msg, res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Coalesce concurrent /me calls (e.g. React StrictMode double-mount). Clears after settle so later refresh() still fetches. */
let getMeInFlight: Promise<MeResponse> | null = null;

export async function getMe(): Promise<MeResponse> {
  if (!getMeInFlight) {
    getMeInFlight = api<MeResponse>("/api/me").finally(() => {
      getMeInFlight = null;
    });
  }
  return getMeInFlight;
}

export async function logout(): Promise<void> {
  clearAuthToken();
}

/** Shared so Strict Mode / duplicate mounts only hit the network once per session. */
let kanaCatalogPromise: Promise<KanaRow[]> | null = null;

export async function fetchKanaCatalog(): Promise<KanaRow[]> {
  if (!kanaCatalogPromise) {
    kanaCatalogPromise = api<{ items: KanaRow[] }>("/api/kana/catalog")
      .then((r) => r.items)
      .catch((err) => {
        kanaCatalogPromise = null;
        throw err;
      });
  }
  return kanaCatalogPromise;
}

export async function postDrill(body: Record<string, unknown>): Promise<{
  kanaData: KanaRow[];
}> {
  return api("/api/drill", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchWordCategories(): Promise<WordCategorySummary[]> {
  const r = await api<{ categories: WordCategorySummary[] }>(
    "/api/drill/words/categories"
  );
  return r.categories;
}

export async function postWordDrill(body: {
  kana_type: "hiragana" | "katakana";
  categories?: string[];
  custom_words?: { char: string }[];
}): Promise<{ kanaData: KanaRow[] }> {
  return api("/api/drill/words", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type KanaGuessStatItem = {
  char: string;
  kana_type: "hiragana" | "katakana";
  correct_count: number;
  wrong_count: number;
};

export async function fetchKanaGuessStats(): Promise<KanaGuessStatItem[]> {
  const r = await api<{ items: KanaGuessStatItem[] }>("/api/kana/guess-stats");
  return r.items;
}

/** Fire-and-forget; no-op when not signed in. */
export function reportKanaGuess(
  row: Pick<KanaRow, "char" | "kana_type">,
  correct: boolean,
  authed: boolean
): void {
  if (!authed) return;
  const token = getAuthToken();
  if (!token) return;
  void fetch(`${base()}/api/kana/guess-stats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      char: row.char,
      kana_type: row.kana_type,
      correct,
    }),
  }).catch(() => {});
}

export async function createCheckout(): Promise<{ url: string }> {
  return api("/api/billing/checkout", { method: "POST" });
}

/** Returns true when the failure is the backend's "user already paid" 409. */
export function isAlreadyOwnedError(err: unknown): boolean {
  if (!(err instanceof ApiRequestError)) return false;
  if (err.status !== 409) return false;
  const body = err.body as { error?: { code?: string } } | null;
  return body?.error?.code === "ALREADY_OWNED";
}

/** After Stripe redirects with ?session_id=cs_… — confirms a one-time lifetime purchase (`mode=payment`, `payment_status=paid`). */
export async function verifyCheckoutSession(
  sessionId: string
): Promise<{ verified: boolean }> {
  const q = encodeURIComponent(sessionId);
  return api<{ verified: boolean }>(
    `/api/billing/checkout-session?session_id=${q}`
  );
}

export async function createPortal(): Promise<{ url: string }> {
  return api("/api/billing/portal", { method: "POST" });
}

/**
 * Exchange the Google auth-code from the popup flow (@react-oauth/google)
 * for an app JWT and user payload. Client must call `setAuthToken` with the result.
 */
export async function exchangeGoogleAuthCode(
  code: string
): Promise<{ token: string; user: MeResponse }> {
  return api<{ token: string; user: MeResponse }>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function updateUsername(name: string): Promise<MeResponse> {
  return api("/api/me", {
    method: "PATCH",
    body: JSON.stringify({ username: name }),
  });
}

export type AdminUserRow = {
  id: string;
  email: string;
  username: string | null;
  role: string;
  subscription_status: string;
  trial_expires_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
};

export async function fetchAdminUsers(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ users: AdminUserRow[]; total: number }> {
  const sp = new URLSearchParams();
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.offset != null) sp.set("offset", String(params.offset));
  const q = sp.toString();
  return api(`/api/admin/users${q ? `?${q}` : ""}`);
}
