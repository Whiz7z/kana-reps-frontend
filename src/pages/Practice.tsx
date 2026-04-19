import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  PracticeHeader,
  PracticeRecent,
  PracticeRoot,
} from "@/components/practice/PracticeUI";
import { KanaToRomajiMode } from "@/components/modes/KanaToRomajiMode";
import { RomajiToKanaMode } from "@/components/modes/RomajiToKanaMode";
import { WritingMode } from "@/components/modes/WritingMode";
import { WordWritingMode } from "@/components/modes/WordWritingMode";
import type { HistoryEntry } from "@/components/modes/types";
import {
  loadPracticeFromSession,
  type PracticePayload,
} from "@/lib/practiceSession";

function modeLabel(mode: string, isWord: boolean) {
  if (mode === "romaji-to-kana") return "Romaji → Kana";
  if (mode === "writing") return isWord ? "Writing · trace" : "Writing";
  return "Kana → Romaji";
}

export function Practice() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PracticePayload | undefined;
  const [payload, setPayload] = useState<PracticePayload | null>(null);
  const [idx, setIdx] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const p = state ?? loadPracticeFromSession();
    if (!p?.kanaData?.length) {
      navigate("/menu", { replace: true });
      return;
    }
    setPayload(p);
  }, [state, navigate]);

  const row = payload?.kanaData[idx];
  const mode = payload?.mode ?? "kana-to-romaji";
  const isWord = payload?.level === "word";

  const advance = useCallback(() => {
    if (!payload) return;
    setIdx((i) => (i + 1 >= payload.kanaData.length ? 0 : i + 1));
  }, [payload]);

  const finishReadingRound = useCallback(
    (entry: HistoryEntry) => {
      setHistory((h) => [...h, entry]);
      advance();
    },
    [advance]
  );

  const appendHistory = useCallback((entry: HistoryEntry) => {
    setHistory((h) => [...h, entry]);
  }, []);

  if (!payload || !row) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-indigo-900 dark:text-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Loading practice…
        </p>
      </div>
    );
  }

  return (
    <PracticeRoot>
      <PracticeHeader
        title={payload.setLabel}
        subtitle={modeLabel(mode, isWord)}
        step={idx + 1}
        total={payload.kanaData.length}
        onBack={() => navigate("/menu")}
      />

      {mode === "writing" ? (
        isWord ? (
          <WordWritingMode
            row={row}
            onAppendHistory={appendHistory}
            onAdvance={advance}
          />
        ) : (
          <WritingMode
            row={row}
            onAppendHistory={appendHistory}
            onAdvance={advance}
          />
        )
      ) : mode === "romaji-to-kana" ? (
        <RomajiToKanaMode row={row} onRoundComplete={finishReadingRound} />
      ) : (
        <KanaToRomajiMode
          row={row}
          onRoundComplete={finishReadingRound}
          isWord={isWord}
        />
      )}

      <PracticeRecent items={history} limit={3} />
    </PracticeRoot>
  );
}
