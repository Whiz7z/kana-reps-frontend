import { useCallback, useEffect, useState } from "react";
import type { KanaRow } from "@/api/types";
import { Button } from "@/components/ui/Button";
import type { HistoryEntry } from "./types";

type Props = {
  row: KanaRow;
  onRoundComplete: (entry: HistoryEntry) => void;
};

export function RomajiToKanaMode({ row, onRoundComplete }: Props) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [row.char, row.romaji]);

  const reveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const complete = useCallback(
    (ok: boolean) => {
      onRoundComplete({
        prompt: row.romaji,
        answer: row.char,
        ok,
      });
    },
    [row, onRoundComplete]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        if (!revealed) {
          e.preventDefault();
          setRevealed(true);
        }
        return;
      }
      if (!revealed) return;
      if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        complete(true);
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        complete(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, complete]);

  return (
    <>
      <div className="mb-6 flex min-h-[12rem] flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50/90 py-6 md:min-h-[14rem] md:py-10">
        <div className="text-center">
          <div className="inline-block rounded-2xl bg-indigo-100/70 px-10 py-6 shadow-inner md:px-14 md:py-8">
            <p className="kana-practice-script text-5xl tracking-wide text-indigo-900 md:text-6xl lg:text-7xl">
              {row.romaji}
            </p>
          </div>
          {revealed && (
            <p
              className="kana-practice-script mt-6 text-6xl text-slate-900 md:text-7xl lg:text-8xl"
              aria-live="polite"
            >
              {row.char}
            </p>
          )}
        </div>
      </div>

      {!revealed ? (
        <>
          <p className="text-center text-sm text-slate-600">
            Picture or write the kana, then reveal the answer.
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            Press <kbd className="rounded border border-indigo-200 bg-white px-1.5 py-0.5 font-mono text-xs text-indigo-800">Space</kbd>{" "}
            to reveal
          </p>
          <div className="mt-6 flex justify-center">
            <Button type="button" size="lg" onClick={reveal}>
              Reveal answer
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-center text-sm text-slate-600">
            Were you right?
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            <kbd className="rounded border border-indigo-200 bg-white px-1.5 py-0.5 font-mono text-xs text-indigo-800">Y</kbd>{" "}
            got it ·{" "}
            <kbd className="rounded border border-indigo-200 bg-white px-1.5 py-0.5 font-mono text-xs text-indigo-800">N</kbd>{" "}
            missed
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button type="button" size="lg" onClick={() => complete(true)}>
              Got it
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => complete(false)}
            >
              Missed
            </Button>
          </div>
        </>
      )}
    </>
  );
}
