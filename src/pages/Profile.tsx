import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Save,
  User,
} from "lucide-react";
import { createCheckout, createPortal, updateUsername } from "@/api/client";
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

  async function subscribe() {
    setBillingBusy(true);
    try {
      const { url } = await createCheckout();
      window.location.href = url;
    } catch (e) {
      console.error(e);
      alert("Checkout failed");
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
      alert("Open billing portal (needs Stripe customer)");
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          Profile
        </h1>
      </div>

      <section className="rounded-3xl border border-slate-100/80 bg-white p-4 shadow-xl shadow-slate-200/50 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-700 sm:text-lg">
          <User className="h-5 w-5 text-indigo-600" />
          Account information
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm text-slate-500">Display name</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="min-h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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

      <section className="rounded-3xl border border-slate-100/80 bg-white p-4 shadow-xl shadow-slate-200/50 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-700 sm:text-lg">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          Subscription
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your subscription and billing.
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
                {new Date(user.trial_expires_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
          {user.subscription_status === "active" &&
            user.subscription_expires_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Next billing</span>
                <span className="font-medium text-slate-800">
                  {new Date(user.subscription_expires_at).toLocaleDateString()}
                </span>
              </div>
            )}
          {(user.subscription_status === "expired" ||
            user.subscription_status === "cancelled") && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-900">
                Subscribe to keep full access to writing and premium sets.
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            {user.subscription_status !== "active" && (
              <Button
                className="flex-1 text-white"
                disabled={billingBusy}
                onClick={() => void subscribe()}
              >
                {billingBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Subscribe now"
                )}
              </Button>
            )}
            {user.subscription_status === "active" &&
              user.stripe_customer_id && (
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
