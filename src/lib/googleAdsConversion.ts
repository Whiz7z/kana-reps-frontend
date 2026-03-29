/**
 * Google Ads subscription conversion — aligned with the event snippet in `index.html`
 * (gtag base + `send_to` / value / currency).
 *
 * Optional override: `VITE_GADS_SUBSCRIPTION_SEND_TO` if the conversion label changes
 * (must stay under the same AW- account as `gtag('config', 'AW-…')` in index.html).
 */

/** Must match the event snippet in `index.html` (Google Ads → conversion action). */
const DEFAULT_SEND_TO = "AW-16714584801/PofSCM6K-JEcEOGlkaI-";
const CONVERSION_VALUE = 1.0;
const CONVERSION_CURRENCY = "GBP";

const sendTo =
  import.meta.env.VITE_GADS_SUBSCRIPTION_SEND_TO?.trim() || DEFAULT_SEND_TO;

function fireViaGlobalHelper(checkoutSessionId: string): boolean {
  const helper = window.gtag_report_conversion;
  if (typeof helper !== "function") return false;
  // Snippet: first arg = redirect URL (omit for SPA), second = Stripe Checkout Session id
  helper(undefined, checkoutSessionId);
  return true;
}

function fireViaGtag(checkoutSessionId: string): void {
  if (typeof window.gtag !== "function") {
    if (import.meta.env.DEV) {
      console.warn("[gads] window.gtag missing — check index.html gtag snippets");
    }
    return;
  }

  window.gtag("event", "conversion", {
    send_to: sendTo,
    value: CONVERSION_VALUE,
    currency: CONVERSION_CURRENCY,
    transaction_id: checkoutSessionId,
  });
}

/**
 * Fire once per Checkout Session id (sessionStorage) so reloads / Strict Mode do not duplicate.
 */
export function fireSubscriptionConversion(checkoutSessionId: string): void {
  if (!sendTo.includes("/")) {
    if (import.meta.env.DEV) {
      console.warn("[gads] Invalid send_to — conversion not sent");
    }
    return;
  }

  const storageKey = `gads_sub_conv_${checkoutSessionId}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
  } catch {
    /* private mode */
  }

  const usedHelper = fireViaGlobalHelper(checkoutSessionId);
  if (!usedHelper) {
    fireViaGtag(checkoutSessionId);
  }

  if (import.meta.env.DEV) {
    console.info("[gads] conversion event queued", {
      send_to: sendTo,
      value: CONVERSION_VALUE,
      currency: CONVERSION_CURRENCY,
      transaction_id: checkoutSessionId,
      via: usedHelper ? "gtag_report_conversion" : "gtag",
    });
  }

  try {
    sessionStorage.setItem(storageKey, "1");
  } catch {
    /* ignore */
  }
}
