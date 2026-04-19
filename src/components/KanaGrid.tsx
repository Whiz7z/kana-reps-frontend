import { memo, useMemo } from "react";
import type { KanaRow } from "@/api/types";
import type { KanaGuessStatsMap } from "@/types/kanaGuessStats";
import { KanaPickerRow } from "@/components/KanaPickerRow";
import { KanaTierAccordion } from "@/components/KanaTierAccordion";
import { kanaKey } from "@/lib/kanaKeys";
import { cellKana } from "@/lib/gojuon";
import { consonantRowsFromGojuon } from "@/lib/mobileKanaLayout";
import {
  DAKUTEN_HAND_ROW_LABELS,
  YOON_MATRIX,
  YOON_ROW_LABELS,
} from "@/lib/extraKanaLayout";

// Layout is a pure, argument-free derivation of compile-time data; compute it
// once at module load instead of on every ScriptColumn render.
const GOJUON_ROWS = consonantRowsFromGojuon();
const N_ROW_DEF = GOJUON_ROWS.find((r) => r.label === "ん");
const MAIN_ROW_DEFS = GOJUON_ROWS.filter((r) => r.label !== "ん");

type Props = {
  script: "hiragana" | "katakana";
  catalog: KanaRow[];
  selected: Set<string>;
  onToggle: (key: string, row: KanaRow) => void;
  onBulkRow: (keys: string[], select: boolean) => void;
  guessStats?: KanaGuessStatsMap;
};

function dakutenCellAt(
  dakutenItems: KanaRow[],
  handakutenItems: KanaRow[],
  ri: number,
  ci: number
): KanaRow | undefined {
  if (ri < 4) return dakutenItems[ri * 5 + ci];
  return handakutenItems[ci];
}

/** The gojūon emits "∅" for the pure-vowel row; prefer "a" for display. */
function displayRowLabel(raw: string): string {
  if (raw === "∅") return "a";
  return raw;
}

type ScriptColumnProps = {
  script: "hiragana" | "katakana";
  catalog: KanaRow[];
  selected: Set<string>;
  onToggle: (key: string, row: KanaRow) => void;
  onBulkRow: (keys: string[], select: boolean) => void;
  guessStats?: KanaGuessStatsMap;
};

function selectionWithinKeysEqual(
  keys: string[],
  a: Set<string>,
  b: Set<string>
): boolean {
  if (a === b) return true;
  for (const k of keys) {
    if (a.has(k) !== b.has(k)) return false;
  }
  return true;
}

function ScriptColumnInner({
  script,
  catalog,
  selected,
  onToggle,
  onBulkRow,
  guessStats,
}: ScriptColumnProps) {
  // Split the catalog by script + level exactly once per (catalog, script)
  // rather than on every selection toggle.
  const { basicItems, dakutenItems, handakutenItems, yoonItems } = useMemo(() => {
    const rows = catalog.filter((r) => r.kana_type === script);
    return {
      basicItems: rows.filter((r) => r.level === "basic"),
      dakutenItems: rows.filter((r) => r.level === "dakuten"),
      handakutenItems: rows.filter((r) => r.level === "handakuten"),
      yoonItems: rows.filter((r) => r.level === "yoon"),
    };
  }, [catalog, script]);

  const tierBasicKeys = useMemo(
    () => basicItems.map(kanaKey),
    [basicItems]
  );
  const tierDakKeys = useMemo(
    () => [...dakutenItems, ...handakutenItems].map(kanaKey),
    [dakutenItems, handakutenItems]
  );
  const tierYoonKeys = useMemo(() => yoonItems.map(kanaKey), [yoonItems]);

  // Pre-build the cell matrices for each tier so rerenders don't re-allocate
  // these arrays on every selection change.
  const basicRows = useMemo(() => {
    const main = MAIN_ROW_DEFS.map((def) => ({
      key: def.label,
      rowId: `basic-${script}-${def.label}`,
      rowLabel: displayRowLabel(def.label),
      cells: def.cells.map((rk) =>
        rk ? (cellKana(basicItems, script, rk) ?? null) : null
      ) as (KanaRow | null)[],
    }));
    const nRow = N_ROW_DEF
      ? {
          key: "n",
          rowId: `basic-${script}-n`,
          rowLabel: "ん",
          cells: N_ROW_DEF.cells.map((rk) =>
            rk ? (cellKana(basicItems, script, rk) ?? null) : null
          ) as (KanaRow | null)[],
        }
      : null;
    return { main, nRow };
  }, [basicItems, script]);

  const dakutenRows = useMemo(() => {
    return Array.from({ length: 5 }, (_, ri) => ({
      key: `dak-${script}-${ri}`,
      rowId: `dakuten-${script}-${ri}`,
      rowLabel: DAKUTEN_HAND_ROW_LABELS[ri] ?? "",
      cells: Array.from(
        { length: 5 },
        (_, ci) =>
          dakutenCellAt(dakutenItems, handakutenItems, ri, ci) ?? null
      ) as (KanaRow | null)[],
    }));
  }, [dakutenItems, handakutenItems, script]);

  const yoonRows = useMemo(() => {
    return YOON_MATRIX.map((_, ri) => {
      const label = YOON_ROW_LABELS[ri] ?? `y-${ri}`;
      return {
        key: `yoon-${script}-${label}`,
        rowId: `yoon-${script}-${label}`,
        rowLabel: label,
        cells: [0, 1, 2].map((ci) => yoonItems[ri * 3 + ci] ?? null) as (
          | KanaRow
          | null
        )[],
      };
    });
  }, [yoonItems, script]);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <h3
        className="practice-kana truncate text-base font-semibold sm:text-lg"
        style={{ color: "var(--practice-text)" }}
      >
        {script === "hiragana" ? "Hiragana ひらがな" : "Katakana カタカナ"}
      </h3>

      {basicItems.length > 0 && (
        <KanaTierAccordion
          title="Basic"
          tierKeys={tierBasicKeys}
          selected={selected}
          onBulkRow={onBulkRow}
          guessStats={guessStats}
        >
          <div className="min-w-0 overflow-x-hidden">
            {basicRows.main.map((def) => (
              <KanaPickerRow
                key={def.key}
                rowId={def.rowId}
                rowLabel={def.rowLabel}
                cells={def.cells}
                cols={5}
                selected={selected}
                onToggle={onToggle}
                onBulkRow={onBulkRow}
                guessStats={guessStats}
              />
            ))}
            {basicRows.nRow && (
              <KanaPickerRow
                rowId={basicRows.nRow.rowId}
                rowLabel={basicRows.nRow.rowLabel}
                cells={basicRows.nRow.cells}
                cols={5}
                selected={selected}
                onToggle={onToggle}
                onBulkRow={onBulkRow}
                guessStats={guessStats}
              />
            )}
          </div>
        </KanaTierAccordion>
      )}

      {(dakutenItems.length > 0 || handakutenItems.length > 0) && (
        <KanaTierAccordion
          title="Dakuten & Handakuten"
          tierKeys={tierDakKeys}
          selected={selected}
          onBulkRow={onBulkRow}
          guessStats={guessStats}
        >
          <div className="min-w-0 overflow-x-hidden">
            {dakutenRows.map((def) => (
              <KanaPickerRow
                key={def.key}
                rowId={def.rowId}
                rowLabel={def.rowLabel}
                cells={def.cells}
                cols={5}
                selected={selected}
                onToggle={onToggle}
                onBulkRow={onBulkRow}
                guessStats={guessStats}
              />
            ))}
          </div>
        </KanaTierAccordion>
      )}

      {yoonItems.length > 0 && (
        <KanaTierAccordion
          title="Yōon"
          tierKeys={tierYoonKeys}
          selected={selected}
          onBulkRow={onBulkRow}
          guessStats={guessStats}
        >
          <div className="min-w-0 overflow-x-hidden">
            {yoonRows.map((def) => (
              <KanaPickerRow
                key={def.key}
                rowId={def.rowId}
                rowLabel={def.rowLabel}
                cells={def.cells}
                cols={3}
                selected={selected}
                onToggle={onToggle}
                onBulkRow={onBulkRow}
                guessStats={guessStats}
              />
            ))}
          </div>
        </KanaTierAccordion>
      )}
    </div>
  );
}

function scriptColumnPropsEqual(
  prev: Readonly<ScriptColumnProps>,
  next: Readonly<ScriptColumnProps>
): boolean {
  if (prev.script !== next.script) return false;
  if (prev.catalog !== next.catalog) return false;
  if (prev.onToggle !== next.onToggle) return false;
  if (prev.onBulkRow !== next.onBulkRow) return false;
  if (prev.guessStats !== next.guessStats) return false;
  if (prev.selected === next.selected) return true;
  // Selection identity changed — check only the keys that belong to this
  // script so toggles in the sibling script don't rerender us.
  const scopedKeys: string[] = [];
  for (const row of next.catalog) {
    if (row.kana_type === next.script) scopedKeys.push(kanaKey(row));
  }
  return selectionWithinKeysEqual(scopedKeys, prev.selected, next.selected);
}

const ScriptColumn = memo(ScriptColumnInner, scriptColumnPropsEqual);

export function KanaGrid({
  script,
  catalog,
  selected,
  onToggle,
  onBulkRow,
  guessStats,
}: Props) {
  return (
    <>
      <div className="min-w-0 overflow-x-hidden lg:hidden">
        <ScriptColumn
          script={script}
          catalog={catalog}
          selected={selected}
          onToggle={onToggle}
          onBulkRow={onBulkRow}
          guessStats={guessStats}
        />
      </div>

      <div className="hidden min-w-0 gap-3 overflow-x-hidden lg:grid lg:grid-cols-2 lg:items-start xl:gap-4">
        <ScriptColumn
          script="hiragana"
          catalog={catalog}
          selected={selected}
          onToggle={onToggle}
          onBulkRow={onBulkRow}
          guessStats={guessStats}
        />
        <ScriptColumn
          script="katakana"
          catalog={catalog}
          selected={selected}
          onToggle={onToggle}
          onBulkRow={onBulkRow}
          guessStats={guessStats}
        />
      </div>
    </>
  );
}
