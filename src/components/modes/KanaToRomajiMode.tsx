import { useCallback, useEffect, useState } from "react";
import type { KanaRow } from "@/api/types";
import { reportKanaGuess } from "@/api/client";
import {
  PracticeButton,
  PracticeHints,
  PracticeKanaGlyph,
  PracticePromptCard,
  PracticeTextInput,
} from "@/components/practice/PracticeUI";
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
      meaning: isWord ? row.meaning : undefined,
    });
  }, [input, row, onRoundComplete, user, isWord]);

  const hasMeaning =
    isWord && typeof row.meaning === "string" && row.meaning.length > 0;

  const kanaSize = row.char.length > 1 ? 64 : 96;

  return (
    <>
      <PracticePromptCard minHeight={180}>
        <PracticeKanaGlyph size={kanaSize}>{row.char}</PracticeKanaGlyph>
        {hasMeaning && (
          <p
            id="practice-word-meaning"
            aria-live="polite"
            className="practice-ui mt-4 text-center"
            hidden={!peek}
            style={{
              color: "var(--practice-text-secondary)",
              fontSize: 14,
            }}
          >
            {row.meaning}
          </p>
        )}
      </PracticePromptCard>

      <PracticeTextInput
        value={input}
        onChange={setInput}
        onSubmit={checkAnswer}
        onSpecialKey={(e) => {
          const isTab = e.key === "Tab" || e.code === "Tab";
          if (hasMeaning && isTab) {
            setPeek((v) => !v);
            return true;
          }
        }}
        placeholder="Type romaji…"
        submitLabel="Check"
        inputProps={{
          "aria-label": "Answer",
          id: "answer-kana-to-romaji",
          autoComplete: "off",
          autoCorrect: "off",
          autoCapitalize: "off",
          spellCheck: false,
        }}
      />

      {hasMeaning && (
        <div className="flex justify-center">
          <PracticeButton
            variant="ghost"
            aria-expanded={peek}
            aria-controls="practice-word-meaning"
            onClick={() => setPeek((v) => !v)}
            className="max-w-full"
          >
            {peek ? "Hide English" : "Peek English"}
          </PracticeButton>
        </div>
      )}

      <PracticeHints
        hints={
          hasMeaning
            ? [
                { key: "Enter", label: "check" },
                { key: "Tab", label: peek ? "hide English" : "peek English" },
              ]
            : [{ key: "Enter", label: "check" }]
        }
      />
    </>
  );
}
