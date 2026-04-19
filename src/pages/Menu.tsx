import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookText, Feather, Grid2x2Check, Loader2 } from "lucide-react";
import {
  ApiRequestError,
  createCheckout,
  isAlreadyOwnedError,
  postDrill,
} from "@/api/client";
import type { PracticeMode } from "@/api/types";
import { useAuth } from "@/context/AuthContext";
import {
  LevelChip,
  LevelChipRow,
  MenuPanel,
  MenuRoot,
  MenuSetCard,
  MenuStatusRow,
  ModeChip,
  ModePickerGrid,
  MenuSectionLabel,
  PillCTA,
  PrimaryCTA,
  SetRow,
} from "@/components/menu/MenuUI";
import {
  SubscriptionModal,
  type SubscriptionFeature,
} from "@/components/SubscriptionModal";
import { savePracticeToSession } from "@/lib/practiceSession";

const LEVELS = ["Basic", "Dakuten", "Handakuten", "Yoon"] as const;
type Level = (typeof LEVELS)[number];

export function Menu() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [mode, setMode] = useState<PracticeMode>("kana-to-romaji");
  const [levelsH, setLevelsH] = useState<Set<Level>>(new Set());
  const [levelsK, setLevelsK] = useState<Set<Level>>(new Set());
  const [subOpen, setSubOpen] = useState(false);
  const [subFeature, setSubFeature] =
    useState<SubscriptionFeature>("writing");
  const [busy, setBusy] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  const writingOk = user?.entitlements.writing ?? false;
  const wordOk = user?.entitlements.word_practice ?? false;

  function openSubscribe(feature: SubscriptionFeature) {
    setSubFeature(feature);
    setSubOpen(true);
  }

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
        openSubscribe("writing");
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
    selected: Set<Level>
  ) {
    if (selected.size === 0) return;
    await start(kanaType, [...selected]);
  }

  function toggleLevel(which: "h" | "k", label: Level) {
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
      if (isAlreadyOwnedError(err)) {
        await refresh();
        alert("You already have lifetime access.");
      } else {
        console.error(err);
        alert("Checkout failed — are you signed in?");
      }
      setCheckoutBusy(false);
    }
  }

  return (
    <MenuRoot>
      <SubscriptionModal
        open={subOpen}
        feature={subFeature}
        onClose={() => setSubOpen(false)}
        onSubscribe={handleSubscribe}
      />

      <MenuStatusRow
        status={<AccountStatusText />}
        action={
          showSubscribe && (
            <PillCTA
              disabled={checkoutBusy}
              onClick={() => void handleSubscribe()}
            >
              {checkoutBusy ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading…
                </>
              ) : (
                "Get lifetime access"
              )}
            </PillCTA>
          )
        }
      />

      <MenuPanel>
        <MenuSectionLabel>Practice mode</MenuSectionLabel>
        <ModePickerGrid>
          <ModeChip
            active={mode === "kana-to-romaji"}
            disabled={busy}
            onClick={() => setMode("kana-to-romaji")}
          >
            Kana → Romaji
          </ModeChip>
          <ModeChip
            active={mode === "romaji-to-kana"}
            disabled={busy}
            onClick={() => setMode("romaji-to-kana")}
          >
            Romaji → Kana
          </ModeChip>
          <ModeChip
            active={mode === "writing"}
            disabled={busy}
            locked={!writingOk}
            span={2}
            leading={<Feather className="h-4 w-4" aria-hidden />}
            onClick={() => {
              if (!writingOk) openSubscribe("writing");
              else setMode("writing");
            }}
          >
            Writing
          </ModeChip>
        </ModePickerGrid>
      </MenuPanel>

      <MenuPanel>
        <div className="flex flex-col gap-2.5">
          <SetRow
            icon={<Grid2x2Check className="h-5 w-5" aria-hidden />}
            title="Custom set"
            subtitle="Pick individual kana"
            onClick={() => navigate("/custom")}
          />
          <SetRow
            icon={<BookText className="h-5 w-5" aria-hidden />}
            title="Word practice"
            subtitle="Real Japanese words by theme"
            locked={!wordOk}
            onClick={() =>
              wordOk ? navigate("/words") : openSubscribe("word_practice")
            }
          />
        </div>
      </MenuPanel>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MenuSetCard label="Hiragana sets" watermark="かかか">
          <SetRow
            title="First 10 Hiragana"
            minimal
            disabled={busy}
            onClick={() => void start("hiragana", "First 10 Hiragana")}
          />
          <SetRow
            title="All Hiragana"
            minimal
            disabled={busy}
            onClick={() => void start("hiragana", "All")}
          />
          <LevelChipRow>
            {LEVELS.map((l) => (
              <LevelChip
                key={l}
                active={levelsH.has(l)}
                disabled={busy}
                onClick={() => toggleLevel("h", l)}
              >
                {l}
              </LevelChip>
            ))}
          </LevelChipRow>
          <PrimaryCTA
            disabled={busy || levelsH.size === 0}
            onClick={() => void startLevelMix("hiragana", levelsH)}
          >
            Start Hiragana practice
          </PrimaryCTA>
        </MenuSetCard>

        <MenuSetCard label="Katakana sets" watermark="カカカ">
          <SetRow
            title="First 10 Katakana"
            minimal
            disabled={busy}
            onClick={() => void start("katakana", "First 10 Katakana")}
          />
          <SetRow
            title="All Katakana"
            minimal
            disabled={busy}
            onClick={() => void start("katakana", "All")}
          />
          <LevelChipRow>
            {LEVELS.map((l) => (
              <LevelChip
                key={l}
                active={levelsK.has(l)}
                disabled={busy}
                onClick={() => toggleLevel("k", l)}
              >
                {l}
              </LevelChip>
            ))}
          </LevelChipRow>
          <PrimaryCTA
            disabled={busy || levelsK.size === 0}
            onClick={() => void startLevelMix("katakana", levelsK)}
          >
            Start Katakana practice
          </PrimaryCTA>
        </MenuSetCard>
      </div>
    </MenuRoot>
  );
}

function AccountStatusText() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.subscription_status === "trial" && user.trial_expires_at) {
    return (
      <>Trial ends · {new Date(user.trial_expires_at).toLocaleDateString()}</>
    );
  }
  if (user.subscription_status === "active") {
    return <>{user.purchased_at ? "Lifetime access" : "Subscription active"}</>;
  }
  if (user.subscription_status === "expired") {
    return <>Trial expired</>;
  }
  return null;
}
