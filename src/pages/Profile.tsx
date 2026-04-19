import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    trial: "bg-blue-100 text-blue-800",
    expired: "bg-red-100 text-red-800",
    cancelled: "bg-slate-100 text-slate-800",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        map[status] ?? "border border-slate-200 bg-white text-slate-700"
      )}
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label="Back to menu"
          onClick={() => navigate("/menu")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="kana-page-title text-3xl font-bold">Profile</h1>
      </div>

      <section className="rounded-3xl border border-slate-100/80 bg-[var(--color-paper)] p-4 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:shadow-black/40 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-200 sm:text-lg">
          <User className="h-5 w-5 text-[var(--color-primary)]" />
          Account information
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm text-slate-500">Display name</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="min-h-11 flex-1 rounded-2xl border border-slate-200 bg-[var(--color-paper)] px-3 py-2 text-slate-900 shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]/30 dark:border-slate-600 dark:text-slate-100"
              />
              <Button
                disabled={
                  saving ||
                  !name?.trim() ||
                  name.trim() === (user.username ?? "")
                }
                onClick={() => void saveName()}
                className="shrink-0 sm:px-3"
                aria-label="Save name"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-slate-500">Email</p>
            <input
              value={user.email}
              disabled
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-600"
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100/80 bg-[var(--color-paper)] p-4 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:shadow-black/40 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-700 sm:text-lg">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          {isLifetimeOwner ? "Lifetime access" : "Access"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {isLifetimeOwner
            ? "Thanks for supporting KanaReps — you're unlocked forever."
            : isLegacySubscriber
              ? "Manage your legacy subscription and billing."
              : "Unlock writing mode, word practice, and unlimited custom sets with a one-time payment."}
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-slate-500">Status</span>
            <StatusBadge status={user.subscription_status} />
          </div>
          {user.subscription_status === "trial" && user.trial_expires_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Trial expires</span>
              <span className="font-medium text-slate-800">
                {formatDate(user.trial_expires_at)}
              </span>
            </div>
          )}
          {isLifetimeOwner && user.purchased_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Purchased</span>
              <span className="font-medium text-slate-800">
                {formatDate(user.purchased_at)}
              </span>
            </div>
          )}
          {isLegacySubscriber && user.subscription_expires_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Next billing</span>
              <span className="font-medium text-slate-800">
                {new Date(user.subscription_expires_at).toLocaleDateString()}
              </span>
            </div>
          )}
          {!isLifetimeOwner &&
            !isLegacySubscriber &&
            (user.subscription_status === "expired" ||
              user.subscription_status === "cancelled") && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-900">
                  Get lifetime access to keep writing mode and premium sets
                  unlocked forever.
                </p>
              </div>
            )}
          <div className="flex flex-wrap gap-3 pt-2">
            {!isLifetimeOwner && !isLegacySubscriber && (
              <Button
                className="flex-1 text-white"
                disabled={billingBusy}
                onClick={() => void buyLifetime()}
              >
                {billingBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Get lifetime access"
                )}
              </Button>
            )}
            {isLegacySubscriber && user.stripe_customer_id && (
              <Button
                variant="secondary"
                className="flex-1"
                disabled={billingBusy}
                onClick={() => void portal()}
              >
                {billingBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Manage billing"
                )}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
