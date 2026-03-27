import { ChevronDown } from "lucide-react";
import type { KanaRow } from "@/api/types";
import { KanaTile } from "@/components/KanaTile";
import { kanaKey } from "@/lib/kanaKeys";
import {
  YOON_COL_LABELS,
  YOON_ROW_LABELS,
} from "@/lib/extraKanaLayout";
import { VOWEL_COL_LABELS, consonantRowsFromGojuon } from "@/lib/mobileKanaLayout";
import { cellKana } from "@/lib/gojuon";
import { cn } from "@/lib/utils";

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

const DAKUTEN_ROW_LABELS = ["g", "z", "d", "b"] as const;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function padToFive(rows: KanaRow[]): (KanaRow | null)[] {
  const a: (KanaRow | null)[] = rows.map((r) => r);
  while (a.length < 5) a.push(null);
  return a.slice(0, 5);
}

function padToThree(rows: KanaRow[]): (KanaRow | null)[] {
  const a: (KanaRow | null)[] = rows.map((r) => r);
  while (a.length < 3) a.push(null);
  return a.slice(0, 3);
}

function MobileKanaRow({
  kanaCells,
  rowLabel,
  singleFullWidth,
  selected,
  onToggle,
  onBulkRow,
  gridCols = 5,
}: {
  kanaCells: (KanaRow | null)[];
  rowLabel: string;
  singleFullWidth?: boolean;
  selected: Set<string>;
  onToggle: (key: string, row: KanaRow) => void;
  onBulkRow: (keys: string[], select: boolean) => void;
  gridCols?: 3 | 5;
}) {
  const keys = kanaCells
    .filter((x): x is KanaRow => x != null)
    .map((r) => kanaKey(r));
  const allOn = keys.length > 0 && keys.every((k) => selected.has(k));
  const someOn = keys.some((k) => selected.has(k));

  const toggleRow = () => {
    onBulkRow(keys, !allOn);
  };

  const only = kanaCells.find(Boolean);

  if (singleFullWidth && only) {
    return (
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={toggleRow}
          className="flex w-[4.25rem] shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-1 py-2 text-[10px] font-medium leading-tight text-gray-800 shadow-sm"
        >
          Select row
        </button>
        <div className="flex min-h-[3rem] flex-1 items-center justify-center">
          <KanaTile
            row={only}
            selected={selected.has(kanaKey(only))}
            onToggle={() => onToggle(kanaKey(only), only)}
            layout="mobileWide"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-stretch gap-1.5 sm:gap-2">
      <button
        type="button"
        onClick={toggleRow}
        aria-pressed={someOn}
        className={cn(
          "flex w-[4.25rem] shrink-0 flex-col items-center justify-center rounded-lg border px-1 py-2 text-[10px] font-medium leading-tight shadow-sm",
          allOn
            ? "border-purple-400 bg-purple-50 text-purple-900"
            : "border-gray-300 bg-white text-gray-800"
        )}
      >
        Select row
      </button>
      <div
        className={cn(
          "grid min-w-0 flex-1 gap-1",
          gridCols === 3 ? "grid-cols-3" : "grid-cols-5"
        )}
      >
        {kanaCells.map((kana, i) =>
          kana ? (
            <KanaTile
              key={`${rowLabel}-${i}-${kana.char}`}
              row={kana}
              selected={selected.has(kanaKey(kana))}
              onToggle={() => onToggle(kanaKey(kana), kana)}
              layout="mobile"
            />
          ) : gridCols === 5 ? (
            <div
              key={`empty-${rowLabel}-${i}`}
              className="min-h-[3.25rem] rounded-lg border border-transparent"
              aria-hidden
            />
          ) : null
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  defaultOpen = true,
  children,
  footer,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="kana-details-section overflow-hidden rounded-xl border border-gray-200 bg-white"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-3 text-sm font-semibold text-gray-800 [&::-webkit-details-marker]:hidden">
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200" />
        {title}
      </summary>
      <div className="space-y-3 p-3">{children}</div>
      {footer}
    </details>
  );
}

export function KanaGridMobile({
  script,
  catalog,
  selected,
  onToggle,
  onBulkRow,
  onBulkLevel,
}: Props) {
  const scriptRows = catalog.filter((r) => r.kana_type === script);
  const basicItems = scriptRows.filter((r) => r.level === "basic");
  const dakutenItems = scriptRows.filter((r) => r.level === "dakuten");
  const handItems = scriptRows.filter((r) => r.level === "handakuten");
  const yoonItems = scriptRows.filter((r) => r.level === "yoon");

  const gojuonRows = consonantRowsFromGojuon();
  const nRowDef = gojuonRows.find((r) => r.label === "ん");
  const mainRowDefs = gojuonRows.filter((r) => r.label !== "ん");

  const dakChunks = chunk(dakutenItems, 5);
  const yoonChunks = chunk(yoonItems, 3);

  const nKanaCells: (KanaRow | null)[] | null = nRowDef
    ? nRowDef.cells.map((rk) =>
        rk ? (cellKana(basicItems, script, rk) ?? null) : null
      )
    : null;

  return (
    <div className="space-y-4">
      <div className="mb-1 flex gap-1.5 sm:gap-2">
        <div className="w-[4.25rem] shrink-0" aria-hidden />
        <div className="grid min-w-0 flex-1 grid-cols-5 gap-1">
          {VOWEL_COL_LABELS.map((v) => (
            <span
              key={v}
              className="text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500"
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      <Section
        title="Basic"
        footer={
          <div className="border-t border-gray-100 p-3">
            <button
              type="button"
              onClick={() => onBulkLevel("basic", true)}
              className="w-full rounded-xl bg-purple-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-600 active:bg-purple-700"
            >
              Select all basic
            </button>
          </div>
        }
      >
        <div className="space-y-2">
          {mainRowDefs.map((def) => {
            const kanaCells: (KanaRow | null)[] = def.cells.map((rk) =>
              rk ? (cellKana(basicItems, script, rk) ?? null) : null
            );
            return (
              <MobileKanaRow
                key={def.label}
                rowLabel={def.label}
                kanaCells={kanaCells}
                selected={selected}
                onToggle={onToggle}
                onBulkRow={onBulkRow}
                gridCols={5}
              />
            );
          })}
          {nKanaCells && (
            <MobileKanaRow
              rowLabel="ん"
              kanaCells={nKanaCells}
              selected={selected}
              onToggle={onToggle}
              onBulkRow={onBulkRow}
              singleFullWidth
            />
          )}
        </div>
      </Section>

      {dakutenItems.length > 0 && (
        <Section
          title="Dakuten"
          footer={
            <div className="border-t border-gray-100 p-3">
              <button
                type="button"
                onClick={() => onBulkLevel("dakuten", true)}
                className="w-full rounded-xl bg-purple-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-600 active:bg-purple-700"
              >
                Select all dakuten
              </button>
            </div>
          }
        >
          <div className="mb-2 flex gap-1.5 sm:gap-2">
            <div className="w-[4.25rem] shrink-0" aria-hidden />
            <div className="grid min-w-0 flex-1 grid-cols-5 gap-1">
              {VOWEL_COL_LABELS.map((v) => (
                <span
                  key={v}
                  className="text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {dakChunks.map((chunk, i) => (
              <MobileKanaRow
                key={`dak-${DAKUTEN_ROW_LABELS[i] ?? i}`}
                rowLabel={String(DAKUTEN_ROW_LABELS[i] ?? i)}
                kanaCells={padToFive(chunk)}
                selected={selected}
                onToggle={onToggle}
                onBulkRow={onBulkRow}
                gridCols={5}
              />
            ))}
          </div>
        </Section>
      )}

      {handItems.length > 0 && (
        <Section
          title="Handakuten"
          footer={
            <div className="border-t border-gray-100 p-3">
              <button
                type="button"
                onClick={() => onBulkLevel("handakuten", true)}
                className="w-full rounded-xl bg-purple-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-600 active:bg-purple-700"
              >
                Select all handakuten
              </button>
            </div>
          }
        >
          <div className="mb-2 flex gap-1.5 sm:gap-2">
            <div className="w-[4.25rem] shrink-0" aria-hidden />
            <div className="grid min-w-0 flex-1 grid-cols-5 gap-1">
              {VOWEL_COL_LABELS.map((v) => (
                <span
                  key={`h-${v}`}
                  className="text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
          <MobileKanaRow
            rowLabel="p"
            kanaCells={padToFive(handItems)}
            selected={selected}
            onToggle={onToggle}
            onBulkRow={onBulkRow}
            gridCols={5}
          />
        </Section>
      )}

      {yoonItems.length > 0 && (
        <Section
          title="Yoon"
          footer={
            <div className="border-t border-gray-100 p-3">
              <button
                type="button"
                onClick={() => onBulkLevel("yoon", true)}
                className="w-full rounded-xl bg-purple-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-600 active:bg-purple-700"
              >
                Select all yoon
              </button>
            </div>
          }
        >
          <div className="mb-2 flex gap-1.5 sm:gap-2">
            <div className="w-[4.25rem] shrink-0" aria-hidden />
            <div className="grid min-w-0 flex-1 grid-cols-3 gap-1">
              {YOON_COL_LABELS.map((v) => (
                <span
                  key={v}
                  className="text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {yoonChunks.map((chunk, i) => (
              <MobileKanaRow
                key={YOON_ROW_LABELS[i] ?? `y-${i}`}
                rowLabel={String(YOON_ROW_LABELS[i] ?? i)}
                kanaCells={padToThree(chunk)}
                selected={selected}
                onToggle={onToggle}
                onBulkRow={onBulkRow}
                gridCols={3}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
