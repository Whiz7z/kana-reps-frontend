import { useCallback, useEffect, useState } from "react";
import type { KanaRow } from "@/api/types";
import { Button } from "@/components/ui/Button";
import type { HistoryEntry } from "./types";

type Props = {
  row: KanaRow;
  onRoundComplete: (entry: HistoryEntry) => void;
};

export function RomajiToKanaMode({ row, onRoundComplete }: Props) {
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setInput("");
    setRevealed(false);
  }, [row.char, row.romaji]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setRevealed(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const checkAnswer = useCallback(() => {
    const ok = input.trim() === row.char;
    onRoundComplete({
      prompt: row.romaji,
      answer: input || "(empty)",
      ok,
    });
  }, [input, row, onRoundComplete]);

  return (
    <>
      <div className="mb-6 flex min-h-[10rem] items-center justify-center rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 py-6 md:py-10">
        <div className="text-center">
          <div>
            <p className="text-4xl font-semibold text-purple-900">
              {row.romaji}
            </p>
            {revealed && (
              <p className="mt-2 text-5xl text-gray-800">{row.char}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="sr-only" htmlFor="answer-romaji-to-kana">
          Answer
        </label>
        <input
          id="answer-romaji-to-kana"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              checkAnswer();
            }
          }}
          placeholder="Type kana (Enter)"
          className="w-full rounded-xl border border-purple-200 px-4 py-3 text-lg shadow-inner focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        {!revealed && "Press SPACE to reveal · "}
        {revealed && "Answer shown · "}
        Enter — check
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Button onClick={checkAnswer}>Check</Button>
      </div>
    </>
  );
}
