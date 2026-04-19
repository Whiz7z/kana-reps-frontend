import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Save,
  User,
} from "lucide-react";
import {
  createCheckout,
  createPortal,
  isAlreadyOwnedError,
  updateUsername,
} from "@/api/client";
import { useAuth } from "@/context/AuthContext";

// ---------------------------------------------------------------------------
// Status badge — tone-tinted pill, driven by the backend status string.
// ---------------------------------------------------------------------------

type StatusTone = "success" | "info" | "warning" | "danger" | "neutral";

const STATUS_TONE: Record<string, StatusTone> = {
  active: "success",
  trial: "info",
  expired: "danger",
  cancelled: "neutral",
};

function toneStyle(tone: StatusTone): CSSProperties {
  switch (tone) {
    case "success":
      return {
        background: "var(--practice-success-soft)",
        color: "var(--practice-success)",
        borderColor: "color-mix(in srgb, var(--practice-success) 20%, transparent)",
      };
    case "info":
      return {
        background: "var(--practice-info-soft)",
        color: "var(--practice-info)",
        borderColor: "color-mix(in srgb, var(--practice-info) 20%, transparent)",
      };
    case "warning":
      return {
        background: "var(--practice-warning-soft)",
        color: "var(--practice-warning)",
        borderColor: "color-mix(in srgb, var(--practice-warning) 20%, transparent)",
      };
    case "danger":
      return {
        background: "var(--practice-danger-soft)",
        color: "var(--practice-danger)",
        borderColor: "color-mix(in srgb, var(--practice-danger) 20%, transparent)",
      };
    case "neutral":
    default:
      return {
        background: "var(--practice-surface-elev)",
        color: "var(--practice-text-secondary)",
        borderColor: "var(--practice-stroke-subtle)",
      };
  }
}

function StatusBadge({ status }: { status: string }) {
  const tone: StatusTone = STATUS_TONE[status] ?? "neutral";
  const style = toneStyle(tone);
  return (
    <span
      style={{
        padding: "2px 10px",
        borderRadius: 999,
        fontFamily: "var(--practice-ui-font)",
        fontSize: 11,
        fontWeight: 600,
        border: "1px solid",
        ...style,
      }}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------

export function Profile() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [billingBusy, setBillingBusy] = useState(false);

  useEffect(() => {
    setName(user?.username ?? "");
  }, [user?.username]);

  if (!user) return null;

  const isLifetimeOwner = Boolean(user.purchased_at);
  // Legacy recurring subscriber: still inside an active billing period.
  const isLegacySubscriber =
    user.subscription_status === "active" &&
    !!user.subscription_expires_at &&
    !isLifetimeOwner;

  const needsUpsell =
    !isLifetimeOwner &&
    !isLegacySubscriber &&
    (user.subscription_status === "expired" ||
      user.subscription_status === "cancelled");

  const isTrial =
    !isLifetimeOwner &&
    !isLegacySubscriber &&
    user.subscription_status === "trial";

  const nameTrimmed = name.trim();
  const canSave =
    !saving && !!nameTrimmed && nameTrimmed !== (user.username ?? "");

  async function saveName() {
    setSaving(true);
    try {
      await updateUsername(name);
      await refresh();
    } catch (e) {
      console.error(e);
      alert("Could not update name");
    } finally {
      setSaving(false);
    }
  }

  async function buyLifetime() {
    setBillingBusy(true);
    try {
      const { url } = await createCheckout();
      window.location.href = url;
    } catch (e) {
      if (isAlreadyOwnedError(e)) {
        await refresh();
        alert("You already have lifetime access.");
      } else {
        console.error(e);
        alert("Checkout failed");
      }
      setBillingBusy(false);
    }
  }

  async function portal() {
    setBillingBusy(true);
    try {
      const { url } = await createPortal();
      window.location.href = url;
    } catch (e) {
      console.error(e);
      alert("Billing portal is only available for legacy subscribers");
      setBillingBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4 px-3 sm:gap-5 sm:px-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Back to menu"
          onClick={() => navigate("/menu")}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center transition"
          style={{
            borderRadius: "var(--practice-radius)",
            border: "1px solid var(--practice-stroke)",
            background: "var(--practice-surface)",
            color: "var(--practice-text-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--practice-hover-tint)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--practice-surface)";
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1
          style={{
            color: "var(--practice-accent)",
            fontFamily: "var(--practice-ui-font)",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            margin: 0,
          }}
        >
          Profile
        </h1>
      </div>

      <Card>
        <CardHeading icon={<User className="h-4 w-4" />}>
          Account information
        </CardHeading>
        <div className="mt-4 grid gap-3.5">
          <Field label="Display name">
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "var(--practice-input-bg)",
                  border: "1px solid var(--practice-stroke)",
                  borderRadius: "var(--practice-radius)",
                  padding: "9px 12px",
                  fontFamily: "var(--practice-ui-font)",
                  fontSize: 13,
                  color: "var(--practice-text)",
                  outline: "none",
                }}
              />
              <button
                type="button"
                disabled={!canSave}
                onClick={() => void saveName()}
                aria-label="Save name"
                className="inline-flex shrink-0 items-center justify-center transition"
                style={{
                  width: 38,
                  height: 38,
                  background: canSave
                    ? "var(--practice-accent-soft)"
                    : "var(--practice-surface-elev)",
                  color: canSave
                    ? "var(--practice-accent)"
                    : "var(--practice-text-tertiary)",
                  borderRadius: "var(--practice-radius)",
                  border: "1px solid var(--practice-stroke)",
                  opacity: canSave ? 1 : 0.7,
                }}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </button>
            </div>
          </Field>
          <Field label="Email">
            <div
              style={{
                background: "var(--practice-input-bg-disabled)",
                border: "1px solid var(--practice-stroke-subtle)",
                borderRadius: "var(--practice-radius)",
                padding: "9px 12px",
                fontFamily: "var(--practice-ui-font)",
                fontSize: 13,
                color: "var(--practice-text-secondary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={user.email}
            >
              {user.email}
            </div>
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeading icon={<CreditCard className="h-4 w-4" />}>
          {isLifetimeOwner ? "Lifetime access" : "Access"}
        </CardHeading>
        <p
          style={{
            marginTop: 4,
            color: "var(--practice-text-secondary)",
            fontFamily: "var(--practice-ui-font)",
            fontSize: 12,
          }}
        >
          {isLifetimeOwner
            ? "Thanks for supporting KanaReps — you're unlocked forever."
            : isLegacySubscriber
              ? "Manage your legacy subscription and billing."
              : "Unlock writing mode, word practice, and unlimited custom sets with a one-time payment."}
        </p>
        <div className="mt-4 grid gap-2.5">
          <MetaRow label="Status">
            <StatusBadge status={user.subscription_status} />
          </MetaRow>

          {isLifetimeOwner && user.purchased_at && (
            <MetaRow label="Purchased">
              <MetaValue>{formatDate(user.purchased_at)}</MetaValue>
            </MetaRow>
          )}
          {isTrial && user.trial_expires_at && (
            <MetaRow label="Trial expires">
              <MetaValue>{formatDate(user.trial_expires_at)}</MetaValue>
            </MetaRow>
          )}
          {isLegacySubscriber && user.subscription_expires_at && (
            <MetaRow label="Next billing">
              <MetaValue>{formatDate(user.subscription_expires_at)}</MetaValue>
            </MetaRow>
          )}

          {needsUpsell && (
            <div
              style={{
                marginTop: 4,
                background: "var(--practice-warning-soft)",
                border: "1px solid color-mix(in srgb, var(--practice-warning) 20%, transparent)",
                borderRadius: "var(--practice-radius)",
                padding: "11px 14px",
                color: "var(--practice-warning-ink)",
                fontFamily: "var(--practice-ui-font)",
                fontSize: 12,
              }}
            >
              Get lifetime access to keep writing mode and premium sets
              unlocked forever.
            </div>
          )}

          {(isTrial || needsUpsell) && (
            <div className="mt-1">
              <PrimaryCTA
                disabled={billingBusy}
                onClick={() => void buyLifetime()}
              >
                {billingBusy ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Get lifetime access"
                )}
              </PrimaryCTA>
            </div>
          )}

          {isLegacySubscriber && user.stripe_customer_id && (
            <div className="mt-1">
              <SecondaryCTA
                disabled={billingBusy}
                onClick={() => void portal()}
              >
                {billingBusy ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Manage billing"
                )}
              </SecondaryCTA>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cards, fields, rows
// ---------------------------------------------------------------------------

function Card({ children }: { children: ReactNode }) {
  return (
    <section
      style={{
        background: "var(--practice-surface)",
        border: "1px solid var(--practice-stroke)",
        borderRadius: "var(--practice-radius)",
        padding: 20,
      }}
    >
      {children}
    </section>
  );
}

function CardHeading({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        style={{
          color: "var(--practice-accent)",
          display: "inline-flex",
        }}
      >
        {icon}
      </span>
      <span
        style={{
          color: "var(--practice-text)",
          fontFamily: "var(--practice-ui-font)",
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        {children}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          color: "var(--practice-text-secondary)",
          fontFamily: "var(--practice-ui-font)",
          fontSize: 12,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        fontFamily: "var(--practice-ui-font)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--practice-text-secondary)" }}>{label}</span>
      {children}
    </div>
  );
}

function MetaValue({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--practice-ui-font)",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--practice-text)",
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// CTA buttons
// ---------------------------------------------------------------------------

function PrimaryCTA({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full transition"
      style={{
        background: "var(--practice-accent)",
        color: "var(--practice-accent-ink)",
        padding: "11px 16px",
        borderRadius: "var(--practice-radius)",
        border: "none",
        fontFamily: "var(--practice-ui-font)",
        fontSize: 13,
        fontWeight: 600,
        textAlign: "center",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.9";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
}

function SecondaryCTA({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full transition"
      style={{
        background: "var(--practice-surface-elev)",
        color: "var(--practice-text)",
        padding: "11px 16px",
        borderRadius: "var(--practice-radius)",
        border: "1px solid var(--practice-stroke)",
        fontFamily: "var(--practice-ui-font)",
        fontSize: 13,
        fontWeight: 600,
        textAlign: "center",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          e.currentTarget.style.background = "var(--practice-hover-tint)";
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          e.currentTarget.style.background = "var(--practice-surface-elev)";
      }}
    >
      {children}
    </button>
  );
}
