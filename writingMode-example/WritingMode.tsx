// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface WritingModeProps {
  currentQuestion: {
    romaji: string;
    char: string;
    kana_type: string;
  } | null;
  feedback: string;
  recognizing: boolean;
  drawingDisabled: boolean;
  onRecognize: () => void;
  onClear: () => void;
  onReveal: () => void;
  onResult: (recognizedChar: string) => void;
}

export default function WritingMode({
  currentQuestion,
  feedback,
  recognizing,
  drawingDisabled,
  onRecognize,
  onClear,
  onReveal,
  onResult
}: WritingModeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handwritingCanvasRef = useRef<any>(null);
  const hintOverlayRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);

  // Clear canvas and hint when question changes
  useEffect(() => {
    if (handwritingCanvasRef.current && currentQuestion) {
      handwritingCanvasRef.current.erase();
      setShowHint(false);
    }
  }, [currentQuestion?.romaji]);

  useEffect(() => {
    if (!canvasRef.current || !window.handwriting) return;

    // Initialize handwriting canvas
    const canvas = canvasRef.current;
    handwritingCanvasRef.current = new window.handwriting.Canvas(canvas, lineWidth);

    // Set drawing style
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000';
    }

    // Set line width for handwriting canvas
    if (handwritingCanvasRef.current) {
      handwritingCanvasRef.current.setLineWidth(lineWidth);
    }

    // Set options for Japanese kana recognition
    handwritingCanvasRef.current.setOptions({
      language: 'ja',
      width: canvas.width,
      height: canvas.height,
      numOfReturn: 10
    });

    // Set callback for recognition
    handwritingCanvasRef.current.setCallBack((results, err) => {
      if (err) {
        console.error('Recognition error:', err);
        onResult(''); // Pass empty string to indicate error
        return;
      }

      if (results && results.length > 0) {
        // Pass the first result to parent for validation
        const recognizedChar = results[0];
        onResult(recognizedChar);
      } else {
        // No results found
        onResult('');
      }
    });

    return () => {
      if (handwritingCanvasRef.current) {
        handwritingCanvasRef.current.erase();
        handwritingCanvasRef.current = null;
      }
    };
  }, [currentQuestion, onResult, lineWidth]);

  // Update line width when it changes
  useEffect(() => {
    if (canvasRef.current && handwritingCanvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.lineWidth = lineWidth;
      }
      handwritingCanvasRef.current.setLineWidth(lineWidth);
    }
  }, [lineWidth]);

  // Disable/enable drawing based on drawingDisabled prop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (drawingDisabled) {
      // Disable drawing by making canvas non-interactive
      canvas.style.pointerEvents = 'none';
      canvas.style.cursor = 'not-allowed';
      canvas.style.opacity = '0.6';
    } else {
      // Re-enable drawing
      canvas.style.pointerEvents = 'auto';
      canvas.style.cursor = 'crosshair';
      canvas.style.opacity = '1';
    }
  }, [drawingDisabled]);

  const handleRecognize = () => {
    if (handwritingCanvasRef.current) {
      handwritingCanvasRef.current.recognize();
    }
    onRecognize();
  };


  const handleReveal = () => {
    setShowHint(!showHint);
    onReveal();
  };

  const handleClear = () => {
    if (handwritingCanvasRef.current) {
      handwritingCanvasRef.current.erase();
    }
    setShowHint(false);
    onClear();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full px-4">
      {/* Romaji Prompt */}
      <div className="text-6xl font-bold text-gray-800 mb-4">
        {currentQuestion?.romaji.toUpperCase()}
      </div>

      {/* Canvas Container */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className={`border-2 border-gray-300 rounded-lg bg-white touch-none ${
            drawingDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-crosshair'
          }`}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        {/* Hint Overlay */}
        {showHint && currentQuestion && (
          <div
            ref={hintOverlayRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              opacity: 0.3,
              fontSize: '200px',
              fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',
              fontWeight: 'bold',
              color: '#666',
              lineHeight: 1,
            }}
          >
            {currentQuestion.char}
          </div>
        )}
      </div>

      {/* Line Width Slider */}
      <div className="w-full max-w-xs flex flex-col gap-2">
        <label className="text-sm text-gray-600 text-center">
          Line Width: {lineWidth}px
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
          style={{
            background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${((lineWidth - 1) / 19) * 100}%, rgb(229, 231, 235) ${((lineWidth - 1) / 19) * 100}%, rgb(229, 231, 235) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>Thin</span>
          <span>Thick</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 flex-wrap justify-center">
        <Button
          onClick={handleRecognize}
          disabled={recognizing || feedback !== ''}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          {recognizing ? 'Recognizing...' : 'Check'}
        </Button>
        <Button
          onClick={handleClear}
          variant="outline"
          disabled={recognizing}
        >
          Clear
        </Button>
        <Button
          onClick={handleReveal}
          variant="outline"
        >
          {showHint ? 'Hide Hint' : 'Reveal Answer'}
        </Button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-center text-lg font-semibold ${
          feedback === 'correct' ? 'text-green-600' : 'text-red-600'
        }`}>
          {feedback === 'correct' ? (
            '✓ Correct!'
          ) : (
            <>✗ Incorrect. Try again!</>
          )}
        </div>
      )}
    </div>
  );
}
