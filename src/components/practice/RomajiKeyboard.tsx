import { useEffect, useRef, useState } from "react";
import { Delete } from "lucide-react";

/**
 * On-screen romaji keyboard (QWERTY). Layout and sizing live in `index.css`
 * under `.practice-keyboard`.
 */

const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

/** Letters that never appear in Hepburn romaji answers. */
const UNUSED_ROMAJI_KEYS = new Set(["q", "l", "x", "v"]);

const BACKSPACE_REPEAT_DELAY_MS = 400;
const BACKSPACE_REPEAT_INTERVAL_MS = 60;
const PHYSICAL_PRESS_FLASH_MS = 120;

export function RomajiKeyboard({
  onKey,
  onBackspace,
  disabledKeys = UNUSED_ROMAJI_KEYS,
  showSpace = false,
}: {
  onKey: (letter: string) => void;
  onBackspace: () => void;
  disabledKeys?: ReadonlySet<string>;
  /** Multi-word answers (e.g. "gomen nasai") need a space bar. */
  showSpace?: boolean;
}) {
  const [flashed, setFlashed] = useState<string | null>(null);
  const onBackspaceRef = useRef(onBackspace);
  onBackspaceRef.current = onBackspace;
  const repeatTimers = useRef<{ delay?: number; interval?: number }>({});

  // Mirror physical keypresses on the on-screen keys.
  useEffect(() => {
    let timer: number | undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key =
        e.key === "Backspace" ? "backspace" : e.key.length === 1 ? e.key.toLowerCase() : null;
      if (!key) return;
      setFlashed(key);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setFlashed(null), PHYSICAL_PRESS_FLASH_MS);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, []);

  const stopRepeat = () => {
    window.clearTimeout(repeatTimers.current.delay);
    window.clearInterval(repeatTimers.current.interval);
    repeatTimers.current = {};
  };

  useEffect(() => stopRepeat, []);

  const startRepeat = () => {
    stopRepeat();
    onBackspaceRef.current();
    repeatTimers.current.delay = window.setTimeout(() => {
      repeatTimers.current.interval = window.setInterval(
        () => onBackspaceRef.current(),
        BACKSPACE_REPEAT_INTERVAL_MS
      );
    }, BACKSPACE_REPEAT_DELAY_MS);
  };

  return (
    <div className="practice-keyboard" role="group" aria-label="On-screen keyboard">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="practice-keyboard-row">
          {row.map((letter) => (
            <button
              key={letter}
              type="button"
              tabIndex={-1}
              className="practice-key"
              disabled={disabledKeys.has(letter)}
              data-pressed={flashed === letter}
              aria-label={letter}
              // Keep focus (and the caret) in the answer field.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onKey(letter)}
            >
              {letter}
            </button>
          ))}
          {rowIndex === KEYBOARD_ROWS.length - 1 && (
            <button
              type="button"
              tabIndex={-1}
              className="practice-key practice-key--wide"
              data-pressed={flashed === "backspace"}
              aria-label="Backspace"
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                startRepeat();
              }}
              onPointerUp={stopRepeat}
              onPointerCancel={stopRepeat}
              onLostPointerCapture={stopRepeat}
              onContextMenu={(e) => e.preventDefault()}
              onClick={(e) => {
                // Pointer presses are handled above; this covers keyboard activation.
                if (e.detail === 0) onBackspace();
              }}
            >
              <Delete className="h-[1.15em] w-[1.15em]" aria-hidden />
            </button>
          )}
        </div>
      ))}
      {showSpace && (
        <div className="practice-keyboard-row">
          <button
            type="button"
            tabIndex={-1}
            className="practice-key practice-key--space"
            data-pressed={flashed === " "}
            aria-label="Space"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onKey(" ")}
          >
            space
          </button>
        </div>
      )}
    </div>
  );
}
