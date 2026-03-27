import type { KanaRow } from "@/api/types";
import { GojuonTable } from "@/components/GojuonTable";
import { KanaDakutenTable } from "@/components/KanaDakutenTable";
import { KanaYoonTable } from "@/components/KanaYoonTable";
import { KanaGridMobile } from "@/components/KanaGridMobile";

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
};

export function KanaGrid({
  script,
  catalog,
  selected,
  onToggle,
  onBulkRow,
  onBulkLevel,
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
        />
      </div>

      <div className="hidden space-y-6 md:block">
        {basicItems.length > 0 && (
          <section className="rounded-2xl bg-white p-3 shadow-sm sm:p-6">
            <h3 className="mb-3 text-base font-semibold text-gray-700 sm:text-lg">
              Basic
            </h3>
            <GojuonTable
              script={script}
              rows={basicItems}
              selected={selected}
              onToggle={onToggle}
            />
          </section>
        )}

        {(dakutenItems.length > 0 || handakutenItems.length > 0) && (
          <section className="rounded-2xl bg-white p-3 shadow-sm sm:p-6">
            <h3 className="mb-3 text-base font-semibold text-gray-700 sm:text-lg">
              Dakuten &amp; Handakuten
            </h3>
            <KanaDakutenTable
              dakutenItems={dakutenItems}
              handakutenItems={handakutenItems}
              selected={selected}
              onToggle={onToggle}
            />
          </section>
        )}

        {yoonItems.length > 0 && (
          <section className="rounded-2xl bg-white p-3 shadow-sm sm:p-6">
            <h3 className="mb-3 text-base font-semibold text-gray-700 sm:text-lg">
              Yoon
            </h3>
            <KanaYoonTable
              yoonItems={yoonItems}
              selected={selected}
              onToggle={onToggle}
            />
          </section>
        )}
      </div>
    </>
  );
}
