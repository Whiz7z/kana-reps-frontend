import { Fragment } from "react";
import type { KanaRow } from "@/api/types";
import { KanaTile } from "@/components/KanaTile";
import { kanaKey } from "@/lib/kanaKeys";
import {
  DAKUTEN_HAND_ROW_LABELS,
  VOWEL_FIVE,
} from "@/lib/extraKanaLayout";

type Props = {
  dakutenItems: KanaRow[];
  handakutenItems: KanaRow[];
  selected: Set<string>;
  onToggle: (key: string, row: KanaRow) => void;
};

/** Dakuten (4×5) + handakuten (1×5) in one grid; cells by catalog order. */
export function KanaDakutenTable({
  dakutenItems,
  handakutenItems,
  selected,
  onToggle,
}: Props) {
  const rows = 5;
  const cols = 5;

  function cellAt(ri: number, ci: number): KanaRow | undefined {
    if (ri < 4) {
      const idx = ri * cols + ci;
      return dakutenItems[idx];
    }
    return handakutenItems[ci];
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-pink-50/40 p-2 sm:p-4">
      <div
        className="mx-auto grid w-full min-w-[min(100%,420px)] gap-1.5 sm:min-w-[480px] sm:gap-2"
        style={{
          gridTemplateColumns:
            "minmax(1.75rem,2rem) repeat(5, minmax(2rem, 1fr))",
          gridTemplateRows: "auto repeat(5, auto)",
        }}
      >
        <div className="col-start-1 row-start-1" aria-hidden />

        {VOWEL_FIVE.map((h, ci) => (
          <div
            key={h}
            className="flex items-end justify-center pb-0.5 text-center text-[10px] font-semibold text-gray-600 sm:text-xs"
            style={{ gridColumn: ci + 2, gridRow: 1 }}
          >
            {h}
          </div>
        ))}

        {Array.from({ length: rows }, (_, ri) => (
          <Fragment key={DAKUTEN_HAND_ROW_LABELS[ri]}>
            <div
              className="flex items-center justify-end pr-1 text-[10px] font-semibold text-gray-600 sm:text-xs"
              style={{ gridColumn: 1, gridRow: ri + 2 }}
            >
              {DAKUTEN_HAND_ROW_LABELS[ri]}
            </div>
            {Array.from({ length: cols }, (_, ci) => {
              const kana = cellAt(ri, ci);
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
