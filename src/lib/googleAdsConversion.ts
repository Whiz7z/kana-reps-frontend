/**
 * Google Ads subscription conversion (gtag).
 * In Google Ads: Tools → Conversions → create “Subscribe / Purchase” → use the `send_to` value
 * (format `AW-XXXXXXXXXX/YYYYYYYYYY`).
 *
 * Set `VITE_GADS_SUBSCRIPTION_SEND_TO` in `.env` / Vercel. If unset, this is a no-op.
 */
const SEND_TO = import.meta.env.VITE_GADS_SUBSCRIPTION_SEND_TO?.trim();

let gtagBaseInitialized = false;

function ensureGtagJs(awMeasurementId: string): void {
  if (gtagBaseInitialized) return;
  gtagBaseInitialized = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", awMeasurementId);

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(awMeasurementId)}`;
  document.head.appendChild(s);
}

/**
 * Fire once per Checkout Session id (sessionStorage) so reloads / Strict Mode do not duplicate.
 */
export function fireSubscriptionConversion(checkoutSessionId: string): void {
  if (!SEND_TO?.includes("/")) return;

  const storageKey = `gads_sub_conv_${checkoutSessionId}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
  } catch {
    /* private mode */
  }

  const awId = SEND_TO.split("/")[0]!;
  if (!awId.startsWith("AW-")) return;

  ensureGtagJs(awId);
  window.gtag!("event", "conversion", {
    send_to: SEND_TO,
    transaction_id: checkoutSessionId,
  });

  try {
    sessionStorage.setItem(storageKey, "1");
  } catch {
    /* ignore */
  }
}
