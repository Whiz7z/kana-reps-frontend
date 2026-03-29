import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Feather, Grid2x2Check, Loader2 } from "lucide-react";
import { ApiRequestError, createCheckout, postDrill } from "@/api/client";
import type { PracticeMode } from "@/api/types";
import { useAuth } from "@/context/AuthContext";
import { SetButton } from "@/components/SetButton";
import { Button } from "@/components/ui/Button";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { savePracticeToSession } from "@/lib/practiceSession";
import { cn } from "@/lib/utils";

const LEVELS = ["Basic", "Dakuten", "Handakuten", "Yoon"] as const;

function optionToggleClass(isOn: boolean) {
  return cn(
    "flex-1 rounded-2xl px-3 py-2.5 text-sm font-semibold transition sm:min-h-[2.75rem]",
    isOn
      ? "border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 text-slate-700 hover:from-indigo-100 hover:to-purple-100"
      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
  );
}

export function Menu() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<PracticeMode>("kana-to-romaji");
  const [levelsH, setLevelsH] = useState<Set<string>>(new Set());
  const [levelsK, setLevelsK] = useState<Set<string>>(new Set());
  const [subOpen, setSubOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  const writingOk = user?.entitlements.writing ?? false;
  const showSubscribe =
    user &&
    user.subscription_status !== "active" &&
    user.role !== "admin";

  async function start(
    kanaType: "hiragana" | "katakana",
    setName: string | string[]
  ) {
    setBusy(true);
    try {
      const { kanaData } = await postDrill({
        set_name: setName,
        kana_type: kanaType,
        mode: mode === "writing" ? "romaji-to-kana" : mode,
        original_mode: mode,
      });
      const session = {
        mode,
        kanaType,
        setLabel: typeof setName === "string" ? setName : setName.join(", "),
        setName,
      };
      const payload = { ...session, kanaData };
      savePracticeToSession(payload);
      navigate("/practice", { state: payload });
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 403) {
        setSubOpen(true);
      } else {
        console.error(e);
        alert(e instanceof Error ? e.message : "Could not start drill");
      }
    } finally {
      setBusy(false);
    }
  }

  async function startLevelMix(
    kanaType: "hiragana" | "katakana",
    selected: Set<string>
  ) {
    if (selected.size === 0) return;
    await start(kanaType, [...selected]);
  }

  function toggleLevel(which: "h" | "k", label: string) {
    const set = which === "h" ? levelsH : levelsK;
    const next = new Set(set);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    if (which === "h") setLevelsH(next);
    else setLevelsK(next);
  }

  async function handleSubscribe() {
    setCheckoutBusy(true);
    try {
      const { url } = await createCheckout();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Checkout failed — are you signed in?");
      setCheckoutBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <SubscriptionModal
        open={subOpen}
        onClose={() => setSubOpen(false)}
        onSubscribe={handleSubscribe}
      />

      <div className="mb-8 flex flex-col-reverse items-start justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent" onClick={() => window.gtag_report_conversion!(undefined, "menu")}>
            KanaReps
          </h1>
          <p className="text-slate-600">Non-stop kana drills</p>
          {user && (
            <p className="mt-2 text-sm text-slate-500">
              {user.subscription_status === "trial" && user.trial_expires_at && (
                <>
                  Trial ends:{" "}
                  {new Date(user.trial_expires_at).toLocaleDateString()}
                </>
              )}
              {user.subscription_status === "active" && (
                <>Subscription active</>
              )}
              {user.subscription_status === "expired" && <>Trial expired</>}
            </p>
          )}
        </div>
        <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
          {showSubscribe && (
            <Button
              className="text-white flex items-center justify-center"
              disabled={checkoutBusy}
              onClick={() => void handleSubscribe()}
            >
              {checkoutBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading…
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          )}
        </div>
      </div>

      <section className="mb-4 rounded-3xl border border-slate-100/80 bg-white p-3 shadow-xl shadow-slate-200/50 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-700 sm:text-lg">
          Practice mode
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode("kana-to-romaji")}
            className={cn(
              "cursor-pointer rounded-2xl px-3 py-2 text-sm font-semibold transition sm:h-16 sm:text-lg",
              mode === "kana-to-romaji"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            Kana → Romaji
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode("romaji-to-kana")}
            className={cn(
              "cursor-pointer rounded-2xl px-3 py-2 text-sm font-semibold transition sm:h-16 sm:text-lg",
              mode === "romaji-to-kana"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            Romaji → Kana
          </button>
          <button
            type="button"
            disabled={busy || !writingOk}
            onClick={() => {
              if (!writingOk) setSubOpen(true);
              else setMode("writing");
            }}
            className={cn(
              "cursor-pointer col-span-2 flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition sm:h-16 sm:text-lg",
              mode === "writing"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-lg shadow-amber-500/25"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              !writingOk && "cursor-not-allowed opacity-50"
            )}
          >
            <Feather className="h-4 w-4" />
            Writing
          </button>
        </div>
      </section>

      <div className="mb-4 rounded-3xl border border-slate-100/80 bg-white p-3 shadow-xl shadow-slate-200/50 sm:p-6">
        <SetButton
          title="Custom set"
          subtitle="Pick individual kana"
          icon={<Grid2x2Check className="h-8 w-8" />}
          onClick={() => navigate("/custom")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="relative mb-3 overflow-clip rounded-3xl border border-slate-100/80 bg-white p-3 shadow-xl shadow-slate-200/50 sm:mb-6 sm:p-6">
          <div className="pointer-events-none absolute left-[-50px] top-[-50px] z-0 rotate-[-10deg] opacity-10">
            <span className="whitespace-nowrap text-[200px] font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              かかか
            </span>
          </div>
          <h2 className="relative z-[2] mb-4 text-base font-semibold text-slate-700 sm:text-lg">
            Hiragana sets
          </h2>
          <div className="relative z-[2] space-y-4">
            <SetButton
              title="First 10 Hiragana"
              disabled={busy}
              onClick={() => void start("hiragana", "First 10 Hiragana")}
            />
            <SetButton
              title="All Hiragana"
              disabled={busy}
              onClick={() => void start("hiragana", "All")}
            />
            <div className="flex flex-wrap gap-3">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  disabled={busy}
                  onClick={() => toggleLevel("h", l)}
                  className={optionToggleClass(levelsH.has(l))}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={busy || levelsH.size === 0}
              onClick={() => void startLevelMix("hiragana", levelsH)}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start Hiragana practice
            </button>
          </div>
        </section>

        <section className="relative mb-3 overflow-clip rounded-3xl border border-slate-100/80 bg-white p-3 shadow-xl shadow-slate-200/50 sm:mb-6 sm:p-6">
          <div className="pointer-events-none absolute left-[-50px] top-[-50px] z-0 rotate-[-10deg] opacity-10">
            <span className="whitespace-nowrap text-[200px] font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              カカカ
            </span>
          </div>
          <h2 className="relative z-[2] mb-4 text-base font-semibold text-slate-700 sm:text-lg">
            Katakana sets
          </h2>
          <div className="relative z-[2] space-y-4">
            <SetButton
              title="First 10 Katakana"
              disabled={busy}
              onClick={() => void start("katakana", "First 10 Katakana")}
            />
            <SetButton
              title="All Katakana"
              disabled={busy}
              onClick={() => void start("katakana", "All")}
            />
            <div className="flex flex-wrap gap-3">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  disabled={busy}
                  onClick={() => toggleLevel("k", l)}
                  className={optionToggleClass(levelsK.has(l))}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={busy || levelsK.size === 0}
              onClick={() => void startLevelMix("katakana", levelsK)}
              className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-700 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start Katakana practice
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
