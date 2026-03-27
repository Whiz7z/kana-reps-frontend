# Product specification

KanaReps helps learners practice **Japanese hiragana and katakana** through repeated drills.

## Value proposition

- **Non-stop drills** with immediate feedback
- **Three practice modes** covering recognition, recall, and handwriting
- **Flexible sets**: course-style “First 10”, level mixes (Basic / Dakuten / Handakuten / Yoon), or a **custom** selection
- **Accounts** via Google; **subscription** for premium features (handwriting and optional future gates)

## User journeys

1. **Anonymous / first visit** — Landing explains the app; user can sign in with Google (copy: optional “7-day trial • no credit card” if product keeps trial).
2. **Authenticated free/trial** — Access menu, standard modes, custom set; trial dates shown where relevant.
3. **Subscriber** — Full access including **Writing** mode; manage billing from Profile.
4. **Admin** — User list with subscription filters (support / ops).

## Practice modes

| Mode | User action | Goal |
|------|-------------|------|
| **Kana → Romaji** | See kana; type romaji; Enter | Reading → pronunciation |
| **Romaji → Kana** | See romaji; Space to reveal kana | Recall script from sound |
| **Writing** | Draw character on canvas; Check | Production / stroke recall |

Writing uses browser handwriting recognition (legacy: `handwriting.canvas.js`) and compares to the expected character.

## Set types

- **First 10** — Subset `a, i, u, e, o, ka, ki, ku, ke, ko` per script.
- **Level mix** — Any combination of Basic, Dakuten, Handakuten, Yoon for Hiragana or Katakana independently.
- **Custom** — User picks individual kana from a grid (tabs + collapsible sections); selection persisted locally.

## Monetization (target)

- **Stripe** subscription Checkout; Customer Portal for manage/cancel.
- **Entitlements** (example): free users get Kana↔Romaji + custom; **Writing** requires trial or active subscription; optional future limits on Yoon-only or custom size — driven by `GET /api/me` → `entitlements`.

## Non-goals (v1 rebuild)

- SRS / spaced repetition scheduling
- User-generated shared decks
- Native mobile apps (web-first responsive)
