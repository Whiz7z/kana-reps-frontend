import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Feather, Lock } from "lucide-react";
import type { KanaRow, PracticeMode } from "@/api/types";
import {
  ApiRequestError,
  createCheckout,
  fetchKanaCatalog,
  fetchKanaGuessStats,
  isAlreadyOwnedError,
  postDrill,
} from "@/api/client";
import { KanaGrid } from "@/components/KanaGrid";
import type { KanaGuessStatsMap } from "@/types/kanaGuessStats";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { savePracticeToSession } from "@/lib/practiceSession";
import { useAuth } from "@/context/AuthContext";
import { kanaKey, migrateLegacyKey } from "@/lib/kanaKeys";
import { cn } from "@/lib/utils";

const KEY_H = "kanareps:custom:h";
const KEY_K = "kanareps:custom:k";
const KEY_TAB = "kanareps:custom:tab";

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveSet(key: string, s: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...s]));
}

function persistFromMerged(selected: Set<string>) {
  const h = [...selected].filter((k) => k.endsWith(":hiragana"));
  const kk = [...selected].filter((k) => k.endsWith(":katakana"));
  saveSet(KEY_H, new Set(h));
  saveSet(KEY_K, new Set(kk));
}

function loadInitialSelected(): Set<string> {
  return new Set([...loadSet(KEY_H), ...loadSet(KEY_K)]);
}

export function Custom() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [catalog, setCatalog] = useState<KanaRow[]>([]);
  const [tab, setTab] = useState<"hiragana" | "katakana">(() => {
    const t = localStorage.getItem(KEY_TAB);
    return t === "katakana" ? "katakana" : "hiragana";
  });
  const [selected, setSelected] = useState(loadInitialSelected);
  const [mode, setMode] = useState<PracticeMode>("kana-to-romaji");
  const [subOpen, setSubOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [guessStats, setGuessStats] = useState<KanaGuessStatsMap>(
    () => new Map()
  );
  const migratedRef = useRef(false);

  useEffect(() => {
    void fetchKanaCatalog().then(setCatalog).catch(console.error);
  }, []);

  useEffect(() => {
    if (!user) {
      setGuessStats(new Map());
      return;
    }
    let cancelled = false;
    void fetchKanaGuessStats()
      .then((items) => {
        if (cancelled) return;
        const m: KanaGuessStatsMap = new Map();
        for (const it of items) {
          m.set(`${it.char}:${it.kana_type}`, {
            correct: it.correct_count,
            wrong: it.wrong_count,
          });
        }
        setGuessStats(m);
      })
      .catch(() => {
        if (!cancelled) setGuessStats(new Map());
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    localStorage.setItem(KEY_TAB, tab);
  }, [tab]);

  useEffect(() => {
    if (catalog.length === 0 || migratedRef.current) return;
    migratedRef.current = true;
    setSelected((prev) => {
      const next = new Set<string>();
      let changed = false;
      for (const key of prev) {
        if (catalog.some((r) => kanaKey(r) === key)) {
          next.add(key);
          continue;
        }
        const m = migrateLegacyKey(key, catalog);
        if (m) next.add(m);
        changed = true;
      }
      if (!changed && next.size === prev.size) return prev;
      return next;
    });
  }, [catalog]);

  // Persist selection to localStorage whenever it changes. Kept out of the
  // state-updater functions so React Strict Mode's double-invocation doesn't
  // trigger duplicate writes, and so updaters stay pure.
  const persistedOnceRef = useRef(false);
  useEffect(() => {
    if (!persistedOnceRef.current) {
      persistedOnceRef.current = true;
      return;
    }
    persistFromMerged(selected);
  }, [selected]);

  // One pass over the catalog + selection produces everything we need:
  // per-script counts and the custom-romaji payload used to start practice.
  const { countHiragana, countKatakana, customRomaji } = useMemo(() => {
    let h = 0;
    let k = 0;
    const seen = new Set<string>();
    const romaji: { romaji: string; type: string }[] = [];
    for (const row of catalog) {
      const key = kanaKey(row);
      if (!selected.has(key) || seen.has(key)) continue;
      seen.add(key);
      if (row.kana_type === "hiragana") h++;
      else if (row.kana_type === "katakana") k++;
      romaji.push({ romaji: row.romaji, type: row.kana_type });
    }
    return { countHiragana: h, countKatakana: k, customRomaji: romaji };
  }, [catalog, selected]);
  const totalSelected = countHiragana + countKatakana;

  const onToggle = useCallback((key: string, _row: KanaRow) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const onBulkRow = useCallback((keys: string[], select: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (select) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  }, []);

  const selectAllKana = useCallback(() => {
    onBulkRow(catalog.map(kanaKey), true);
  }, [catalog, onBulkRow]);

  const clearAllKana = useCallback(() => {
    onBulkRow(catalog.map(kanaKey), false);
  }, [catalog, onBulkRow]);

  async function start() {
    if (customRomaji.length === 0) return;
    setBusy(true);
    try {
      const { kanaData } = await postDrill({
        custom_romaji: customRomaji,
        original_mode: mode,
        mode: mode === "writing" ? "romaji-to-kana" : mode,
      });
      const payload = {
        mode,
        kanaType: "hiragana" as const,
        setLabel: "Custom",
        setName: undefined as string | string[] | undefined,
        customRomaji,
        kanaData,
      };
      savePracticeToSession(payload);
      navigate("/practice", { state: payload });
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 403) setSubOpen(true);
      else alert(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  const writingOk = user?.entitlements.writing ?? false;
  const readyCount = customRomaji.length;

  return (
    <div
      className=" mx-auto w-full pb-24 sm:pb-8"
      style={{ color: "var(--practice-text)" }}
    >
      <SubscriptionModal
        open={subOpen}
        onClose={() => setSubOpen(false)}
        onSubscribe={async () => {
          try {
            const { url } = await createCheckout();
            window.location.href = url;
          } catch (err) {
            if (isAlreadyOwnedError(err)) {
              await refresh();
              setSubOpen(false);
              alert("You already have lifetime access.");
            } else {
              console.error(err);
              alert("Checkout failed — sign in and try again.");
            }
          }
        }}
      />

      <header className="mb-5 flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate("/menu")}
          aria-label="Back to menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center transition hover:opacity-80 self-center"
          style={{
            background: "var(--practice-surface)",
            border: "1px solid var(--practice-stroke)",
            borderRadius: "var(--practice-radius)",
            color: "var(--practice-text-secondary)",
          }}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <h1
            className="practice-kana truncate text-2xl font-semibold leading-tight sm:text-3xl"
            style={{ color: "var(--practice-text)" }}
          >
            Custom set
          </h1>
          <p
            className="practice-ui mt-1 text-xs sm:text-sm"
            style={{ color: "var(--practice-text-secondary)" }}
          >
            <span style={{ color: "var(--practice-text)", fontWeight: 600 }}>
              {totalSelected}
            </span>{" "}
            kana selected ·{" "}
            <span style={{ color: "var(--practice-text)", fontWeight: 600 }}>
              {countHiragana} Hiragana
            </span>{" "}
            ·{" "}
            <span style={{ color: "var(--practice-text)", fontWeight: 600 }}>
              {countKatakana} Katakana
            </span>
          </p>
        </div>
      </header>

      <section
        className="mb-4 p-3 sm:p-4"
        style={{
          background: "var(--practice-surface)",
          border: "1px solid var(--practice-stroke)",
          borderRadius: "var(--practice-radius)",
        }}
      >
        <div
          className="practice-ui mb-2.5 uppercase"
          style={{
            color: "var(--practice-text-tertiary)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.4,
          }}
        >
          Practice mode
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ModeButton
            active={mode === "kana-to-romaji"}
            onClick={() => setMode("kana-to-romaji")}
          >
            Kana → Romaji
          </ModeButton>
          <ModeButton
            active={mode === "romaji-to-kana"}
            onClick={() => setMode("romaji-to-kana")}
          >
            Romaji → Kana
          </ModeButton>
          <div className="col-span-2">
            <ModeButton
              active={mode === "writing"}
              disabled={!writingOk}
              onClick={() => {
                if (!writingOk) setSubOpen(true);
                else setMode("writing");
              }}
            >
              {writingOk ? (
                <Feather className="h-4 w-4" aria-hidden />
              ) : (
                <Lock className="h-3.5 w-3.5" aria-hidden />
              )}
              <span>Writing</span>
            </ModeButton>
          </div>
        </div>
      </section>

      <div
        className="sticky top-0 z-30 mb-3 flex items-center gap-2 px-3 py-2 sm:py-2.5"
        style={{
          background: "var(--practice-surface)",
          border: "1px solid var(--practice-stroke)",
          borderRadius: "var(--practice-radius)",
        }}
      >
        <p
          className="practice-ui hidden min-w-0 flex-1 truncate sm:block"
          style={{
            color: "var(--practice-text-secondary)",
            fontSize: 12,
          }}
        >
          Tier and row controls for quick selection
        </p>
        <div className="flex flex-1 items-center justify-center gap-2 sm:flex-none sm:justify-end">
          <ToolbarButton primary onClick={selectAllKana}>
            Select all
          </ToolbarButton>
          <ToolbarButton onClick={clearAllKana}>Clear</ToolbarButton>
        </div>
      </div>

      <div className="mb-3 lg:hidden">
        <div
          className="flex p-1"
          style={{
            background: "var(--practice-surface-elev)",
            border: "1px solid var(--practice-stroke)",
            borderRadius: "var(--practice-radius)",
          }}
        >
          <TabButton
            active={tab === "hiragana"}
            onClick={() => setTab("hiragana")}
          >
            Hiragana ({countHiragana})
          </TabButton>
          <TabButton
            active={tab === "katakana"}
            onClick={() => setTab("katakana")}
          >
            Katakana ({countKatakana})
          </TabButton>
        </div>
      </div>

      {catalog.length > 0 && (
        <KanaGrid
          script={tab}
          catalog={catalog}
          selected={selected}
          onToggle={onToggle}
          onBulkRow={onBulkRow}
          guessStats={user ? guessStats : undefined}
        />
      )}

      <div
        className="fixed bottom-0 left-0 right-0 z-100 flex items-center gap-3 p-3 sm:p-4"
        style={{
          background: "var(--practice-surface)",
          borderTop: "1px solid var(--practice-stroke)",
        }}
      >
        <div
          className="practice-ui min-w-0 flex-1"
          style={{
            color: "var(--practice-text-secondary)",
            fontSize: 13,
          }}
        >
          <span style={{ color: "var(--practice-text)", fontWeight: 600 }}>
            {readyCount}
          </span>{" "}
          kana ready
        </div>
        <button
          type="button"
          onClick={() => void start()}
          disabled={busy || readyCount === 0}
          className="practice-ui transition disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: "var(--practice-accent)",
            color: "var(--practice-accent-ink)",
            border: "1px solid var(--practice-accent)",
            borderRadius: "var(--practice-radius)",
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0.2,
          }}
        >
          Start practice
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Local UI helpers — mirror the flat Washi / Dark language used elsewhere.
// ---------------------------------------------------------------------------

function ModeButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const base: CSSProperties = {
    borderRadius: "var(--practice-radius)",
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.2,
    width: "100%",
    textAlign: "center",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };
  const tone: CSSProperties = active
    ? {
        background: "var(--practice-accent)",
        color: "var(--practice-accent-ink)",
        border: "1px solid var(--practice-accent)",
      }
    : {
        background: "var(--practice-surface-elev)",
        color: "var(--practice-text-secondary)",
        border: "1px solid var(--practice-stroke)",
      };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "practice-ui transition disabled:cursor-not-allowed disabled:opacity-50"
      )}
      style={{ ...base, ...tone }}
    >
      {children}
    </button>
  );
}

function ToolbarButton({
  primary,
  onClick,
  children,
}: {
  primary?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const tone: CSSProperties = primary
    ? {
        background: "var(--practice-accent)",
        color: "var(--practice-accent-ink)",
        border: "1px solid var(--practice-accent)",
      }
    : {
        background: "var(--practice-surface-elev)",
        color: "var(--practice-text-secondary)",
        border: "1px solid var(--practice-stroke)",
      };
  return (
    <button
      type="button"
      onClick={onClick}
      className="practice-ui transition"
      style={{
        ...tone,
        borderRadius: "var(--practice-radius)",
        padding: "6px 12px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="practice-ui flex-1 transition"
      style={{
        background: active
          ? "var(--practice-surface)"
          : "transparent",
        color: active
          ? "var(--practice-text)"
          : "var(--practice-text-secondary)",
        border: active
          ? "1px solid var(--practice-stroke)"
          : "1px solid transparent",
        borderRadius: "var(--practice-radius)",
        padding: "8px 12px",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}
