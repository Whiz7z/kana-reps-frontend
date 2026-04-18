import { useCallback, useEffect, useState } from "react";
import type { KanaRow } from "@/api/types";
import { reportKanaGuess } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import type { HistoryEntry } from "./types";
import { normRomaji, normRomajiLenient } from "./utils";

type Props = {
  row: KanaRow;
  onRoundComplete: (entry: HistoryEntry) => void;
  isWord?: boolean;
};

export function KanaToRomajiMode({ row, onRoundComplete, isWord }: Props) {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [peek, setPeek] = useState(false);

  useEffect(() => {
    setInput("");
    setPeek(false);
  }, [row.char, row.romaji]);

  const checkAnswer = useCallback(() => {
    const ok = isWord
      ? normRomajiLenient(input) === normRomajiLenient(row.romaji)
      : normRomaji(input) === normRomaji(row.romaji);
    if (!isWord) {
      reportKanaGuess(row, ok, Boolean(user));
    }
    onRoundComplete({
      prompt: row.char,
      answer: ok ? input.trim() || row.romaji : row.romaji,
      ok,
    });
  }, [input, row, onRoundComplete, user, isWord]);

  const togglePeek = useCallback(() => {
    setPeek((v) => !v);
  }, []);

  const hasMeaning = isWord && typeof row.meaning === "string" && row.meaning.length > 0;

  return (
    <>
      <div className="mb-6 flex min-h-[10rem] flex-col items-center justify-center rounded-3xl bg-violet-50/90 py-6 dark:bg-violet-950/25 md:py-10">
        <div className="text-center">
          <p className="kana-practice-script text-8xl text-slate-900 dark:text-slate-100 md:text-9xl">
            {row.char}
          </p>
          {hasMeaning && peek && (
            <p
              className="mt-4 text-lg text-slate-700 dark:text-slate-200 md:text-xl"
              aria-live="polite"
            >
              {row.meaning}
            </p>
          )}
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
            } else if (hasMeaning && e.key === "Tab") {
              e.preventDefault();
              togglePeek();
            }
          }}
          placeholder="Type romaji (Enter)"
          className="kana-practice-script w-full rounded-2xl border border-indigo-200 px-4 py-4 text-2xl shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 md:text-3xl"
        />
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        Type romaji and press ENTER · Enter — check
        {hasMeaning && (
          <>
            {" · "}
            <kbd className="rounded border border-indigo-200 bg-white px-1.5 py-0.5 font-mono text-xs text-indigo-800">
              Tab
            </kbd>{" "}
            peek English
          </>
        )}
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Button onClick={checkAnswer}>Check</Button>
        {hasMeaning && (
          <Button variant="outline" onClick={togglePeek}>
            {peek ? "Hide English" : "Peek English"}
          </Button>
        )}
      </div>
    </>
  );
}
