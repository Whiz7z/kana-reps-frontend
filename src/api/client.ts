import type { KanaRow, MeResponse } from "./types";

const base = () =>
  (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

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
  const res = await fetch(`${base()}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
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
  await api<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
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

export async function createCheckout(): Promise<{ url: string }> {
  return api("/api/billing/checkout", { method: "POST" });
}

export async function createPortal(): Promise<{ url: string }> {
  return api("/api/billing/portal", { method: "POST" });
}

export function googleAuthUrl(redirectPath: string): string {
  const q = encodeURIComponent(redirectPath);
  return `${base()}/api/auth/google?redirect=${q}`;
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
