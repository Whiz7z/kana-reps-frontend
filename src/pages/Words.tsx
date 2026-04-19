import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Feather,
  Loader2,
  Lock,
} from "lucide-react";
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
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { useAuth } from "@/context/AuthContext";
import { savePracticeToSession } from "@/lib/practiceSession";
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
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set());
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
        if (
          err instanceof ApiRequestError &&
          (err.status === 401 || err.status === 403)
        ) {
          setSubOpen(true);
          setCategoriesError("Word practice is part of lifetime access.");
        } else {
          setCategoriesError(
            err instanceof Error ? err.message : "Could not load categories"
          );
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

  function toggleGroupOpen(id: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
      if (
        err instanceof ApiRequestError &&
        (err.status === 401 || err.status === 403)
      ) {
        setSubOpen(true);
      } else if (err instanceof ApiRequestError && err.status === 400) {
        setStartError(err.message || "No words match that selection.");
      } else {
        setStartError(
          err instanceof Error ? err.message : "Could not start practice"
        );
      }
    } finally {
      setBusy(false);
    }
  }

  const wordOk = user?.entitlements.word_practice ?? false;
  const startDisabled =
    busy ||
    (!customsActive &&
      selectedCats.size === 0 &&
      categoriesForScript.length > 0);

  return (
    <div
      className="practice-root mx-auto w-full pb-28 sm:pb-8"
      style={{ color: "var(--practice-text)" }}
    >
      <SubscriptionModal
        open={subOpen}
        feature="word_practice"
        onClose={() => setSubOpen(false)}
        onSubscribe={() => void handleSubscribe()}
      />

      <header className="mb-5 flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate("/menu")}
          aria-label="Back to menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center self-center transition hover:opacity-80"
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
            Word practice
          </h1>
          <p
            className="practice-ui mt-1 text-xs sm:text-sm"
            style={{ color: "var(--practice-text-secondary)" }}
          >
            Real Japanese words grouped by theme. Pick categories or cherry-pick
            a custom list.
          </p>
        </div>
      </header>

      {!wordOk && (
        <section
          className="mb-4 p-3 sm:p-4"
          style={{
            background: "var(--practice-surface)",
            border: "1px solid var(--practice-stroke)",
            borderRadius: "var(--practice-radius)",
          }}
        >
          <p
            className="practice-ui text-sm"
            style={{ color: "var(--practice-text-secondary)" }}
          >
            Word practice is part of lifetime access.{" "}
            <button
              type="button"
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: "var(--practice-accent)" }}
              onClick={() => setSubOpen(true)}
            >
              Unlock
            </button>
            .
          </p>
        </section>
      )}

      <section
        className="mb-4 p-3 sm:p-4"
        style={{
          background: "var(--practice-surface)",
          border: "1px solid var(--practice-stroke)",
          borderRadius: "var(--practice-radius)",
        }}
      >
        <SectionLabel>Practice mode</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <ModeButton
            active={mode === "kana-to-romaji"}
            onClick={() => setMode("kana-to-romaji")}
          >
            Kana → Romaji
          </ModeButton>
          <ModeButton
            active={mode === "writing"}
            onClick={() => setMode("writing")}
          >
            <Feather className="h-4 w-4" aria-hidden />
            <span>Writing (trace)</span>
          </ModeButton>
        </div>
      </section>

      <section
        className="mb-4 p-3 sm:p-4"
        style={{
          background: "var(--practice-surface)",
          border: "1px solid var(--practice-stroke)",
          borderRadius: "var(--practice-radius)",
        }}
      >
        <SectionLabel>Script</SectionLabel>
        <div
          className="flex gap-1 p-1"
          style={{
            background: "var(--practice-bg)",
            border: "1px solid var(--practice-stroke-subtle)",
            borderRadius: "var(--practice-radius)",
          }}
        >
          <SegmentedOption
            active={script === "hiragana"}
            onClick={() => setScript("hiragana")}
          >
            Hiragana
          </SegmentedOption>
          <SegmentedOption
            active={script === "katakana"}
            onClick={() => setScript("katakana")}
          >
            Katakana
          </SegmentedOption>
        </div>
      </section>

      <section
        className="mb-4 p-3 sm:p-4"
        style={{
          background: "var(--practice-surface)",
          border: "1px solid var(--practice-stroke)",
          borderRadius: "var(--practice-radius)",
          opacity: customsActive ? 0.55 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div
            className="practice-ui"
            style={{
              color: "var(--practice-text)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Categories{" "}
            <span
              style={{ color: "var(--practice-text-tertiary)", fontWeight: 500 }}
            >
              ({script})
            </span>
          </div>
          <div className="flex gap-2">
            <ToolbarButton
              primary
              disabled={customsActive || categoriesForScript.length === 0}
              onClick={selectAllCategories}
            >
              Select all
            </ToolbarButton>
            <ToolbarButton
              disabled={customsActive || selectedCats.size === 0}
              onClick={clearCategories}
            >
              Clear
            </ToolbarButton>
          </div>
        </div>

        {customsActive && (
          <p
            className="practice-ui mb-3"
            style={{
              color: "var(--practice-text-tertiary)",
              fontSize: 11,
              fontStyle: "italic",
            }}
          >
            Custom list overrides category filters.
          </p>
        )}

        {categoriesLoading ? (
          <div
            className="practice-ui flex items-center gap-2"
            style={{
              color: "var(--practice-text-secondary)",
              fontSize: 13,
            }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading categories…
          </div>
        ) : categoriesError ? (
          <p
            className="practice-ui"
            style={{ color: "var(--practice-danger)", fontSize: 13 }}
          >
            {categoriesError}
          </p>
        ) : categoriesForScript.length === 0 ? (
          <p
            className="practice-ui"
            style={{ color: "var(--practice-text-secondary)", fontSize: 13 }}
          >
            No categories available for {script}.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categoriesForScript.map((c) => (
              <CategoryChip
                key={c.id}
                label={categoryLabel(c.id)}
                count={c.count}
                active={selectedCats.has(c.id)}
                disabled={customsActive}
                onClick={() => toggleCategory(c.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section
        className="mb-4 p-3 sm:p-4"
        style={{
          background: "var(--practice-surface)",
          border: "1px solid var(--practice-stroke)",
          borderRadius: "var(--practice-radius)",
        }}
      >
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          className="flex w-full items-center gap-3 text-left"
          aria-expanded={customOpen}
        >
          <div className="min-w-0 flex-1">
            <div
              className="practice-ui"
              style={{
                color: "var(--practice-text)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Custom words{" "}
              <span
                style={{
                  color: "var(--practice-text-tertiary)",
                  fontWeight: 500,
                }}
              >
                ({script})
              </span>
            </div>
            <div
              className="practice-ui mt-0.5"
              style={{
                color: "var(--practice-text-secondary)",
                fontSize: 12,
              }}
            >
              Cherry-pick individual words. Overrides categories when non-empty.
              {customCount > 0 && (
                <>
                  {" · "}
                  <span
                    style={{
                      color: "var(--practice-accent)",
                      fontWeight: 600,
                    }}
                  >
                    Selected: {customCount}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {customCount > 0 && (
              <ToolbarButton
                onClick={(ev) => {
                  ev?.stopPropagation();
                  clearCustomWords();
                }}
              >
                Clear
              </ToolbarButton>
            )}
            <Chevron expanded={customOpen} />
          </div>
        </button>

        {customOpen && (
          <div className="mt-4 flex flex-col gap-2">
            {customLoading[script] ? (
              <div
                className="practice-ui flex items-center gap-2"
                style={{
                  color: "var(--practice-text-secondary)",
                  fontSize: 13,
                }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading {script} catalog…
              </div>
            ) : !customCatalog[script] ? (
              <p
                className="practice-ui"
                style={{
                  color: "var(--practice-text-secondary)",
                  fontSize: 13,
                }}
              >
                Opening will load the catalog…
              </p>
            ) : customGrouped.length === 0 ? (
              <p
                className="practice-ui"
                style={{
                  color: "var(--practice-text-secondary)",
                  fontSize: 13,
                }}
              >
                No words available.
              </p>
            ) : (
              customGrouped.map(({ category, rows }) => {
                const allOn = rows.every((r) => selectedCustom.has(r.char));
                const expanded = openGroups.has(category);
                return (
                  <CategoryAccordion
                    key={category}
                    label={categoryLabel(category)}
                    count={rows.length}
                    expanded={expanded}
                    allOn={allOn}
                    onToggleOpen={() => toggleGroupOpen(category)}
                    onToggleAll={(ev) => {
                      ev?.stopPropagation();
                      toggleCustomGroup(rows, !allOn);
                    }}
                  >
                    {expanded && (
                      <div className="flex flex-wrap gap-2 p-3">
                        {rows.map((row) => (
                          <WordPill
                            key={row.char}
                            row={row}
                            selected={selectedCustom.has(row.char)}
                            onClick={() => toggleCustomWord(row.char)}
                          />
                        ))}
                      </div>
                    )}
                  </CategoryAccordion>
                );
              })
            )}
          </div>
        )}
      </section>

      {startError && (
        <div
          className="practice-ui mb-4 p-3"
          style={{
            background: "var(--practice-accent-soft)",
            border: "1px solid var(--practice-danger)",
            borderRadius: "var(--practice-radius)",
            color: "var(--practice-danger)",
            fontSize: 13,
          }}
        >
          {startError}
        </div>
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
          {customsActive ? (
            <>
              <span
                style={{ color: "var(--practice-text)", fontWeight: 600 }}
              >
                Custom
              </span>{" "}
              ·{" "}
              <span
                style={{ color: "var(--practice-text)", fontWeight: 600 }}
              >
                {customCount}
              </span>{" "}
              word{customCount === 1 ? "" : "s"}
            </>
          ) : (
            <>
              <span
                style={{ color: "var(--practice-text)", fontWeight: 600 }}
              >
                {selectedCats.size}
              </span>{" "}
              {selectedCats.size === 1 ? "category" : "categories"} selected
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => void start()}
          disabled={startDisabled}
          className="practice-ui transition disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: startDisabled
              ? "var(--practice-stroke)"
              : "var(--practice-accent)",
            color: startDisabled
              ? "var(--practice-text-tertiary)"
              : "var(--practice-accent-ink)",
            border: startDisabled
              ? "1px solid var(--practice-stroke)"
              : "1px solid var(--practice-accent)",
            borderRadius: "var(--practice-radius)",
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0.2,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting…
            </>
          ) : !wordOk ? (
            <>
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Start practice
            </>
          ) : customsActive ? (
            `Start practice · ${customCount} word${customCount === 1 ? "" : "s"}`
          ) : selectedCats.size === 0 ? (
            "Pick at least one category"
          ) : (
            "Start practice"
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Local UI helpers — mirror the flat Washi / Dark language used elsewhere.
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="practice-ui mb-2.5 uppercase"
      style={{
        color: "var(--practice-text-tertiary)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 1.4,
      }}
    >
      {children}
    </div>
  );
}

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
    padding: "12px 14px",
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

function SegmentedOption({
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
        background: active ? "var(--practice-surface-elev)" : "transparent",
        color: active
          ? "var(--practice-text)"
          : "var(--practice-text-secondary)",
        border: active
          ? "1px solid var(--practice-stroke)"
          : "1px solid transparent",
        borderRadius: "calc(var(--practice-radius) - 2px)",
        padding: "8px 12px",
        fontSize: 13,
        fontWeight: 600,
        textAlign: "center",
      }}
    >
      {children}
    </button>
  );
}

function ToolbarButton({
  primary,
  disabled,
  onClick,
  children,
}: {
  primary?: boolean;
  disabled?: boolean;
  onClick?: (ev?: React.MouseEvent) => void;
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
      disabled={disabled}
      className="practice-ui transition disabled:cursor-not-allowed disabled:opacity-40"
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

function CategoryChip({
  label,
  count,
  active,
  disabled,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
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
      aria-pressed={active}
      className="practice-ui transition disabled:cursor-not-allowed"
      style={{
        ...tone,
        borderRadius: 999,
        padding: "6px 12px",
        fontSize: 12,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {label}
      <span
        style={{
          opacity: active ? 0.8 : 0.6,
          fontWeight: 500,
        }}
      >
        ({count})
      </span>
    </button>
  );
}

function CategoryAccordion({
  label,
  count,
  expanded,
  allOn,
  onToggleOpen,
  onToggleAll,
  children,
}: {
  label: string;
  count: number;
  expanded: boolean;
  allOn: boolean;
  onToggleOpen: () => void;
  onToggleAll: (ev?: React.MouseEvent) => void;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--practice-surface-elev)",
        border: "1px solid var(--practice-stroke-subtle)",
        borderRadius: "var(--practice-radius)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex w-full items-center gap-2 text-left"
        style={{
          padding: "9px 12px",
          borderBottom: expanded
            ? "1px solid var(--practice-stroke-subtle)"
            : "1px solid transparent",
        }}
      >
        <Chevron expanded={expanded} small />
        <span
          className="practice-ui min-w-0 flex-1 truncate"
          style={{
            color: "var(--practice-text)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {label}{" "}
          <span
            style={{
              color: "var(--practice-text-tertiary)",
              fontWeight: 500,
            }}
          >
            ({count})
          </span>
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={(ev) => {
            ev.stopPropagation();
            onToggleAll(ev);
          }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" || ev.key === " ") {
              ev.preventDefault();
              ev.stopPropagation();
              onToggleAll();
            }
          }}
          className="practice-ui shrink-0 cursor-pointer transition"
          style={{
            background: allOn
              ? "var(--practice-surface-elev)"
              : "var(--practice-accent)",
            color: allOn
              ? "var(--practice-text-secondary)"
              : "var(--practice-accent-ink)",
            border: allOn
              ? "1px solid var(--practice-stroke)"
              : "1px solid var(--practice-accent)",
            borderRadius: "var(--practice-radius)",
            padding: "2px 8px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {allOn ? "Clear" : "All"}
        </span>
      </button>
      {children}
    </div>
  );
}

function WordPill({
  row,
  selected,
  onClick,
}: {
  row: KanaRow;
  selected: boolean;
  onClick: () => void;
}) {
  const tone: CSSProperties = selected
    ? {
        background: "var(--practice-accent)",
        color: "var(--practice-accent-ink)",
        border: "1px solid var(--practice-accent)",
      }
    : {
        background: "var(--practice-surface)",
        color: "var(--practice-text)",
        border: "1px solid var(--practice-stroke)",
      };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="transition"
      style={{
        ...tone,
        borderRadius: "var(--practice-radius)",
        padding: "8px 12px",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 1,
        minWidth: 0,
        textAlign: "left",
      }}
    >
      <span
        className="practice-kana"
        style={{
          fontFamily: "var(--practice-kana-font)",
          fontWeight: 500,
          fontSize: 16,
          lineHeight: 1.1,
        }}
      >
        {row.char}
      </span>
      <span
        className="practice-ui"
        style={{
          fontSize: 11,
          opacity: selected ? 0.85 : 0.7,
          marginTop: 2,
        }}
      >
        {row.romaji}
        {row.meaning && ` · ${row.meaning}`}
      </span>
    </button>
  );
}

function Chevron({
  expanded,
  small,
}: {
  expanded: boolean;
  small?: boolean;
}) {
  return (
    <ChevronDown
      className={small ? "h-3 w-3 shrink-0" : "h-4 w-4 shrink-0"}
      style={{
        color: small
          ? "var(--practice-accent)"
          : "var(--practice-text-secondary)",
        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s",
      }}
      aria-hidden
    />
  );
}
