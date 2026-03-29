# Google Ads: subscription conversion and `VITE_GADS_SUBSCRIPTION_SEND_TO`

This app fires a **Google Ads conversion** in the browser after Stripe Checkout succeeds, when the user returns to `/menu?session_id=…`. You need a **conversion action** in Google Ads and its **`send_to`** string for the env var `VITE_GADS_SUBSCRIPTION_SEND_TO`.

The value always looks like:

```txt
AW-12345678901/AbCdEfGhIjKlMnOpQr
```

- **`AW-…`** = your Google Ads account’s measurement ID (often the same as in `gtag.js` on the landing page).
- **`/…`** = the **conversion label** for this specific action (unique per conversion).

---

## 1. Open Conversions in Google Ads

1. Sign in to [Google Ads](https://ads.google.com).
2. Open the **Goals** (or **Tools and settings**) area — exact labels vary by account layout.
3. Under **Measurement**, open **Conversions** (sometimes **Goals → Summary → Conversions**).

You should see a list of existing conversion actions and a way to create a new one (e.g. **+ New conversion action** or **Create conversion action**).

---

## 2. Create a new conversion action

1. Choose **Website** (or **Web**), not “App” or “Phone calls”, unless you intentionally want something else.
2. Pick a category that fits a paid subscription, for example:
   - **Purchase**, or  
   - **Subscribe** (if available), or  
   - **Sign-up**  
   (Categories affect reporting only; pick what matches how you optimize campaigns.)
3. Give it a clear name, e.g. `KanaReps — Subscription (Stripe)`.
4. **Value**: optional — you can set a fixed value, use transaction-specific values later, or leave default; for subscription LTV many teams use a fixed estimate or leave unset at first.
5. **Count**: usually **One** per conversion (recommended for subscriptions so repeat page loads don’t inflate counts; the app also dedupes by `session_id` in `sessionStorage`).
6. Complete the wizard through **Create** / **Save**.

---

## 3. Get the `send_to` string (conversion label)

After the action is created, Google shows **tag setup** / **Set up the tag**:

1. Choose **Install the tag yourself** (or **Use Google Tag Manager** if you use GTM — then you’d configure GTM instead of this env var; this doc assumes **manual / in-app gtag**).
2. You will see a snippet similar to:

   ```html
   <script>
     gtag('event', 'conversion', {
       'send_to': 'AW-17787276581/xxxxxxxxxxxxx',
       'transaction_id': ''
     });
   </script>
   ```

3. Copy the **`send_to`** value **exactly** as shown — including **`AW-`** and the **`/`** and the second part (the label).  
   - Example: `AW-17787276581/AbC-dEfGhIjKlMnOp`

That full string is what you put in:

```env
VITE_GADS_SUBSCRIPTION_SEND_TO=AW-17787276581/AbC-dEfGhIjKlMnOp
```

**Do not** add quotes in `.env` unless your tooling requires them; no spaces around `=`.

---

## 4. Put it in your environment

| Environment | Where |
|-------------|--------|
| Local | `kana-reps-frontend/.env` (not committed if gitignored) |
| Production | Vercel (or host) → **Environment Variables** for the **frontend** project → add `VITE_GADS_SUBSCRIPTION_SEND_TO` → **redeploy** so Vite embeds it at build time |

See also [`.env.example`](../.env.example).

---

## 5. How it ties to your code (sanity check)

1. User finishes **Stripe Checkout**; Stripe redirects to `{your-app}/menu?session_id=cs_…`.
2. The frontend calls **`GET /api/billing/checkout-session?session_id=…`** (logged-in user only) to confirm the session is **paid** and belongs to that user.
3. If verified, [`src/lib/googleAdsConversion.ts`](../src/lib/googleAdsConversion.ts) runs `gtag('event', 'conversion', { send_to: …, transaction_id: session_id })`.

So the **conversion action** you create must match the **`send_to`** you paste into `VITE_GADS_SUBSCRIPTION_SEND_TO`.

---

## 6. Testing

1. **Google Tag Assistant** (Chrome extension) or **Google Ads → Conversions → [your action] → Test** — follow the in-product test flow if offered.
2. Run through a **real or test** Stripe Checkout in **test mode**, return to the app with `session_id` in the URL, and confirm the tag fires (network requests to `googleadservices.com` / `googletagmanager.com`).
3. Conversions in the Google Ads UI can lag **several hours**; same-day “0” is not always a failure.

---

## 7. If you already have `AW-…` on the landing site

The **first part** of `send_to` (`AW-17787276581`) is often the same as the ID in your landing page `gtag('config', 'AW-…')`. The **second part** (after `/`) is **per conversion action** — create a **dedicated** “Subscription” conversion and use **its** full `send_to`, not only the account ID.

---

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| No conversion in Ads | `VITE_GADS_SUBSCRIPTION_SEND_TO` set on the **frontend** build; redeploy after changing env. |
| **Subscribed but still 0 conversions** | Backend treats checkout as successful when `payment_status` is **`paid`** *or* **`no_payment_required`** (typical for **free trials** or $0 first period). If you deployed an older backend, redeploy. In **dev**, open the browser console: look for `[gads] Stripe checkout-session verified:` and `[gads] conversion event queued`. |
| Ad blockers | Disable for testing; real users with blockers won’t be counted. |
| Wrong user / API errors | User must stay **logged in** when returning from Stripe; `VITE_API_URL` must point at the same backend that created the session (cookie/session domain). |
| Duplicate counts | App uses `transaction_id` + `sessionStorage`; keep **Count** = one per conversion in Google Ads. |
| Reporting delay | Google Ads can take **hours** (sometimes 24–72h) to show conversions; use **Tag Assistant** or network tab (`googleadservices.com` / `google-analytics.com`) to confirm the tag fired. |

If Google’s menus move, search the help center for **“create conversion action website”** — the important artifact is always the **`send_to`** line in the conversion snippet.
