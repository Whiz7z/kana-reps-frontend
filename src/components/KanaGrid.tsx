import type { KanaRow } from "@/api/types";
import type { KanaGuessStatsMap } from "@/types/kanaGuessStats";
import { KanaPickerRow } from "@/components/KanaPickerRow";
import { KanaTierAccordion } from "@/components/KanaTierAccordion";
import { kanaKey } from "@/lib/kanaKeys";
import { cellKana } from "@/lib/gojuon";
import { consonantRowsFromGojuon } from "@/lib/mobileKanaLayout";
import { YOON_MATRIX, YOON_ROW_LABELS } from "@/lib/extraKanaLayout";
import { pickerColumnTitle, pickerPanelBg, pickerPanelBorder } from "@/lib/customPickerTokens";
import { cn } from "@/lib/utils";

type Props = {
  script: "hiragana" | "katakana";
  catalog: KanaRow[];
  selected: Set<string>;
  onToggle: (key: string, row: KanaRow) => void;
  onBulkRow: (keys: string[], select: boolean) => void;
  guessStats?: KanaGuessStatsMap;
};

function keysForDesktopSection(
  catalog: KanaRow[],
  script: "hiragana" | "katakana",
  section: "basic" | "dakuten" | "yoon"
): string[] {
  const rows = catalog.filter((r) => r.kana_type === script);
  if (section === "basic") {
    return rows.filter((r) => r.level === "basic").map(kanaKey);
  }
  if (section === "yoon") {
    return rows.filter((r) => r.level === "yoon").map(kanaKey);
  }
  return rows
    .filter((r) => r.level === "dakuten" || r.level === "handakuten")
    .map(kanaKey);
}

function dakutenCellAt(
  dakutenItems: KanaRow[],
  handakutenItems: KanaRow[],
  ri: number,
  ci: number
): KanaRow | undefined {
  if (ri < 4) return dakutenItems[ri * 5 + ci];
  return handakutenItems[ci];
}

function ScriptColumn({
  script,
  catalog,
  selected,
  onToggle,
  onBulkRow,
  guessStats,
}: {
  script: "hiragana" | "katakana";
  catalog: KanaRow[];
  selected: Set<string>;
  onToggle: (key: string, row: KanaRow) => void;
  onBulkRow: (keys: string[], select: boolean) => void;
  guessStats?: KanaGuessStatsMap;
}) {
  const rows = catalog.filter((r) => r.kana_type === script);
  const basicItems = rows.filter((r) => r.level === "basic");
  const dakutenItems = rows.filter((r) => r.level === "dakuten");
  const handakutenItems = rows.filter((r) => r.level === "handakuten");
  const yoonItems = rows.filter((r) => r.level === "yoon");

  const gojuonRows = consonantRowsFromGojuon();
  const nRowDef = gojuonRows.find((r) => r.label === "ん");
  const mainRowDefs = gojuonRows.filter((r) => r.label !== "ん");

  const tierBasicKeys = keysForDesktopSection(catalog, script, "basic");
  const tierDakKeys = keysForDesktopSection(catalog, script, "dakuten");
  const tierYoonKeys = keysForDesktopSection(catalog, script, "yoon");

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1 rounded-xl ",
        pickerPanelBg,
        pickerPanelBorder
      )}
    >
      <h3
        className={cn(
          pickerColumnTitle,
          "mb-0.5 text-center text-base sm:text-lg lg:text-left"
        )}
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
            {mainRowDefs.map((def) => {
              const cells: (KanaRow | null)[] = def.cells.map((rk) =>
                rk ? (cellKana(basicItems, script, rk) ?? null) : null
              );
              return (
                <KanaPickerRow
                  key={def.label}
                  rowId={`basic-${script}-${def.label}`}
                  cells={cells}
                  cols={5}
                  selected={selected}
                  onToggle={onToggle}
                  onBulkRow={onBulkRow}
                  guessStats={guessStats}
                />
              );
            })}
            {nRowDef && (
              <KanaPickerRow
                rowId={`basic-${script}-n`}
                cells={nRowDef.cells.map((rk) =>
                  rk ? (cellKana(basicItems, script, rk) ?? null) : null
                )}
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
            {Array.from({ length: 5 }, (_, ri) => {
              const cells: (KanaRow | null)[] = Array.from(
                { length: 5 },
                (_, ci) =>
                  dakutenCellAt(dakutenItems, handakutenItems, ri, ci) ?? null
              );
              return (
                <KanaPickerRow
                  key={`dak-${script}-${ri}`}
                  rowId={`dakuten-${script}-${ri}`}
                  cells={cells}
                  cols={5}
                  selected={selected}
                  onToggle={onToggle}
                  onBulkRow={onBulkRow}
                  guessStats={guessStats}
                />
              );
            })}
          </div>
        </KanaTierAccordion>
      )}

      {yoonItems.length > 0 && (
        <KanaTierAccordion
          title="Yoon"
          tierKeys={tierYoonKeys}
          selected={selected}
          onBulkRow={onBulkRow}
          guessStats={guessStats}
        >
          <div className="min-w-0 overflow-x-hidden">
            {YOON_MATRIX.map((_, ri) => {
              const cells: (KanaRow | null)[] = [0, 1, 2].map((ci) => {
                const idx = ri * 3 + ci;
                return yoonItems[idx] ?? null;
              });
              const label = YOON_ROW_LABELS[ri] ?? `y-${ri}`;
              return (
                <KanaPickerRow
                  key={`yoon-${script}-${label}`}
                  rowId={`yoon-${script}-${label}`}
                  cells={cells}
                  cols={3}
                  selected={selected}
                  onToggle={onToggle}
                  onBulkRow={onBulkRow}
                  guessStats={guessStats}
                />
              );
            })}
          </div>
        </KanaTierAccordion>
      )}
    </div>
  );
}

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
