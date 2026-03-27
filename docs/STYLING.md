# Styling guide — matching KanaReps (legacy UI)

This document captures **visual patterns** from the Base44 app under [`kanareps/`](../../kanareps/) so you can reproduce the same look in a new React + Tailwind project. Source files are cited for copy-paste reference.

## Stack

| Layer | Legacy |
|-------|--------|
| Utility CSS | **Tailwind CSS** — [`kanareps/tailwind.config.js`](../../kanareps/tailwind.config.js) |
| Design tokens | **shadcn/ui** “new-york”, **CSS variables** — [`kanareps/src/index.css`](../../kanareps/src/index.css) |
| Components | Radix-based primitives in [`kanareps/src/components/ui/`](../../kanareps/src/components/ui/) |
| Icons | **lucide-react** |
| Animation plugin | `tailwindcss-animate` (accordion, etc.) |

[`components.json`](../../kanareps/components.json) defines shadcn paths: `baseColor: neutral`, `cssVariables: true`, `css: src/index.css`.

**Note:** The repo also contains [`globals.css`](../../kanareps/src/globals.css) with **Quicksand** and a duplicate `@tailwind` block; the app entry imports [`index.css`](../../kanareps/src/index.css) only. For parity, either merge Quicksand into `index.css` `@layer base` or import `globals.css` before `index.css` and remove duplicate `@tailwind` directives.

---

## Global look

### Page shell (almost every screen)

- **Minimum height:** `min-h-screen`
- **Background:** soft diagonal gradient  
  `bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50`
- **Page padding:** `sm:p-6 p-3` (tighter on small screens)

### Content width

| Screen | Typical wrapper |
|--------|-----------------|
| Menu | `max-w-4xl mx-auto` |
| Practice / Custom | `max-w-6xl mx-auto` |
| Profile | `max-w-2xl mx-auto` |
| Home (centered) | `max-w-md w-full` inside flex center |

### Loading state

Full-viewport center, same background gradient, purple spinner:

```txt
min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50
Loader2 … text-purple-600 animate-spin
```

---

## Typography

### Font family

Legacy intends **Quicksand** ([`globals.css`](../../kanareps/src/globals.css)):

```css
font-family: 'Quicksand', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
```

Google Fonts URL used there:

`https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap`

### Brand title (“KanaReps”)

- **Menu / headers:** gradient text, one line  
  `text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent`
- **Home hero:** larger interactive title uses **inline** linear gradient + clipped text + `gradient-shift` animation (see [Motion](#motion)). Hex colors: `#ec4899` → `#a855f7` → `#3b82f6` (pink / purple / blue).

### Body copy

- Primary description: `text-gray-600`
- Muted / secondary: `text-gray-500`, `text-sm`
- Section headings in cards: `sm:text-lg text-base font-semibold text-gray-700`

---

## Color roles (app-specific, not only shadcn defaults)

The neutral shadcn theme drives `Button` variants (`outline`, `secondary`). **Feature colors** are mostly **explicit Tailwind classes** on top:

| Use | Classes / notes |
|-----|-----------------|
| Primary marketing CTA | `bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600` (often `text-white` on colored buttons) |
| Mode: Kana → Romaji (active) | `bg-gradient-to-r from-purple-500 to-blue-500` |
| Mode: Romaji → Kana (active) | `bg-gradient-to-r from-pink-500 to-purple-500` |
| Mode: Writing (active) | `bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-600 text-gray-900` |
| Mode: inactive | `bg-gray-100 text-gray-700 hover:bg-gray-200` |
| Large “set” rows (`SetButton`) | `bg-gradient-to-r from-pink-100 to-purple-100 text-gray-700 border border-purple-200 hover:from-pink-200 hover:to-purple-200` |
| Set row disabled | `bg-gray-100 text-gray-400 border-gray-200` |
| Option toggles (Basic / Dakuten …) when on | `bg-gradient-to-r from-pink-100 to-purple-100 … border border-purple-200` |
| Option toggles when off | `bg-secondary text-gray-700 hover:bg-gray-200` (shadcn secondary) |
| Accent spinners / focus | `text-purple-600` |

Tailwind **pink / purple / blue** palette (`pink-50` … `purple-600` … `blue-500`) is the core brand range.

---

## Cards and surfaces

Default content block:

- `bg-white rounded-2xl shadow-sm`
- Padding: `sm:p-6 p-3`
- Section spacing: `mb-4` / `mb-6` / `mb-8` between blocks

Practice **inner** highlight area:

- `bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl` (question display zone)

---

## Buttons (patterns)

Base control: shadcn [`Button`](../../kanareps/src/components/ui/button.jsx) (`rounded-md`, focus ring, variants).

**Icon-only header actions:** `variant="outline" size="icon"` (profile, logout, back).

**Full-width actions:** `w-full` + gradient classes as above.

**Google sign-in (Home):** large outlined “material” style — `w-full h-14 text-lg bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400`.

---

## Custom set UI

- **Tabs:** shadcn `Tabs` / `TabsList` full width `grid grid-cols-2`, triggers show counts.
- **Kana tile** ([`KanaTile.jsx`](../../kanareps/src/components/KanaTile.jsx)): `h-10 w-10 rounded border`
  - Unselected: `bg-white/80 border-gray-300 hover:border-purple-400 hover:bg-purple-50 hover:scale-105`
  - Selected: `bg-gradient-to-br from-pink-400 to-purple-500 border-purple-600 text-white shadow-md scale-95`
  - Romaji label under glyph: `text-[8px] … opacity-70`
- **Sticky footer** (start practice): `fixed bottom-0 … w-full … bg-white border-t border-gray-200 z-[100]`, primary button full width with pink→purple gradient.

---

## Menu-specific layout

- **Header:** `sm:flex-row flex-col-reverse flex justify-between items-start mb-8` (actions stack above title on narrow screens).
- **Hiragana / Katakana columns:** `grid sm:grid-cols-2 grid-cols-1 gap-4`
- **Decorative watermark:** absolutely positioned huge gradient text (`text-[200px]`, low opacity ~`0.1`, rotated) behind each column — optional but part of the current look.

---

## Practice screen

- **Grid:** `grid grid-cols-1 lg:grid-cols-3 gap-6` — main `lg:col-span-2`, history `lg:col-span-1`
- **History card:** `bg-white rounded-2xl p-6 shadow-sm`, rows `bg-gradient-to-r from-pink-50 to-purple-50 border border-purple-200`

---

## Motion

[`tailwind.config.js`](../../kanareps/tailwind.config.js) extends:

- `animate-gradient-shift` — `gradient-shift` keyframes (background position sweep)
- `animate-gradient-x` — alternative gradient sweep
- Accordion keyframes for Radix

Home title uses **`animation: gradient-shift 4s ease infinite`** with `backgroundSize: '200% 100%'`.

Duplicate `@keyframes gradient-shift` exists in [`globals.css`](../../kanareps/src/globals.css); keep **one** definition to avoid drift.

---

## shadcn CSS variables

[`index.css`](../../kanareps/src/index.css) `:root` sets HSL tokens (`--background`, `--primary`, `--radius`, etc.). Dark mode `.dark` is defined but the app is **light-first**; gradients are hard-coded Tailwind.

**Radius:** `--radius: 0.5rem` — maps to `rounded-lg` via Tailwind extend in config.

---

## Checklist to clone the look

1. Tailwind + `tailwindcss-animate` + config **keyframes** (`gradient-shift`, `gradient-x`, accordion).
2. Copy **`index.css`** variable block + `@layer base` border/body rules.
3. Add **Quicksand** (or merge `globals.css` safely).
4. Install **shadcn** primitives matching `components.json` (Button, Tabs, Card, Table, Badge, Input, etc.) or paste from legacy `components/ui`.
5. **`cn()`** utility from [`lib/utils.js`](../../kanareps/src/lib/utils.js) for class merging.
6. Apply **page shell** + **card** + **gradient CTAs** patterns above per screen.
7. Reuse **lucide** icons at `w-4 h-4` / `w-5 h-5` for consistency.

---

## Reference file map

| Concern | File |
|---------|------|
| Tailwind theme + animations | `kanareps/tailwind.config.js` |
| Design tokens | `kanareps/src/index.css` |
| Optional font layer | `kanareps/src/globals.css` |
| shadcn config | `kanareps/components.json` |
| Menu layout + gradients | `kanareps/src/pages/Menu.jsx` |
| Landing / animated title | `kanareps/src/pages/Home.jsx` |
| Set row | `kanareps/src/components/SetButton.jsx` |
| Kana picker tile | `kanareps/src/components/KanaTile.jsx` |
| Practice layout | `kanareps/src/pages/Practice.jsx` |

This is documentation only; copy class names and structure into your new codebase as needed.
