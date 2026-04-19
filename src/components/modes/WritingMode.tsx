import { useCallback, useEffect, useRef, useState } from "react";
import type { KanaRow } from "@/api/types";
import { reportKanaGuess } from "@/api/client";
import { KanaStrokeHint } from "@/components/practice/KanaStrokeHint";
import {
  PracticeButton,
  PracticeFeedback,
  PracticeHints,
  PracticePromptCard,
  PracticeRomajiGlyph,
} from "@/components/practice/PracticeUI";
import { useAuth } from "@/context/AuthContext";
import { useColorMode } from "@/context/ColorModeContext";
import { loadKanaStrokeHintData, type KanaStrokeHintPayload } from "@/lib/kanaStrokeData";
import { cn } from "@/lib/utils";
import type { HistoryEntry } from "./types";

type HandwritingInstance = {
  cxt: CanvasRenderingContext2D;
};

/** Logical drawing size in CSS pixels (trace + recognition use this space). */
const WRITING_CANVAS_LOGICAL_PX = 300;
/** Higher = sharper strokes on HiDPI (cost: more pixels / GPU). */
const WRITING_DPR_CAP = 3;

function readPracticeTextCss(): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue("--practice-text")
    .trim();
}

function applyWritingCanvasResolution(canvas: HTMLCanvasElement): void {
  const dpr = Math.min(window.devicePixelRatio || 1, WRITING_DPR_CAP);
  const w = Math.round(WRITING_CANVAS_LOGICAL_PX * dpr);
  const h = Math.round(WRITING_CANVAS_LOGICAL_PX * dpr);
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${WRITING_CANVAS_LOGICAL_PX}px`;
  canvas.style.height = `${WRITING_CANVAS_LOGICAL_PX}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
  }
}

type Props = {
  row: KanaRow;
  onAppendHistory: (entry: HistoryEntry) => void;
  onAdvance: () => void;
};

export function WritingMode({ row, onAppendHistory, onAdvance }: Props) {
  const { mode } = useColorMode();
  const { user } = useAuth();

  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "">("");
  const [recognizing, setRecognizing] = useState(false);

  const rowRef = useRef(row);
  rowRef.current = row;
  const onAppendHistoryRef = useRef(onAppendHistory);
  onAppendHistoryRef.current = onAppendHistory;
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;
  const userRef = useRef(user);
  userRef.current = user;

  const drawingDisabled = recognizing || feedback !== "";

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hwRef = useRef<{
    erase: () => void;
    setLineWidth: (n: number) => void;
    recognize: () => void;
  } | null>(null);

  const [showHint, setShowHint] = useState(false);
  const [hintPayload, setHintPayload] = useState<KanaStrokeHintPayload | null>(null);
  const [lineWidth, setLineWidth] = useState(5);
  const lineWidthRef = useRef(lineWidth);
  lineWidthRef.current = lineWidth;

  useEffect(() => {
    setFeedback("");
    setRecognizing(false);
  }, [row.char, row.romaji]);

  const bindCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
    if (!canvas) {
      hwRef.current = null;
      return;
    }
    if (!window.handwriting?.Canvas || hwRef.current) return;

    applyWritingCanvasResolution(canvas);

    const hw = new window.handwriting.Canvas(canvas, lineWidthRef.current);
    hw.setOptions({
      language: "ja",
      width: WRITING_CANVAS_LOGICAL_PX,
      height: WRITING_CANVAS_LOGICAL_PX,
      numOfReturn: 10,
    });
    hw.setCallBack((results, err) => {
      setRecognizing(false);
      if (err) {
        console.error(err);
        reportKanaGuess(rowRef.current, false, Boolean(userRef.current));
        setFeedback("incorrect");
        window.setTimeout(() => setFeedback(""), 1200);
        return;
      }
      const recognizedChar = results?.length ? results[0] : "";
      if (!recognizedChar) {
        reportKanaGuess(rowRef.current, false, Boolean(userRef.current));
        setFeedback("incorrect");
        window.setTimeout(() => setFeedback(""), 1200);
        return;
      }
      const ok = recognizedChar === rowRef.current.char;
      reportKanaGuess(rowRef.current, ok, Boolean(userRef.current));
      setFeedback(ok ? "correct" : "incorrect");
      onAppendHistoryRef.current({
        prompt: rowRef.current.romaji,
        answer: recognizedChar,
        ok,
      });
      if (ok) {
        window.setTimeout(() => onAdvanceRef.current(), 800);
      } else {
        window.setTimeout(() => setFeedback(""), 1200);
      }
    });
    hwRef.current = hw;
    const stroke = readPracticeTextCss();
    const cxt = (hw as unknown as HandwritingInstance).cxt;
    if (stroke && cxt) cxt.strokeStyle = stroke;
  }, []);

  useEffect(() => {
    const stroke = readPracticeTextCss();
    const hw = hwRef.current as unknown as HandwritingInstance | null;
    if (stroke && hw?.cxt) hw.cxt.strokeStyle = stroke;
  }, [mode]);

  useEffect(() => {
    let tries = 0;
    const id = window.setInterval(() => {
      tries++;
      const c = canvasRef.current;
      if (c && !hwRef.current && window.handwriting?.Canvas) {
        bindCanvas(c);
      }
      if (hwRef.current || tries > 80) {
        window.clearInterval(id);
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [bindCanvas]);

  useEffect(() => {
    const hw = hwRef.current;
    const canvas = canvasRef.current;
    if (!hw || !canvas) return;
    hw.setLineWidth(lineWidth);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.lineWidth = lineWidth;
  }, [lineWidth]);

  useEffect(() => {
    hwRef.current?.erase();
    setShowHint(false);
  }, [row.romaji, row.char]);

  useEffect(() => {
    if (!showHint) {
      setHintPayload(null);
      return;
    }
    let cancelled = false;
    setHintPayload(null);
    void (async () => {
      const data = await loadKanaStrokeHintData(row.char, row.kana_type);
      if (!cancelled) setHintPayload(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [showHint, row.char, row.kana_type]);

  const handleRecognize = () => {
    hwRef.current?.recognize();
    setRecognizing(true);
  };

  const handleClear = () => {
    hwRef.current?.erase();
    setShowHint(false);
    setFeedback("");
  };

  const handleReveal = () => {
    setShowHint((v) => !v);
  };

  return (
    <>
      <PracticePromptCard minHeight={200}>
        <PracticeRomajiGlyph size={44}>
          {row.romaji.toUpperCase()}
        </PracticeRomajiGlyph>
      </PracticePromptCard>

      <div
        className="flex flex-col items-center gap-4"
        style={{
          background: "var(--practice-surface)",
          border: "1px solid var(--practice-stroke-subtle)",
          borderRadius: "var(--practice-radius-lg)",
          padding: 16,
        }}
      >
        <div className="relative">
          <canvas
            ref={bindCanvas}
            className={cn(
              "touch-none",
              drawingDisabled ? "cursor-not-allowed opacity-60" : "cursor-crosshair"
            )}
            style={{
              maxWidth: "100%",
              height: "auto",
              background: "var(--practice-surface-elev)",
              border: "1px solid var(--practice-stroke)",
              borderRadius: "var(--practice-radius)",
            }}
          />
          {showHint && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{ borderRadius: "var(--practice-radius)" }}
            >
              {hintPayload ? (
                <div className="box-border h-full min-h-0 w-full px-0.5 py-0.5">
                  <KanaStrokeHint payload={hintPayload} />
                </div>
              ) : (
                <div
                  className="practice-kana flex max-h-full max-w-full items-center justify-center gap-1 px-1"
                  style={{
                    fontSize:
                      [...row.char].length <= 1
                        ? "clamp(120px, 42vw, 220px)"
                        : [...row.char].length === 2
                          ? "clamp(48px, 14vmin, 100px)"
                          : "clamp(32px, 10vmin, 72px)",
                    color: "var(--practice-text-tertiary)",
                    opacity: 0.28,
                    lineHeight: 1,
                  }}
                >
                  {[...row.char].map((ch, i) => (
                    <span key={`${ch}-${i}`}>{ch}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2">
          <label
            className="practice-ui text-center text-xs"
            style={{ color: "var(--practice-text-tertiary)" }}
          >
            Line width: {lineWidth}px
          </label>
          <input
            type="range"
            min={1}
            max={20}
            value={lineWidth}
            disabled={drawingDisabled}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, var(--practice-accent) 0%, var(--practice-accent) ${((lineWidth - 1) / 19) * 100}%, var(--practice-stroke) ${((lineWidth - 1) / 19) * 100}%, var(--practice-stroke) 100%)`,
              accentColor: "var(--practice-accent)",
            }}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <PracticeButton disabled={drawingDisabled} onClick={handleRecognize}>
            {recognizing ? "Recognizing…" : "Check"}
          </PracticeButton>
          <PracticeButton variant="ghost" disabled={recognizing} onClick={handleClear}>
            Clear
          </PracticeButton>
          <PracticeButton variant="ghost" onClick={handleReveal}>
            {showHint ? "Hide hint" : "Reveal"}
          </PracticeButton>
        </div>
      </div>

      {feedback && <PracticeFeedback kind={feedback} />}

      <PracticeHints
        hints={[
          { key: "Enter", label: "check" },
          { key: "Space", label: "hint" },
        ]}
      />
    </>
  );
}
