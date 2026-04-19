import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Feather, Loader2 } from "lucide-react";
import type {
  KanaRow,
  PracticeMode,
  WordCategorySummary,
} from "@/api/types";
import {
  ApiRequestError,
  createCheckout,
  fetchWordCategories,
  isAlreadyOwnedError,
  postWordDrill,
} from "@/api/client";
import { Button } from "@/components/ui/Button";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { useAuth } from "@/context/AuthContext";
import { savePracticeToSession } from "@/lib/practiceSession";
import {
  cardShellClass,
  modeInactiveClass,
  modeKanaToRomajiActiveClass,
  modeWritingActiveClass,
} from "@/lib/modeStyles";
import { cn } from "@/lib/utils";

type Script = "hiragana" | "katakana";
type WordMode = Extract<PracticeMode, "kana-to-romaji" | "writing">;

const KEY_MODE = "kanareps:words:mode";
const KEY_TAB = "kanareps:words:tab";
const KEY_CATS_H = "kanareps:words:categories:h";
const KEY_CATS_K = "kanareps:words:categories:k";
const KEY_CUSTOM_H = "kanareps:words:customWords:h";
const KEY_CUSTOM_K = "kanareps:words:customWords:k";

function loadList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function saveList(key: string, list: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* quota / private mode */
  }
}

function categoryLabel(id: string): string {
  return id
    .split("_")
    .map((seg) => (seg.length > 0 ? seg[0]!.toUpperCase() + seg.slice(1) : seg))
    .join(" ");
}

export function Words() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();

  const [mode, setMode] = useState<WordMode>(() => {
    const raw = localStorage.getItem(KEY_MODE);
    return raw === "writing" ? "writing" : "kana-to-romaji";
  });
  const [script, setScript] = useState<Script>(() => {
    const raw = localStorage.getItem(KEY_TAB);
    return raw === "katakana" ? "katakana" : "hiragana";
  });

  const [categoriesAll, setCategoriesAll] = useState<WordCategorySummary[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [selCatsH, setSelCatsH] = useState<Set<string>>(
    () => new Set(loadList(KEY_CATS_H))
  );
  const [selCatsK, setSelCatsK] = useState<Set<string>>(
    () => new Set(loadList(KEY_CATS_K))
  );

  const [customH, setCustomH] = useState<Set<string>>(
    () => new Set(loadList(KEY_CUSTOM_H))
  );
  const [customK, setCustomK] = useState<Set<string>>(
    () => new Set(loadList(KEY_CUSTOM_K))
  );

  const [customOpen, setCustomOpen] = useState(false);
  const [customCatalog, setCustomCatalog] = useState<
    Record<Script, KanaRow[] | undefined>
  >({ hiragana: undefined, katakana: undefined });
  const [customLoading, setCustomLoading] = useState<Record<Script, boolean>>({
    hiragana: false,
    katakana: false,
  });

  const [subOpen, setSubOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(KEY_MODE, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(KEY_TAB, script);
  }, [script]);

  useEffect(() => {
    saveList(KEY_CATS_H, [...selCatsH]);
  }, [selCatsH]);
  useEffect(() => {
    saveList(KEY_CATS_K, [...selCatsK]);
  }, [selCatsK]);
  useEffect(() => {
    saveList(KEY_CUSTOM_H, [...customH]);
  }, [customH]);
  useEffect(() => {
    saveList(KEY_CUSTOM_K, [...customK]);
  }, [customK]);

  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);
    setCategoriesError(null);
    fetchWordCategories()
      .then((cats) => {
        if (cancelled) return;
        setCategoriesAll(cats);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiRequestError && (err.status === 401 || err.status === 403)) {
          setSubOpen(true);
          setCategoriesError("Word practice is part of lifetime access.");
        } else {
          setCategoriesError(err instanceof Error ? err.message : "Could not load categories");
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadCustomCatalog = useCallback(
    (s: Script) => {
      if (customCatalog[s] || customLoading[s]) return;
      setCustomLoading((prev) => ({ ...prev, [s]: true }));
      postWordDrill({ kana_type: s })
        .then(({ kanaData }) => {
          setCustomCatalog((prev) => ({ ...prev, [s]: kanaData }));
        })
        .catch((err) => {
          if (
            err instanceof ApiRequestError &&
            (err.status === 401 || err.status === 403)
          ) {
            setSubOpen(true);
          } else {
            console.error(err);
          }
        })
        .finally(() => {
          setCustomLoading((prev) => ({ ...prev, [s]: false }));
        });
    },
    [customCatalog, customLoading]
  );

  useEffect(() => {
    if (customOpen) loadCustomCatalog(script);
  }, [customOpen, script, loadCustomCatalog]);

  const categoriesForScript = useMemo(
    () => categoriesAll.filter((c) => c.kana_type === script),
    [categoriesAll, script]
  );

  const selectedCats = script === "hiragana" ? selCatsH : selCatsK;
  const setSelectedCats = script === "hiragana" ? setSelCatsH : setSelCatsK;
  const selectedCustom = script === "hiragana" ? customH : customK;
  const setSelectedCustom = script === "hiragana" ? setCustomH : setCustomK;
  const customCount = selectedCustom.size;
  const customsActive = customCount > 0;

  function toggleCategory(id: string) {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllCategories() {
    setSelectedCats(new Set(categoriesForScript.map((c) => c.id)));
  }

  function clearCategories() {
    setSelectedCats(new Set());
  }

  function toggleCustomWord(char: string) {
    setSelectedCustom((prev) => {
      const next = new Set(prev);
      if (next.has(char)) next.delete(char);
      else next.add(char);
      return next;
    });
  }

  function toggleCustomGroup(group: KanaRow[], select: boolean) {
    setSelectedCustom((prev) => {
      const next = new Set(prev);
      for (const row of group) {
        if (select) next.add(row.char);
        else next.delete(row.char);
      }
      return next;
    });
  }

  function clearCustomWords() {
    setSelectedCustom(new Set());
  }

  const customGrouped = useMemo(() => {
    const catalog = customCatalog[script];
    if (!catalog) return [] as { category: string; rows: KanaRow[] }[];
    const byCategory = new Map<string, KanaRow[]>();
    for (const row of catalog) {
      const cat = row.category ?? "other";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(row);
    }
    const orderedIds = categoriesForScript.map((c) => c.id);
    const seen = new Set<string>();
    const result: { category: string; rows: KanaRow[] }[] = [];
    for (const id of orderedIds) {
      const rows = byCategory.get(id);
      if (rows && rows.length > 0) {
        result.push({ category: id, rows });
        seen.add(id);
      }
    }
    for (const [cat, rows] of byCategory) {
      if (!seen.has(cat)) result.push({ category: cat, rows });
    }
    return result;
  }, [customCatalog, script, categoriesForScript]);

  async function handleSubscribe() {
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
  }

  async function start() {
    setBusy(true);
    setStartError(null);
    try {
      const body = customsActive
        ? {
            kana_type: script,
            custom_words: [...selectedCustom].map((char) => ({ char })),
          }
        : {
            kana_type: script,
            categories: [...selectedCats],
          };
      const { kanaData } = await postWordDrill(body);
      const setLabel = customsActive
        ? "Custom words"
        : selectedCats.size === 0
          ? `All ${script}`
          : `Words: ${[...selectedCats].map(categoryLabel).join(", ")}`;
      const payload = {
        mode,
        kanaType: script,
        setLabel,
        setName: undefined as string | string[] | undefined,
        level: "word" as const,
        categories: customsActive ? undefined : [...selectedCats],
        customWords: customsActive
          ? [...selectedCustom].map((char) => ({ char }))
          : undefined,
        kanaData,
      };
      savePracticeToSession(payload);
      navigate("/practice", { state: payload });
    } catch (err) {
      if (err instanceof ApiRequestError && (err.status === 401 || err.status === 403)) {
        setSubOpen(true);
      } else if (err instanceof ApiRequestError && err.status === 400) {
        setStartError(err.message || "No words match that selection.");
      } else {
        setStartError(err instanceof Error ? err.message : "Could not start practice");
      }
    } finally {
      setBusy(false);
    }
  }

  const wordOk = user?.entitlements.word_practice ?? false;
  const startDisabled =
    busy ||
    (!customsActive && selectedCats.size === 0 && categoriesForScript.length > 0);

  return (
    <div className="w-full pb-28 sm:pb-8">
      <SubscriptionModal
        open={subOpen}
        feature="word_practice"
        onClose={() => setSubOpen(false)}
        onSubscribe={() => void handleSubscribe()}
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
          <h1 className="kana-page-title text-3xl font-bold">Word practice</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Real Japanese words grouped by theme. Pick categories or cherry-pick
            a custom list.
          </p>
        </div>
      </div>

      {!wordOk && (
        <div className={cn("mb-6", cardShellClass)}>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Word practice is part of lifetime access.{" "}
            <button
              type="button"
              className="font-semibold text-[var(--color-primary)] underline-offset-2 hover:underline"
              onClick={() => setSubOpen(true)}
            >
              Unlock
            </button>
            .
          </p>
        </div>
      )}

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
            onClick={() => setMode("writing")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition sm:h-16 sm:text-lg",
              mode === "writing" ? modeWritingActiveClass : modeInactiveClass
            )}
          >
            <Feather className="h-4 w-4" />
            Writing (trace)
          </button>
        </div>
      </div>

      <div className={cn("mb-6", cardShellClass)}>
        <h2 className="mb-4 text-base font-semibold text-slate-700 dark:text-slate-200 sm:text-lg">
          Script
        </h2>
        <div className="flex rounded-2xl bg-slate-100/90 p-1 ring-1 ring-indigo-100/60 dark:bg-slate-800/90 dark:ring-white/10">
          <button
            type="button"
            onClick={() => setScript("hiragana")}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              script === "hiragana"
                ? "bg-[var(--color-paper)] text-indigo-900 shadow-sm ring-1 ring-indigo-100 dark:text-slate-100 dark:ring-white/15"
                : "text-slate-600 dark:text-slate-400"
            )}
          >
            Hiragana
          </button>
          <button
            type="button"
            onClick={() => setScript("katakana")}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              script === "katakana"
                ? "bg-[var(--color-paper)] text-indigo-900 shadow-sm ring-1 ring-indigo-100 dark:text-slate-100 dark:ring-white/15"
                : "text-slate-600 dark:text-slate-400"
            )}
          >
            Katakana
          </button>
        </div>
      </div>

      <div className={cn("mb-6", cardShellClass, customsActive && "opacity-60")}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 sm:text-lg">
            Categories ({script})
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={customsActive || categoriesForScript.length === 0}
              onClick={selectAllCategories}
              className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-500/20 transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40 dark:shadow-violet-900/40"
            >
              Select all
            </button>
            <button
              type="button"
              disabled={customsActive || selectedCats.size === 0}
              onClick={clearCategories}
              className="rounded-lg border border-slate-200 bg-[var(--color-paper)] px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Clear
            </button>
          </div>
        </div>

        {customsActive && (
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            Custom list overrides category filters.
          </p>
        )}

        {categoriesLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading categories…
          </div>
        ) : categoriesError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{categoriesError}</p>
        ) : categoriesForScript.length === 0 ? (
          <p className="text-sm text-slate-500">
            No categories available for {script}.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categoriesForScript.map((c) => {
              const on = selectedCats.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={customsActive}
                  onClick={() => toggleCategory(c.id)}
                  aria-pressed={on}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
                    on
                      ? "bg-[var(--color-primary)] text-white shadow-sm shadow-violet-500/20 hover:bg-[var(--color-primary-hover)] dark:shadow-violet-900/40"
                      : "border border-slate-200 bg-[var(--color-paper)] text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-white/10",
                    customsActive && "cursor-not-allowed"
                  )}
                >
                  {categoryLabel(c.id)}{" "}
                  <span className="opacity-70">({c.count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <details
        open={customOpen}
        onToggle={(e) => setCustomOpen((e.target as HTMLDetailsElement).open)}
        className={cn("mb-6 overflow-hidden", cardShellClass)}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <div>
            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 sm:text-lg">
              Custom words ({script})
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Cherry-pick individual words. Overrides categories when non-empty.{" "}
              {customCount > 0 && <>Selected: {customCount}</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {customCount > 0 && (
              <button
                type="button"
                onClick={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  clearCustomWords();
                }}
                className="rounded-lg border border-slate-200 bg-[var(--color-paper)] px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Clear
              </button>
            )}
            <ChevronDown className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180" />
          </div>
        </summary>

        <div className="mt-4">
          {customLoading[script] ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading {script} catalog…
            </div>
          ) : !customCatalog[script] ? (
            <p className="text-sm text-slate-500">Opening will load the catalog…</p>
          ) : customGrouped.length === 0 ? (
            <p className="text-sm text-slate-500">No words available.</p>
          ) : (
            <div className="space-y-3">
              {customGrouped.map(({ category, rows }) => {
                const allOn = rows.every((r) => selectedCustom.has(r.char));
                return (
                  <details
                    key={category}
                    className="overflow-hidden rounded-xl border border-indigo-100/70 bg-[var(--color-paper)] dark:border-white/10"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-2 border-b border-indigo-100/50 bg-indigo-50/40 px-3 py-2 text-sm font-semibold text-indigo-900 [&::-webkit-details-marker]:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-indigo-500 transition-transform duration-200 group-open:rotate-180" />
                      <span className="min-w-0 flex-1 truncate">
                        {categoryLabel(category)}{" "}
                        <span className="opacity-60">({rows.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.preventDefault();
                          ev.stopPropagation();
                          toggleCustomGroup(rows, !allOn);
                        }}
                        className={cn(
                          "shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold sm:text-xs",
                          allOn
                            ? "border border-slate-200 bg-[var(--color-paper)] text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                            : "bg-[var(--color-primary)] text-white shadow-sm shadow-violet-500/20 hover:bg-[var(--color-primary-hover)] dark:shadow-violet-900/40"
                        )}
                      >
                        {allOn ? "Clear" : "All"}
                      </button>
                    </summary>
                    <div className="flex flex-wrap gap-2 p-3">
                      {rows.map((row) => {
                        const on = selectedCustom.has(row.char);
                        return (
                          <button
                            key={row.char}
                            type="button"
                            onClick={() => toggleCustomWord(row.char)}
                            aria-pressed={on}
                            className={cn(
                              "flex flex-col items-start gap-0.5 rounded-xl px-3 py-2 text-left transition",
                              on
                                ? "bg-[var(--color-primary)] text-white shadow-sm shadow-violet-500/20 hover:bg-[var(--color-primary-hover)] dark:shadow-violet-900/40"
                                : "border border-slate-200 bg-[var(--color-paper)] text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-white/10"
                            )}
                          >
                            <span className="kana-practice-script text-lg">
                              {row.char}
                            </span>
                            <span
                              className={cn(
                                "text-[11px]",
                                on
                                  ? "text-white/80"
                                  : "text-slate-500 dark:text-slate-400"
                              )}
                            >
                              {row.romaji}
                              {row.meaning && ` · ${row.meaning}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>
      </details>

      {startError && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/30 dark:text-red-300">
          {startError}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-[100] w-full border-t border-slate-200 bg-[var(--color-paper)]/95 p-3 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md dark:border-slate-700 sm:p-6">
        <Button
          className="w-full text-white sm:min-h-[3.5rem]"
          size="lg"
          disabled={startDisabled}
          onClick={() => void start()}
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting…
            </>
          ) : customsActive ? (
            `Start practice · ${customCount} word${customCount === 1 ? "" : "s"}`
          ) : selectedCats.size === 0 ? (
            "Pick at least one category"
          ) : (
            "Start practice"
          )}
        </Button>
      </div>
    </div>
  );
}
