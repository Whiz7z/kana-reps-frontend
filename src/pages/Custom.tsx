import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Feather } from "lucide-react";
import type { KanaRow } from "@/api/types";
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
import { Button } from "@/components/ui/Button";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { savePracticeToSession } from "@/lib/practiceSession";
import { useAuth } from "@/context/AuthContext";
import { kanaKey, migrateLegacyKey } from "@/lib/kanaKeys";
import { pickerStickyToolbar } from "@/lib/customPickerTokens";
import {
  cardShellClass,
  modeInactiveClass,
  modeKanaToRomajiActiveClass,
  modeRomajiToKanaActiveClass,
  modeWritingActiveClass,
  toolbarPrimaryClass,
} from "@/lib/modeStyles";
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
  const [mode, setMode] = useState<
    "kana-to-romaji" | "romaji-to-kana" | "writing"
  >("kana-to-romaji");
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
      for (const key of prev) {
        if (catalog.some((r) => kanaKey(r) === key)) {
          next.add(key);
          continue;
        }
        const m = migrateLegacyKey(key, catalog);
        if (m) next.add(m);
      }
      const a = [...next].sort().join("\0");
      const b = [...prev].sort().join("\0");
      if (a !== b) {
        persistFromMerged(next);
        return next;
      }
      return prev;
    });
  }, [catalog]);

  const countHiragana = useMemo(
    () => [...selected].filter((k) => k.endsWith(":hiragana")).length,
    [selected]
  );
  const countKatakana = useMemo(
    () => [...selected].filter((k) => k.endsWith(":katakana")).length,
    [selected]
  );
  const totalSelected = countHiragana + countKatakana;

  const onToggle = useCallback((key: string, _row: KanaRow) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      persistFromMerged(next);
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
      persistFromMerged(next);
      return next;
    });
  }, []);

  const selectAllKana = useCallback(() => {
    onBulkRow(
      catalog.map(kanaKey),
      true
    );
  }, [catalog, onBulkRow]);

  const clearAllKana = useCallback(() => {
    onBulkRow(
      catalog.map(kanaKey),
      false
    );
  }, [catalog, onBulkRow]);

  const customRomaji = useMemo(() => {
    const map = new Map<string, { romaji: string; type: string }>();
    for (const row of catalog) {
      const k = kanaKey(row);
      if (selected.has(k)) {
        map.set(k, { romaji: row.romaji, type: row.kana_type });
      }
    }
    return [...map.values()];
  }, [catalog, selected]);

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

  return (
    <div className="w-full pb-28 sm:pb-8">
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

      <div className="mb-6 flex flex-wrap items-start gap-4">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label="Back to menu"
          onClick={() => navigate("/menu")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="kana-page-title text-3xl font-bold">Custom set</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {totalSelected} kana selected ({countHiragana} Hiragana,{" "}
            {countKatakana} Katakana)
          </p>
        </div>
      </div>

      <div className={cn("mb-6", cardShellClass)}>
        <h2 className="mb-4 text-base font-semibold text-slate-700 dark:text-slate-200 sm:text-lg">
          Practice mode
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setMode("kana-to-romaji")}
            className={cn(
              "rounded-2xl px-3 py-2 text-sm font-semibold transition sm:h-16 sm:text-lg",
              mode === "kana-to-romaji"
                ? modeKanaToRomajiActiveClass
                : modeInactiveClass
            )}
          >
            Kana → Romaji
          </button>
          <button
            type="button"
            onClick={() => setMode("romaji-to-kana")}
            className={cn(
              "rounded-2xl px-3 py-2 text-sm font-semibold transition sm:h-16 sm:text-lg",
              mode === "romaji-to-kana"
                ? modeRomajiToKanaActiveClass
                : modeInactiveClass
            )}
          >
            Romaji → Kana
          </button>
          <button
            type="button"
            disabled={!writingOk}
            onClick={() => {
              if (!writingOk) setSubOpen(true);
              else setMode("writing");
            }}
            className={cn(
              "col-span-2 flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition sm:h-16 sm:text-lg",
              mode === "writing"
                ? modeWritingActiveClass
                : modeInactiveClass,
              !writingOk && "cursor-not-allowed opacity-50"
            )}
          >
            <Feather className="h-4 w-4" />
            Writing
          </button>
        </div>
      </div>

      {/* <div
        className={cn(
          "mb-4 overflow-hidden rounded-2xl sm:rounded-3xl",
          pickerPageBg
        )}
      > */}
      <div className={pickerStickyToolbar}>
        <div className="flex w-full flex-wrap items-center justify-center gap-2 lg:max-w-none lg:justify-between px-1">
          <p className="hidden text-sm text-slate-600 dark:text-slate-400 lg:block">
            Select kana — tier and row controls for quick selection.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={selectAllKana}
              className={toolbarPrimaryClass}
            >
              Select all kana
            </button>
            <button
              type="button"
              onClick={clearAllKana}
              className="rounded-lg border border-slate-200 bg-[var(--color-paper)] px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 lg:hidden">
        <div className="flex rounded-2xl bg-slate-100/90 p-1 ring-1 ring-indigo-100/60 dark:bg-slate-800/90 dark:ring-white/10">
          <button
            type="button"
            onClick={() => setTab("hiragana")}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              tab === "hiragana"
                ? "bg-[var(--color-paper)] text-indigo-900 shadow-sm ring-1 ring-indigo-100 dark:text-slate-100 dark:ring-white/15"
                : "text-slate-600 dark:text-slate-400"
            )}
          >
            Hiragana ({countHiragana})
          </button>
          <button
            type="button"
            onClick={() => setTab("katakana")}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              tab === "katakana"
                ? "bg-[var(--color-paper)] text-indigo-900 shadow-sm ring-1 ring-indigo-100 dark:text-slate-100 dark:ring-white/15"
                : "text-slate-600 dark:text-slate-400"
            )}
          >
            Katakana ({countKatakana})
          </button>
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

      <div className="fixed bottom-0 left-0 right-0 z-[100] w-full border-t border-slate-200 bg-[var(--color-paper)]/95 p-3 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md dark:border-slate-700 sm:p-6">
        <Button
          className="w-full text-white sm:min-h-[3.5rem]"
          size="lg"
          disabled={busy || customRomaji.length === 0}
          onClick={() => void start()}
        >
          Start practice
        </Button>
      </div>
    </div>
  );
}
