import { Fragment } from "react";
import type { KanaRow } from "@/api/types";
import { KanaTile } from "@/components/KanaTile";
import { kanaKey } from "@/lib/kanaKeys";
import {
  COL_HEADERS,
  GOJUON_ROMAJI,
  ROW_LABELS,
  cellKana,
} from "@/lib/gojuon";

type Props = {
  script: "hiragana" | "katakana";
  rows: KanaRow[];
  selected: Set<string>;
  onToggle: (key: string, row: KanaRow) => void;
};

/** Desktop: CSS Grid with explicit placement — only kana tiles are rendered; no empty “tile” chrome. */
export function GojuonTable({ script, rows, selected, onToggle }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-pink-50/40 p-2 sm:p-4">
      <div
        className="mx-auto grid w-full min-w-[min(100%,520px)] gap-1.5 sm:min-w-[560px] sm:gap-2"
        style={{
          gridTemplateColumns:
            "minmax(1.75rem,2.25rem) repeat(11, minmax(2rem, 1fr))",
          gridTemplateRows: "auto repeat(5, auto)",
        }}
      >
        {/* Corner */}
        <div
          className="col-start-1 row-start-1"
          aria-hidden
        />

        {/* Column headers */}
        {COL_HEADERS.map((h, ci) => (
          <div
            key={h}
            className="flex items-end justify-center pb-0.5 text-center text-[10px] font-semibold text-gray-600 sm:text-xs"
            style={{ gridColumn: ci + 2, gridRow: 1 }}
          >
            {h}
          </div>
        ))}

        {/* Vowel rows + cells — empty slots render no tile; grid tracks keep alignment */}
        {GOJUON_ROMAJI.map((gridRow, ri) => (
          <Fragment key={ROW_LABELS[ri]}>
            <div
              className="flex items-center justify-end pr-1 text-[10px] font-semibold text-gray-600 sm:text-xs"
              style={{ gridColumn: 1, gridRow: ri + 2 }}
            >
              {ROW_LABELS[ri]}
            </div>
            {gridRow.map((cellKey, ci) => {
              const kana = cellKey
                ? cellKana(rows, script, cellKey)
                : undefined;
              return (
                <div
                  key={`${ri}-${ci}`}
                  className="flex min-w-0 items-center justify-center"
                  style={{ gridColumn: ci + 2, gridRow: ri + 2 }}
                >
                  {kana ? (
                    <KanaTile
                      row={kana}
                      selected={selected.has(kanaKey(kana))}
                      onToggle={() => onToggle(kanaKey(kana), kana)}
                      layout="table"
                    />
                  ) : null}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
