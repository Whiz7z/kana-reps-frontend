import { useCallback, useEffect, useRef, useState } from "react";
import type { KanaRow } from "@/api/types";
import { reportKanaGuess } from "@/api/client";
import {
  PracticeButton,
  PracticeHints,
  PracticeKanaGlyph,
  PracticePromptCard,
  PracticeTextInput,
} from "@/components/practice/PracticeUI";
import { RomajiKeyboard } from "@/components/practice/RomajiKeyboard";
import { useAuth } from "@/context/AuthContext";
import { useIsTouchPrimary } from "@/hooks/useIsTouchPrimary";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const isTouch = useIsTouchPrimary();

  // Edits not yet rendered to the DOM, so rapid taps within one frame chain correctly.
  const pendingEdit = useRef<{ value: string; caret: number } | null>(null);

  const editAtCaret = useCallback(
    (edit: (value: string, start: number, end: number) => [string, number]) => {
      const el = inputRef.current;
      if (!el) return;
      const pending = pendingEdit.current;
      const value = pending?.value ?? el.value;
      const start = pending?.caret ?? el.selectionStart ?? value.length;
      const end = pending?.caret ?? el.selectionEnd ?? start;
      const [next, caret] = edit(value, start, end);
      const entry = { value: next, caret };
      pendingEdit.current = entry;
      setInput(next);
      requestAnimationFrame(() => {
        if (pendingEdit.current === entry) pendingEdit.current = null;
        el.focus({ preventScroll: true });
        el.setSelectionRange(caret, caret);
      });
    },
    []
  );

  const typeLetter = useCallback(
    (letter: string) =>
      editAtCaret((v, start, end) => [
        v.slice(0, start) + letter + v.slice(end),
        start + letter.length,
      ]),
    [editAtCaret]
  );

  const backspace = useCallback(
    () =>
      editAtCaret((v, start, end) => {
        if (start !== end) return [v.slice(0, start) + v.slice(end), start];
        if (start === 0) return [v, 0];
        return [v.slice(0, start - 1) + v.slice(start), start - 1];
      }),
    [editAtCaret]
  );

  useEffect(() => {
    setInput("");
    setPeek(false);
  }, [row.char, row.romaji]);

  const checkAnswer = useCallback(() => {
    console.log("checkAnswer", input, row.romaji);
    const ok = isWord
      ? normRomajiLenient(input) === normRomajiLenient(row.romaji)
      : normRomaji(input) === normRomaji(row.romaji);
    if (!isWord) {
      reportKanaGuess(row, ok, Boolean(user));
    }

    console.log("onRoundComplete", {
      prompt: row.char,
      answer: ok ? input.trim() || row.romaji : row.romaji,
      ok,
      meaning: isWord ? row.meaning : undefined,
    });
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
        inputRef={inputRef}
        inputProps={{
          "aria-label": "Answer",
          id: "answer-kana-to-romaji",
          autoComplete: "off",
          autoCorrect: "off",
          autoCapitalize: "off",
          spellCheck: false,
          enterKeyHint: "done",
          // The on-screen keyboard replaces the native one on touch devices.
          inputMode: isTouch ? "none" : "text",
        }}
      />

      <RomajiKeyboard
        onKey={typeLetter}
        onBackspace={backspace}
        showSpace={isWord}
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

      {!isTouch && (
        <PracticeHints
          hints={
            hasMeaning
              ? [
                  { key: "Enter", label: "check" },
                  { key: "Tab", label: peek ? "hide English" : "peek English" },
                ]
              : [{ key: "Space", label: "check" }]
          }
        />
      )}
    </>
  );
}
