# State and routing

## Routes

Use **React Router** v6. Paths align with legacy:

| Path | Component |
|------|-----------|
| `/` | Home |
| `/menu` | Menu |
| `/custom` | Custom |
| `/practice` | Practice |
| `/profile` | Profile |
| `/admin` | Admin |

## Practice session state (important)

Legacy used **`location.state` only** from `navigate('/practice', { state: {...} })`. Problems:

- Refresh loses state
- Deep link impossible
- Browser back/forward brittle

### Recommended approach

1. **Primary:** Keep `location.state` for in-app navigation (fast, same as today).
2. **Fallback:** On `Practice` mount, if `state` is missing, read **`sessionStorage`** key e.g. `kanareps-practice-session` written at navigation time.
3. **Optional v2:** Encode minimal params in query string:
   - `?mode=kana-to-romaji&kanaType=hiragana&set=basic,dakuten`
   - Custom: store selected romaji lists in sessionStorage or pass compressed id if you add server-side presets.

Document chosen strategy in PRs; at minimum implement **sessionStorage backup** when leaving Menu/Custom.

## Custom set persistence

Legacy keys (can keep for migration compatibility):

- `kana-learn-selected-kana-hiragana`
- `kana-learn-selected-kana-katakana`
- `kana-learn-current-tab`

Alternatively namespace under `kanareps:*` for the new app.

## Auth gating

- **Public:** `/` (landing).
- **Semi-public:** `/menu` may show for guests with limited CTAs (legacy allows unauthenticated menu).
- **Protected:** `/profile`, `/admin`; redirect to `/` or show login if no session.

Implement via loader or `useEffect` + `GET /api/me` or session check endpoint.

## Entitlements

Cache `entitlements` from `GET /api/me` in React context (replace Base44 `getUserStatus`). Invalidate on return from Stripe success URL (`?session_id=`).
