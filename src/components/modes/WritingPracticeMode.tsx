import { useEffect, useState } from "react";
import type { KanaRow } from "@/api/types";
import { WritingMode } from "./WritingMode";
import type { HistoryEntry } from "./types";

type Props = {
  row: KanaRow;
  onAppendHistory: (entry: HistoryEntry) => void;
  onAdvance: () => void;
};

export function WritingPracticeMode({
  row,
  onAppendHistory,
  onAdvance,
}: Props) {
  const [writingFeedback, setWritingFeedback] = useState<
    "correct" | "incorrect" | ""
  >("");
  const [recognizing, setRecognizing] = useState(false);

  useEffect(() => {
    setWritingFeedback("");
    setRecognizing(false);
  }, [row.char, row.romaji]);

  const drawingDisabled = recognizing || writingFeedback !== "";

  return (
    <div className="flex justify-center py-2">
      <WritingMode
        currentQuestion={{
          romaji: row.romaji,
          char: row.char,
          kana_type: row.kana_type,
        }}
        feedback={writingFeedback}
        recognizing={recognizing}
        drawingDisabled={drawingDisabled}
        onRecognize={() => setRecognizing(true)}
        onClear={() => setWritingFeedback("")}
        onReveal={() => {}}
        onResult={(recognizedChar) => {
          setRecognizing(false);
          if (!recognizedChar) {
            setWritingFeedback("incorrect");
            setTimeout(() => setWritingFeedback(""), 1200);
            return;
          }
          const ok = recognizedChar === row.char;
          setWritingFeedback(ok ? "correct" : "incorrect");
          onAppendHistory({
            prompt: row.romaji,
            answer: recognizedChar,
            ok,
          });
          if (ok) {
            setTimeout(() => onAdvance(), 800);
          } else {
            setTimeout(() => setWritingFeedback(""), 1200);
          }
        }}
      />
    </div>
  );
}
