import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { QuestionHistory } from "@/components/QuestionHistory";
import { KanaToRomajiMode } from "@/components/modes/KanaToRomajiMode";
import { RomajiToKanaMode } from "@/components/modes/RomajiToKanaMode";
import { WritingPracticeMode } from "@/components/modes/WritingPracticeMode";
import type { HistoryEntry } from "@/components/modes/types";
import { Button } from "@/components/ui/Button";
import {
  loadPracticeFromSession,
  type PracticePayload,
} from "@/lib/practiceSession";

function modeLabel(m: string) {
  if (m === "romaji-to-kana") return "Romaji → Kana";
  if (m === "writing") return "Writing";
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-purple-800">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-gray-600">Loading practice…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-lg border-gray-300"
            aria-label="Back to menu"
            onClick={() => navigate("/menu")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-gray-800 sm:text-2xl">
              {payload.setLabel}
            </h1>
            <p className="text-sm text-gray-600">{modeLabel(mode)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-8">
            {mode === "writing" ? (
              <WritingPracticeMode
                row={row}
                onAppendHistory={appendHistory}
                onAdvance={advance}
              />
            ) : mode === "romaji-to-kana" ? (
              <RomajiToKanaMode
                row={row}
                onRoundComplete={finishReadingRound}
              />
            ) : (
              <KanaToRomajiMode
                row={row}
                onRoundComplete={finishReadingRound}
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
