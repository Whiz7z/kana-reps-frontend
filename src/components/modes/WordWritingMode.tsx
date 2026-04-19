import { useCallback, useEffect, useRef, useState } from "react";
import type { KanaRow } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { useColorMode } from "@/context/ColorModeContext";
import { cn } from "@/lib/utils";
import type { HistoryEntry } from "./types";

/** Logical drawing size in CSS pixels — wider than kana canvas since words are multi-char. */
const CANVAS_LOGICAL_W = 520;
const CANVAS_LOGICAL_H = 300;
/** Higher = sharper strokes on HiDPI (cost: more pixels / GPU). */
const DPR_CAP = 3;

function readWritingStrokeCss(): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue("--color-writing-stroke")
    .trim();
}

function applyCanvasResolution(canvas: HTMLCanvasElement): void {
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  canvas.width = Math.round(CANVAS_LOGICAL_W * dpr);
  canvas.height = Math.round(CANVAS_LOGICAL_H * dpr);
  canvas.style.width = `${CANVAS_LOGICAL_W}px`;
  canvas.style.height = `${CANVAS_LOGICAL_H}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }
}

type Props = {
  row: KanaRow;
  onAppendHistory: (entry: HistoryEntry) => void;
  onAdvance: () => void;
};

export function WordWritingMode({ row, onAppendHistory, onAdvance }: Props) {
  const { mode } = useColorMode();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);

  const [lineWidth, setLineWidth] = useState(5);
  const lineWidthRef = useRef(lineWidth);
  lineWidthRef.current = lineWidth;

  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "">("");

  const onAppendHistoryRef = useRef(onAppendHistory);
  onAppendHistoryRef.current = onAppendHistory;
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;
  const rowRef = useRef(row);
  rowRef.current = row;

  const applyStroke = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const stroke = readWritingStrokeCss();
    if (stroke) ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidthRef.current;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, []);

  const bindCanvas = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      canvasRef.current = canvas;
      if (!canvas) return;
      applyCanvasResolution(canvas);
      applyStroke();
    },
    [applyStroke]
  );

  useEffect(() => {
    applyStroke();
  }, [mode, lineWidth, applyStroke]);

  useEffect(() => {
    clearCanvas();
    setShowHint(false);
    setFeedback("");
  }, [row.char, row.romaji, clearCanvas]);

  function getCanvasPoint(
    canvas: HTMLCanvasElement,
    e: React.PointerEvent<HTMLCanvasElement>
  ) {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * CANVAS_LOGICAL_W) / rect.width;
    const y = ((e.clientY - rect.top) * CANVAS_LOGICAL_H) / rect.height;
    return { x, y };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const pt = getCanvasPoint(canvas, e);
    lastPtRef.current = pt;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    applyStroke();
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.lineTo(pt.x + 0.01, pt.y + 0.01);
    ctx.stroke();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pt = getCanvasPoint(canvas, e);
    const last = lastPtRef.current ?? pt;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPtRef.current = pt;
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    drawingRef.current = false;
    lastPtRef.current = null;
  }

  const selfGrade = useCallback(
    (ok: boolean) => {
      const current = rowRef.current;
      onAppendHistoryRef.current({
        prompt: current.romaji,
        answer: current.char,
        ok,
        meaning: current.meaning,
      });
      setFeedback(ok ? "correct" : "incorrect");
      window.setTimeout(() => {
        setFeedback("");
        onAdvanceRef.current();
      }, 600);
    },
    []
  );

  const toggleHint = useCallback(() => setShowHint((v) => !v), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.code === "Space") {
        e.preventDefault();
        toggleHint();
        return;
      }
      if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        selfGrade(true);
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        selfGrade(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selfGrade, toggleHint]);

  const hasMeaning = typeof row.meaning === "string" && row.meaning.length > 0;

  return (
    <div className="flex justify-center py-2">
      <div className="flex w-full max-w-2xl flex-col items-center gap-4 px-2 sm:px-4">
        <div className="flex flex-col items-center gap-1">
          <div className="kana-practice-script text-4xl tracking-tight text-[var(--color-foreground)] sm:text-5xl md:text-6xl">
            {row.romaji.toUpperCase()}
          </div>
          {hasMeaning && (
            <p className="text-base text-slate-600 dark:text-slate-300 md:text-lg">
              {row.meaning}
            </p>
          )}
        </div>

        <div className="w-full rounded-3xl bg-[var(--color-writing-panel-bg)] p-4 shadow-inner sm:p-6">
          <div className="relative mx-auto w-fit max-w-full">
            <canvas
              ref={bindCanvas}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className={cn(
                "touch-none rounded-2xl border border-[var(--color-writing-canvas-border)] bg-[var(--color-writing-canvas-bg)] cursor-crosshair"
              )}
              style={{ maxWidth: "100%", height: "auto" }}
            />
            {showHint && (
              <div
                className="kana-practice-script pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"
                style={{
                  fontSize: "clamp(80px, 18vw, 160px)",
                  color: "var(--color-writing-hint)",
                  lineHeight: 1,
                  letterSpacing: "0.05em",
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
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg accent-[var(--color-primary)]"
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
            <Button onClick={() => selfGrade(true)} className="min-w-[6rem]">
              Got it
            </Button>
            <Button
              variant="secondary"
              onClick={() => selfGrade(false)}
              className="min-w-[6rem]"
            >
              Missed
            </Button>
            <Button variant="outline" onClick={clearCanvas}>
              Clear
            </Button>
            <Button variant="outline" onClick={toggleHint}>
              {showHint ? "Hide hint" : "Show hint"}
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
            {feedback === "correct" ? "✓ Got it!" : "✗ Missed"}
          </p>
        )}

        <p className="text-center text-sm text-[var(--color-muted)]">
          Trace the word above, then self-grade.{" "}
          <kbd className="rounded border border-indigo-200 bg-white px-1.5 py-0.5 font-mono text-xs text-indigo-800">
            Y
          </kbd>{" "}
          got it ·{" "}
          <kbd className="rounded border border-indigo-200 bg-white px-1.5 py-0.5 font-mono text-xs text-indigo-800">
            N
          </kbd>{" "}
          missed ·{" "}
          <kbd className="rounded border border-indigo-200 bg-white px-1.5 py-0.5 font-mono text-xs text-indigo-800">
            Space
          </kbd>{" "}
          hint
        </p>
      </div>
    </div>
  );
}
