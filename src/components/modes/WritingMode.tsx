import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type WritingQuestion = {
  romaji: string;
  char: string;
  kana_type: string;
};

type Props = {
  currentQuestion: WritingQuestion | null;
  feedback: "correct" | "incorrect" | "";
  recognizing: boolean;
  drawingDisabled: boolean;
  onRecognize: () => void;
  onClear: () => void;
  onReveal: () => void;
  onResult: (recognizedChar: string) => void;
};

export function WritingMode({
  currentQuestion,
  feedback,
  recognizing,
  drawingDisabled,
  onRecognize,
  onClear,
  onReveal,
  onResult,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hwRef = useRef<{
    erase: () => void;
    setLineWidth: (n: number) => void;
    recognize: () => void;
  } | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const [showHint, setShowHint] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);

  const bindCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
    if (!canvas) {
      hwRef.current = null;
      return;
    }
    if (!window.handwriting?.Canvas || hwRef.current) return;

    const hw = new window.handwriting.Canvas(canvas, 5);
    hw.setOptions({
      language: "ja",
      width: canvas.width,
      height: canvas.height,
      numOfReturn: 10,
    });
    hw.setCallBack((results, err) => {
      if (err) {
        console.error(err);
        onResultRef.current("");
        return;
      }
      if (results?.length) onResultRef.current(results[0]);
      else onResultRef.current("");
    });
    hwRef.current = hw;
  }, []);

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
  }, [currentQuestion?.romaji]);

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
    onRecognize();
  };

  const handleClear = () => {
    hwRef.current?.erase();
    setShowHint(false);
    onClear();
  };

  const handleReveal = () => {
    setShowHint((v) => !v);
    onReveal();
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 px-2 sm:px-4">
      <div className="kana-practice-script text-6xl tracking-tight text-slate-800 sm:text-7xl md:text-8xl">
        {currentQuestion?.romaji.toUpperCase()}
      </div>

      <div className="w-full rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50/90 p-4 shadow-inner sm:p-6">
        <div className="relative mx-auto w-fit max-w-full">
          <canvas
            ref={bindCanvas}
            width={300}
            height={300}
            className={cn(
              "touch-none rounded-2xl border border-slate-200 bg-white",
              drawingDisabled ? "cursor-not-allowed opacity-60" : "cursor-crosshair"
            )}
            style={{ maxWidth: "100%", height: "auto" }}
          />
          {showHint && currentQuestion && (
            <div
              className="kana-practice-script pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"
              style={{
                fontSize: "clamp(120px, 42vw, 220px)",
                color: "#444",
                lineHeight: 1,
              }}
            >
              {currentQuestion.char}
            </div>
          )}
        </div>

        <div className="mx-auto mt-4 flex w-full max-w-xs flex-col gap-2">
          <label className="text-center text-sm text-slate-600">
            Line width: {lineWidth}px
          </label>
          <input
            type="range"
            min={1}
            max={20}
            value={lineWidth}
            disabled={drawingDisabled}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg accent-indigo-600 disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, rgb(79, 70, 229) 0%, rgb(79, 70, 229) ${((lineWidth - 1) / 19) * 100}%, rgb(226, 232, 240) ${((lineWidth - 1) / 19) * 100}%, rgb(226, 232, 240) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Thin</span>
            <span>Thick</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button
            className="min-w-[6rem] bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700"
            disabled={recognizing || feedback !== "" || drawingDisabled}
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
            feedback === "correct" ? "text-emerald-600" : "text-red-600"
          )}
        >
          {feedback === "correct" ? "✓ Correct!" : "✗ Try again"}
        </p>
      )}

      <p className="text-center text-sm text-slate-600">
        Draw the kana character and click &quot;Check&quot; to verify.
      </p>
    </div>
  );
}
