import { useCallback, useEffect, useRef, useState } from "react";
import type { KanaRow } from "@/api/types";
import { reportKanaGuess } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useColorMode } from "@/context/ColorModeContext";
import { cn } from "@/lib/utils";
import type { HistoryEntry } from "./types";

type HandwritingInstance = {
  cxt: CanvasRenderingContext2D;
};

/** Logical drawing size in CSS pixels (trace + recognition use this space). */
const WRITING_CANVAS_LOGICAL_PX = 300;
/** Higher = sharper strokes on HiDPI (cost: more pixels / GPU). */
const WRITING_DPR_CAP = 3;

function readWritingStrokeCss(): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue("--color-writing-stroke")
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
    const stroke = readWritingStrokeCss();
    const cxt = (hw as unknown as HandwritingInstance).cxt;
    if (stroke && cxt) cxt.strokeStyle = stroke;
  }, []);

  useEffect(() => {
    const stroke = readWritingStrokeCss();
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
  }, [row.romaji]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (drawingDisabled) {
      canvas.style.pointerEvents = "none";
      canvas.style.cursor = "not-allowed";
      canvas.style.opacity = "0.6";
    } else {
      canvas.style.pointerEvents = "auto";
      canvas.style.cursor = "crosshair";
      canvas.style.opacity = "1";
    }
  }, [drawingDisabled]);

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
    <div className="flex justify-center py-2">
      <div className="flex w-full max-w-md flex-col items-center gap-4 px-2 sm:px-4">
        <div className="kana-practice-script text-6xl tracking-tight text-[var(--color-foreground)] sm:text-7xl md:text-8xl">
          {row.romaji.toUpperCase()}
        </div>

        <div className="w-full rounded-3xl bg-[var(--color-writing-panel-bg)] p-4 shadow-inner sm:p-6">
          <div className="relative mx-auto w-fit max-w-full">
            <canvas
              ref={bindCanvas}
              className={cn(
                "touch-none rounded-2xl border border-[var(--color-writing-canvas-border)] bg-[var(--color-writing-canvas-bg)]",
                drawingDisabled ? "cursor-not-allowed opacity-60" : "cursor-crosshair"
              )}
              style={{ maxWidth: "100%", height: "auto" }}
            />
            {showHint && (
              <div
                className="kana-practice-script pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"
                style={{
                  fontSize: "clamp(120px, 42vw, 220px)",
                  color: "var(--color-writing-hint)",
                  lineHeight: 1,
                }}
              >
                {row.char}
              </div>
            )}
          </div>

          <div className="mx-auto mt-4 flex w-full max-w-xs flex-col gap-2">
            <label className="text-center text-sm text-[var(--color-muted)]">
              Line width: {lineWidth}px
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={lineWidth}
              disabled={drawingDisabled}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg accent-[var(--color-primary)] disabled:opacity-50"
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((lineWidth - 1) / 19) * 100}%, var(--color-range-track-rest) ${((lineWidth - 1) / 19) * 100}%, var(--color-range-track-rest) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-[var(--color-muted)]">
              <span>Thin</span>
              <span>Thick</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              className="min-w-[6rem]"
              disabled={drawingDisabled}
              onClick={handleRecognize}
            >
              {recognizing ? "Recognizing…" : "Check"}
            </Button>
            <Button
              variant="outline"
              disabled={recognizing}
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button variant="outline" onClick={handleReveal}>
              {showHint ? "Hide hint" : "Reveal answer"}
            </Button>
          </div>
        </div>

        {feedback && (
          <p
            className={cn(
              "text-center text-lg font-semibold",
              feedback === "correct"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {feedback === "correct" ? "✓ Correct!" : "✗ Try again"}
          </p>
        )}

        <p className="text-center text-sm text-[var(--color-muted)]">
          Draw the kana character and click &quot;Check&quot; to verify.
        </p>
      </div>
    </div>
  );
}
