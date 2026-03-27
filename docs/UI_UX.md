# UI / UX specification

Preserve the **look and feel** of the legacy Base44 app unless intentionally refreshing branding.

## Visual language

- **Background:** Soft gradient `from-pink-50 via-purple-50 to-blue-50` on main screens.
- **Cards:** White rounded-2xl (`rounded-2xl`), light shadow, generous padding (`sm:p-6 p-3` pattern).
- **Primary actions:** Gradient buttons (pink → purple or purple → blue depending on section).
- **Titles:** Gradient text on “KanaReps” and page headings.

## Screen inventory

| Route | Purpose | Key components |
|-------|---------|----------------|
| `/` | Landing, Google CTA | Large wordmark, sign-in button |
| `/menu` | Mode + sets | Mode grid, Hiragana/Katakana columns, Custom Set button |
| `/custom` | Custom selection | Tabs (Hiragana/Katakana), `KanaGrid`, sticky “Start Practice” |
| `/practice` | Drill | Mode-specific panel, `QuestionHistory` sidebar |
| `/profile` | Account + billing | Cards: username, email, subscription, CTAs |
| `/admin` | Admin table | Filter chips, data table |

## Components to port (from legacy `kanareps/`)

- **`KanaGrid`** — Collapsible sections (base / dakuten / yoon groupings), row and group select/deselect, Select all / Clear; **keep** this interaction model.
- **`KanaTile`** — Toggle visual for selected kana.
- **`SetButton`** — Large tappable row for “First 10” and Custom entry.
- **`QuestionHistory`** — Last N attempts with correct/wrong for typing mode.
- **`SubscriptionModal`** — When API returns 403 for writing; CTA to subscribe.
- **shadcn-style UI** — Button, Tabs, Card, Table, Badge, Input, Dialog — reuse Radix + Tailwind patterns.

## Menu layout

- **Practice mode** row: two columns for Kana→Romaji and Romaji→Kana; **Writing** full-width below, disabled when user lacks entitlement.
- **Custom Set** full-width card with icon (`Grid2x2Check`).
- **Hiragana** and **Katakana** side-by-side on large screens; stack on mobile.
- Decorative watermark kana (`かかか` / `カカカ`) optional but part of current character.

## Practice screen

- Header: back to menu, set title, mode subtitle.
- Main: large practice area (kana/romaji/canvas).
- Side: history list (scrollable).
- Instructions line under main card (Space / Enter / Check).

## Accessibility

- Focus states on buttons and inputs.
- Keyboard: Space / Enter behaviors documented in instructions.
- Touch: large hit targets on mode and set buttons.

## Responsive

- Bottom fixed bar on Custom for “Start Practice” on small screens (legacy pattern).
- Reduce heading sizes with `sm:` breakpoints.
