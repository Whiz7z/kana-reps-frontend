import { useCallback, useEffect, useState } from "react";
import type { KanaRow } from "@/api/types";
import { reportKanaGuess } from "@/api/client";
import {
  PracticeButton,
  PracticeHints,
  PracticeKanaGlyph,
  PracticePromptCard,
  PracticeRomajiGlyph,
} from "@/components/practice/PracticeUI";
import { useAuth } from "@/context/AuthContext";
import type { HistoryEntry } from "./types";

type Props = {
  row: KanaRow;
  onRoundComplete: (entry: HistoryEntry) => void;
};

export function RomajiToKanaMode({ row, onRoundComplete }: Props) {
  const { user } = useAuth();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [row.char, row.romaji]);

  const reveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const complete = useCallback(
    (ok: boolean) => {
      reportKanaGuess(row, ok, Boolean(user));
      onRoundComplete({
        prompt: row.romaji,
        answer: row.char,
        ok,
      });
    },
    [row, onRoundComplete, user]
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
      <PracticePromptCard minHeight={200}>
        <PracticeRomajiGlyph>{row.romaji}</PracticeRomajiGlyph>
        {revealed && (
          <div aria-live="polite" className="mt-6">
            <PracticeKanaGlyph size={72}>{row.char}</PracticeKanaGlyph>
          </div>
        )}
      </PracticePromptCard>

      {!revealed ? (
        <>
          <div className="flex justify-center">
            <PracticeButton onClick={reveal}>Reveal answer</PracticeButton>
          </div>
          <PracticeHints hints={[{ key: "Space", label: "reveal" }]} />
        </>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-2">
            <PracticeButton onClick={() => complete(true)}>Got it</PracticeButton>
            <PracticeButton
              variant="ghost"
              onClick={() => complete(false)}
            >
              Missed
            </PracticeButton>
          </div>
          <PracticeHints
            hints={[
              { key: "Y", label: "got it" },
              { key: "N", label: "missed" },
            ]}
          />
        </>
      )}
    </>
  );
}
