import { useCallback, useEffect, useRef, useState } from "react";
import type { KanaRow } from "@/api/types";
import {
  PracticeButton,
  PracticeFeedback,
  PracticeHints,
  PracticePromptCard,
  PracticeRomajiGlyph,
} from "@/components/practice/PracticeUI";
import { useColorMode } from "@/context/ColorModeContext";
import { cn } from "@/lib/utils";
import type { HistoryEntry } from "./types";

/** Logical drawing size in CSS pixels — wider than kana canvas since words are multi-char. */
const CANVAS_LOGICAL_W = 520;
const CANVAS_LOGICAL_H = 300;
/** Higher = sharper strokes on HiDPI (cost: more pixels / GPU). */
const DPR_CAP = 3;

function readPracticeTextCss(): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue("--practice-text")
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
    const stroke = readPracticeTextCss();
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

  const selfGrade = useCallback((ok: boolean) => {
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
  }, []);

  const toggleHint = useCallback(() => setShowHint((v) => !v), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      )
        return;
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

  const hasMeaning =
    typeof row.meaning === "string" && row.meaning.length > 0;

  return (
    <>
      <PracticePromptCard minHeight={180}>
        <PracticeRomajiGlyph size={40}>
          {row.romaji.toUpperCase()}
        </PracticeRomajiGlyph>
        {hasMeaning && (
          <p
            className="practice-ui mt-3 text-center"
            style={{
              color: "var(--practice-text-secondary)",
              fontSize: 14,
            }}
          >
            {row.meaning}
          </p>
        )}
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
        <div className="relative w-full overflow-x-auto">
          <canvas
            ref={bindCanvas}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={cn("mx-auto block touch-none cursor-crosshair")}
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
              className="practice-kana pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{
                fontSize: "clamp(80px, 18vw, 160px)",
                color: "var(--practice-text-tertiary)",
                opacity: 0.28,
                lineHeight: 1,
                letterSpacing: "0.05em",
              }}
            >
              {row.char}
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
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg"
            style={{
              background: `linear-gradient(to right, var(--practice-accent) 0%, var(--practice-accent) ${((lineWidth - 1) / 19) * 100}%, var(--practice-stroke) ${((lineWidth - 1) / 19) * 100}%, var(--practice-stroke) 100%)`,
              accentColor: "var(--practice-accent)",
            }}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <PracticeButton onClick={() => selfGrade(true)}>Got it</PracticeButton>
          <PracticeButton variant="ghost" onClick={() => selfGrade(false)}>
            Missed
          </PracticeButton>
          <PracticeButton variant="ghost" onClick={clearCanvas}>
            Clear
          </PracticeButton>
          <PracticeButton variant="ghost" onClick={toggleHint}>
            {showHint ? "Hide hint" : "Show hint"}
          </PracticeButton>
        </div>
      </div>

      {feedback && <PracticeFeedback kind={feedback} />}

      <PracticeHints
        hints={[
          { key: "Y", label: "got it" },
          { key: "N", label: "missed" },
          { key: "Space", label: "hint" },
        ]}
      />
    </>
  );
}
