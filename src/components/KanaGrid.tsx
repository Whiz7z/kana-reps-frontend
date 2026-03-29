import type { KanaRow } from "@/api/types";
import type { KanaGuessStatsMap } from "@/components/KanaTile";
import { GojuonTable } from "@/components/GojuonTable";
import { KanaDakutenTable } from "@/components/KanaDakutenTable";
import { KanaYoonTable } from "@/components/KanaYoonTable";
import { KanaGridMobile } from "@/components/KanaGridMobile";
import { kanaKey } from "@/lib/kanaKeys";

const bulkBtnClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm";

function SectionBulkActions({
  keys,
  onBulkRow,
}: {
  keys: string[];
  onBulkRow: (keys: string[], select: boolean) => void;
}) {
  if (keys.length === 0) return null;
  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={() => onBulkRow(keys, true)}
        className={bulkBtnClass}
      >
        Select all
      </button>
      <button
        type="button"
        onClick={() => onBulkRow(keys, false)}
        className={bulkBtnClass}
      >
        Clear all
      </button>
    </div>
  );
}

type Props = {
  script: "hiragana" | "katakana";
  catalog: KanaRow[];
  selected: Set<string>;
  onToggle: (key: string, row: KanaRow) => void;
  onBulkRow: (keys: string[], select: boolean) => void;
  onBulkLevel: (
    level: "basic" | "dakuten" | "handakuten" | "yoon",
    select: boolean
  ) => void;
  guessStats?: KanaGuessStatsMap;
};

export function KanaGrid({
  script,
  catalog,
  selected,
  onToggle,
  onBulkRow,
  onBulkLevel,
  guessStats,
}: Props) {
  const rows = catalog.filter((r) => r.kana_type === script);
  const basicItems = rows.filter((r) => r.level === "basic");
  const dakutenItems = rows.filter((r) => r.level === "dakuten");
  const handakutenItems = rows.filter((r) => r.level === "handakuten");
  const yoonItems = rows.filter((r) => r.level === "yoon");

  return (
    <>
      <div className="md:hidden">
        <KanaGridMobile
          script={script}
          catalog={catalog}
          selected={selected}
          onToggle={onToggle}
          onBulkRow={onBulkRow}
          onBulkLevel={onBulkLevel}
          guessStats={guessStats}
        />
      </div>

      <div className="hidden space-y-6 md:block">
        {basicItems.length > 0 && (
          <section className="rounded-3xl border border-slate-100/80 bg-white p-3 shadow-xl shadow-slate-200/50 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-700 sm:text-lg">
                Basic
              </h3>
              <SectionBulkActions
                keys={basicItems.map(kanaKey)}
                onBulkRow={onBulkRow}
              />
            </div>
            <GojuonTable
              script={script}
              rows={basicItems}
              selected={selected}
              onToggle={onToggle}
              guessStats={guessStats}
            />
          </section>
        )}

        {(dakutenItems.length > 0 || handakutenItems.length > 0) && (
          <section className="rounded-3xl border border-slate-100/80 bg-white p-3 shadow-xl shadow-slate-200/50 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-700 sm:text-lg">
                Dakuten &amp; Handakuten
              </h3>
              <SectionBulkActions
                keys={[...dakutenItems, ...handakutenItems].map(kanaKey)}
                onBulkRow={onBulkRow}
              />
            </div>
            <KanaDakutenTable
              dakutenItems={dakutenItems}
              handakutenItems={handakutenItems}
              selected={selected}
              onToggle={onToggle}
              guessStats={guessStats}
            />
          </section>
        )}

        {yoonItems.length > 0 && (
          <section className="rounded-3xl border border-slate-100/80 bg-white p-3 shadow-xl shadow-slate-200/50 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-700 sm:text-lg">
                Yoon
              </h3>
              <SectionBulkActions
                keys={yoonItems.map(kanaKey)}
                onBulkRow={onBulkRow}
              />
            </div>
            <KanaYoonTable
              yoonItems={yoonItems}
              selected={selected}
              onToggle={onToggle}
              guessStats={guessStats}
            />
          </section>
        )}
      </div>
    </>
  );
}
