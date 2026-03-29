import { useCallback, useEffect, useState } from "react";
import type { KanaRow } from "@/api/types";
import { Button } from "@/components/ui/Button";
import type { HistoryEntry } from "./types";
import { normRomaji } from "./utils";

type Props = {
  row: KanaRow;
  onRoundComplete: (entry: HistoryEntry) => void;
};

export function KanaToRomajiMode({ row, onRoundComplete }: Props) {
  const [input, setInput] = useState("");

  useEffect(() => {
    setInput("");
  }, [row.char, row.romaji]);

  const checkAnswer = useCallback(() => {
    const ok = normRomaji(input) === normRomaji(row.romaji);
    onRoundComplete({
      prompt: row.char,
      answer: input || "(empty)",
      ok,
    });
  }, [input, row, onRoundComplete]);

  return (
    <>
      <div className="mb-6 flex min-h-[10rem] items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 py-6 md:py-10">
        <div className="text-center">
          <p className="kana-practice-script text-8xl text-slate-900 md:text-9xl">
            {row.char}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label className="sr-only" htmlFor="answer-kana-to-romaji">
          Answer
        </label>
        <input
          id="answer-kana-to-romaji"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              checkAnswer();
            }
          }}
          placeholder="Type romaji (Enter)"
          className="kana-practice-script w-full rounded-2xl border border-indigo-200 px-4 py-4 text-2xl shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 md:text-3xl"
        />
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        Type romaji and press ENTER · Enter — check
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Button onClick={checkAnswer}>Check</Button>
      </div>
    </>
  );
}
