import { Fragment } from "react";
import type { KanaRow } from "@/api/types";
import { KanaTile } from "@/components/KanaTile";
import { useMinWidthLg } from "@/hooks/useMinWidthLg";
import { kanaKey } from "@/lib/kanaKeys";
import {
  YOON_COL_LABELS,
  YOON_MATRIX,
  YOON_ROW_LABELS,
} from "@/lib/extraKanaLayout";

type Props = {
  yoonItems: KanaRow[];
  selected: Set<string>;
  onToggle: (key: string, row: KanaRow) => void;
};

/** Yoon 11×3 grid; order matches catalog. Desktop: vowels (ya/yu/yo) on rows, consonants on columns. */
export function KanaYoonTable({
  yoonItems,
  selected,
  onToggle,
}: Props) {
  const isLg = useMinWidthLg();
  const rows = YOON_MATRIX.length;
  const cols = 3;

  function cellAt(ri: number, ci: number): KanaRow | undefined {
    const idx = ri * cols + ci;
    return yoonItems[idx];
  }

  const wrapClass =
    "overflow-x-auto rounded-2xl border border-slate-200 bg-indigo-50/40 p-2 sm:p-4";

  if (isLg) {
    return (
      <div className={wrapClass}>
        <div
          className="mx-auto grid w-full min-w-[min(100%,520px)] gap-1.5 sm:gap-2 lg:min-w-[680px]"
          style={{
            gridTemplateColumns:
              "minmax(2rem,2.5rem) repeat(11, minmax(2rem, 1fr))",
            gridTemplateRows: "auto repeat(3, auto)",
          }}
        >
          <div className="col-start-1 row-start-1" aria-hidden />

          {YOON_ROW_LABELS.map((h, cc) => (
            <div
              key={h}
              className="flex items-end justify-center pb-0.5 text-center text-[10px] font-semibold text-slate-600 sm:text-xs"
              style={{ gridColumn: cc + 2, gridRow: 1 }}
            >
              {h}
            </div>
          ))}

          {YOON_COL_LABELS.map((h, vr) => (
            <Fragment key={h}>
              <div
                className="flex items-center justify-end pr-1 text-[10px] font-semibold text-slate-600 sm:text-xs"
                style={{ gridColumn: 1, gridRow: vr + 2 }}
              >
                {h}
              </div>
              {Array.from({ length: rows }, (_, cc) => {
                const kana = cellAt(cc, vr);
                return (
                  <div
                    key={`${vr}-${cc}`}
                    className="flex min-w-0 items-center justify-center"
                    style={{ gridColumn: cc + 2, gridRow: vr + 2 }}
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

  return (
    <div className={wrapClass}>
      <div
        className="mx-auto grid w-full min-w-[min(100%,380px)] gap-1.5 sm:min-w-[420px] sm:gap-2"
        style={{
          gridTemplateColumns:
            "minmax(1.75rem,2rem) repeat(3, minmax(2.25rem, 1fr))",
          gridTemplateRows: `auto repeat(${rows}, auto)`,
        }}
      >
        <div className="col-start-1 row-start-1" aria-hidden />

        {YOON_COL_LABELS.map((h, ci) => (
          <div
            key={h}
            className="flex items-end justify-center pb-0.5 text-center text-[10px] font-semibold text-slate-600 sm:text-xs"
            style={{ gridColumn: ci + 2, gridRow: 1 }}
          >
            {h}
          </div>
        ))}

        {YOON_MATRIX.map((_, ri) => (
          <Fragment key={YOON_ROW_LABELS[ri]}>
            <div
              className="flex items-center justify-end pr-1 text-[10px] font-semibold text-slate-600 sm:text-xs"
              style={{ gridColumn: 1, gridRow: ri + 2 }}
            >
              {YOON_ROW_LABELS[ri]}
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
