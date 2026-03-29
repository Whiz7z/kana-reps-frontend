import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Feather } from "lucide-react";
import type { KanaRow } from "@/api/types";
import {
  ApiRequestError,
  createCheckout,
  fetchKanaCatalog,
  fetchKanaGuessStats,
  postDrill,
} from "@/api/client";
import { KanaGrid } from "@/components/KanaGrid";
import type { KanaGuessStatsMap } from "@/components/KanaTile";
import { Button } from "@/components/ui/Button";
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
  const { user } = useAuth();
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

  const onBulkLevel = useCallback(
    (
      level: "basic" | "dakuten" | "handakuten" | "yoon",
      select: boolean
    ) => {
      const keys = catalog
        .filter(
          (r) => r.kana_type === tab && r.level === level
        )
        .map(kanaKey);
      onBulkRow(keys, select);
    },
    [catalog, tab, onBulkRow]
  );

  const selectAllScript = useCallback(() => {
    const keys = catalog.filter((r) => r.kana_type === tab).map(kanaKey);
    onBulkRow(keys, true);
  }, [catalog, tab, onBulkRow]);

  const clearAllScript = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(
        [...prev].filter((k) => {
          const row = catalog.find((r) => kanaKey(r) === k);
          return row?.kana_type !== tab;
        })
      );
      persistFromMerged(next);
      return next;
    });
  }, [catalog, tab]);

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
    <div className="mx-auto max-w-6xl pb-28 sm:pb-8">
      <SubscriptionModal
        open={subOpen}
        onClose={() => setSubOpen(false)}
        onSubscribe={async () => {
          try {
            const { url } = await createCheckout();
            window.location.href = url;
          } catch (err) {
            console.error(err);
            alert("Checkout failed — sign in and try again.");
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Custom set
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {totalSelected} kana selected ({countHiragana} Hiragana,{" "}
            {countKatakana} Katakana)
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-100/80 bg-white p-3 shadow-xl shadow-slate-200/50 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-700 sm:text-lg">
          Practice mode
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setMode("kana-to-romaji")}
            className={cn(
              "rounded-2xl px-3 py-2 text-sm font-semibold transition sm:h-16 sm:text-lg",
              mode === "kana-to-romaji"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 shadow-lg shadow-amber-500/25"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              !writingOk && "cursor-not-allowed opacity-50"
            )}
          >
            <Feather className="h-4 w-4" />
            Writing
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/50 sm:p-6">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTab("hiragana")}
              className={cn(
                "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                tab === "hiragana"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
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
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              )}
            >
              Katakana ({countKatakana})
            </button>
          </div>
          <div className="flex justify-end gap-2 md:hidden">
            <button
              type="button"
              onClick={selectAllScript}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearAllScript}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm"
            >
              Clear all
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
            onBulkLevel={onBulkLevel}
            guessStats={user ? guessStats : undefined}
          />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[100] w-full border-t border-slate-200 bg-white/95 p-3 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md sm:p-6">
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
