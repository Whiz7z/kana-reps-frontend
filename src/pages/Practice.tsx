import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { QuestionHistory } from "@/components/QuestionHistory";
import { KanaToRomajiMode } from "@/components/modes/KanaToRomajiMode";
import { RomajiToKanaMode } from "@/components/modes/RomajiToKanaMode";
import { WritingMode } from "@/components/modes/WritingMode";
import { WordWritingMode } from "@/components/modes/WordWritingMode";
import type { HistoryEntry } from "@/components/modes/types";
import { Button } from "@/components/ui/Button";
import {
  loadPracticeFromSession,
  type PracticePayload,
} from "@/lib/practiceSession";

function modeLabel(mode: string, isWord: boolean) {
  if (mode === "romaji-to-kana") return "Romaji → Kana";
  if (mode === "writing") return isWord ? "Writing (trace)" : "Writing";
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
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Back to menu"
            onClick={() => navigate("/menu")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
              {payload.setLabel}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {modeLabel(mode, isWord)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-slate-100/80 bg-[var(--color-paper)] p-1 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:shadow-black/40 sm:p-8">
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
              <RomajiToKanaMode
                row={row}
                onRoundComplete={finishReadingRound}
              />
            ) : (
              <KanaToRomajiMode
                row={row}
                onRoundComplete={finishReadingRound}
                isWord={isWord}
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <QuestionHistory items={history} />
        </div>
      </div>
    </div>
  );
}
