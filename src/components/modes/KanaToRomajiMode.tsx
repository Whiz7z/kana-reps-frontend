import { useCallback, useEffect, useState } from "react";
import type { KanaRow } from "@/api/types";
import { reportKanaGuess } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import type { HistoryEntry } from "./types";
import { normRomaji } from "./utils";

type Props = {
  row: KanaRow;
  onRoundComplete: (entry: HistoryEntry) => void;
};

export function KanaToRomajiMode({ row, onRoundComplete }: Props) {
  const { user } = useAuth();
  const [input, setInput] = useState("");

  useEffect(() => {
    setInput("");
  }, [row.char, row.romaji]);

  const checkAnswer = useCallback(() => {
    const ok = normRomaji(input) === normRomaji(row.romaji);
    reportKanaGuess(row, ok, Boolean(user));
    onRoundComplete({
      prompt: row.char,
      answer: ok ? input.trim() || row.romaji : row.romaji,
      ok,
    });
  }, [input, row, onRoundComplete, user]);

  return (
    <>
      <div className="mb-6 flex min-h-[10rem] items-center justify-center rounded-3xl bg-violet-50/90 py-6 dark:bg-violet-950/25 md:py-10">
        <div className="text-center">
          <p className="kana-practice-script text-8xl text-slate-900 dark:text-slate-100 md:text-9xl">
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
