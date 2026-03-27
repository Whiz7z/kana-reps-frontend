# Backend integration

Replaces `@/api/base44Client` and `base44.functions.invoke(...)`.

## Base URL

```ts
const API = import.meta.env.VITE_API_URL; // https://api.example.com — no trailing slash
```

## Credentials

If the API uses **cookies**:

```ts
fetch(`${API}/api/me`, { credentials: 'include' });
```

If using **Bearer tokens**, attach `Authorization` header from your auth context.

## Endpoint mapping

| Legacy (Base44) | New |
|-----------------|-----|
| `base44.auth.loginWithProvider('google', path)` | `window.location.href = ${API}/api/auth/google?redirect=${encodeURIComponent(path)}` |
| `base44.auth.logout()` | `POST ${API}/api/auth/logout` + clear client state |
| `base44.functions.invoke('getUserStatus', {})` | `GET ${API}/api/me` |
| `base44.functions.invoke('getDrillData', body)` | `POST ${API}/api/drill` with same JSON body |
| `base44.functions.invoke('createCheckoutSession', {})` | `POST ${API}/api/billing/checkout` → `{ url }` |
| `base44.functions.invoke('createBillingPortalSession', {})` | `POST ${API}/api/billing/portal` |
| `base44.functions.invoke('updateUserName', { name })` | `PATCH ${API}/api/me` |
| `base44.entities.User.list()` (admin) | `GET ${API}/api/admin/users` |

## Typed client (example)

```ts
// api/client.ts
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err?.error?.message ?? res.statusText), { status: res.status, body: err });
  }
  return res.json();
}
```

## Error handling

- **`403`** on drill → show `SubscriptionModal` for writing mode (same UX as legacy).
- **`401`** on protected routes → redirect to landing or show sign-in.

## CORS

Frontend origin must be listed in API `CORS_ORIGIN`. For Vercel previews, add wildcard strategy or script to register preview URLs — document in API [DEPLOYMENT.md](../../kana-reps-api/docs/DEPLOYMENT.md).

## Contract reference

Full request/response shapes: [kana-reps-api/docs/API.md](../../kana-reps-api/docs/API.md).
