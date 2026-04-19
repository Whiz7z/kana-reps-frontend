import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactNode,
} from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared UI primitives for the practice screen.
 *
 * Styling is driven by the `--practice-*` custom properties declared in
 * `src/index.css` — light mode renders the Washi palette, dark mode renders
 * the Modern Dark palette. Radii are kept small in both themes (Washi
 * sizing) per the design brief.
 */

// ---------------------------------------------------------------------------
// Root — paints the practice background and sets the UI font.
// ---------------------------------------------------------------------------

export function PracticeRoot({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "practice-root mx-auto w-full max-w-2xl overflow-hidden",
        className
      )}
      style={{
        borderRadius: "var(--practice-radius-lg)",
        border: "1px solid var(--practice-stroke)",
      }}
    >
      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-6">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header — back button + title/subtitle + progress chip.
// ---------------------------------------------------------------------------

export function PracticeHeader({
  title,
  subtitle,
  step,
  total,
  onBack,
}: {
  title: string;
  subtitle: string;
  step: number;
  total: number;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center transition hover:opacity-80"
        style={{
          borderRadius: "var(--practice-radius)",
          border: "1px solid var(--practice-stroke)",
          background: "var(--practice-surface)",
          color: "var(--practice-text-secondary)",
        }}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <div
          className="truncate text-[15px] font-semibold"
          style={{ color: "var(--practice-text)" }}
        >
          {title}
        </div>
        <div
          className="truncate text-xs"
          style={{ color: "var(--practice-text-secondary)", marginTop: 2 }}
        >
          {subtitle}
        </div>
      </div>

      <PracticeChip>
        {step} / {total}
      </PracticeChip>
    </div>
  );
}

export function PracticeChip({ children }: { children: ReactNode }) {
  return (
    <span
      className="shrink-0 whitespace-nowrap"
      style={{
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.2,
        color: "var(--practice-accent)",
        background: "var(--practice-accent-soft)",
        border: "1px solid color-mix(in srgb, var(--practice-accent) 35%, transparent)",
        borderRadius: 999,
        padding: "4px 10px",
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Prompt card — the hero area that holds the kana/romaji/canvas.
// ---------------------------------------------------------------------------

export function PracticePromptCard({
  children,
  minHeight = 160,
  showAccentMark = true,
}: {
  children: ReactNode;
  minHeight?: number;
  showAccentMark?: boolean;
}) {
  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{
        background: "var(--practice-surface-elev)",
        border: "1px solid var(--practice-stroke-subtle)",
        borderRadius: "var(--practice-radius-lg)",
        padding: "28px 20px",
        minHeight,
      }}
    >
      {showAccentMark && <PromptAccentMark />}
      {children}
    </div>
  );
}

/**
 * Renders a subtle accent in the card corner. Washi theme gets a vermillion
 * 印 seal; Modern Dark gets a small violet dot. Detected via the
 * `.dark` ancestor class.
 */
function PromptAccentMark() {
  return (
    <>
      <span
        aria-hidden
        className="absolute block dark:hidden"
        style={{
          top: 12,
          right: 12,
          width: 24,
          height: 24,
          background: "var(--practice-accent)",
          color: "var(--practice-accent-ink)",
          fontFamily: "var(--practice-kana-font)",
          fontSize: 13,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 3,
        }}
      >
        印
      </span>
      <span
        aria-hidden
        className="absolute hidden dark:block"
        style={{
          top: 14,
          right: 14,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--practice-accent)",
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Kana glyph / romaji prompt helpers.
// ---------------------------------------------------------------------------

export function PracticeKanaGlyph({
  children,
  size = 96,
}: {
  children: ReactNode;
  size?: number;
}) {
  return (
    <div
      className="practice-kana text-center leading-none"
      style={{
        color: "var(--practice-text)",
        fontSize: size,
      }}
    >
      {children}
    </div>
  );
}

export function PracticeRomajiGlyph({
  children,
  size = 56,
}: {
  children: ReactNode;
  size?: number;
}) {
  return (
    <div
      className="practice-ui text-center uppercase tracking-wide"
      style={{
        color: "var(--practice-text)",
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "0.04em",
        lineHeight: 1,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Text input with inline submit button (Washi / Dark aware).
// ---------------------------------------------------------------------------

type PracticeTextInputProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  onSpecialKey?: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  submitLabel?: string;
  autoFocus?: boolean;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
};

export function PracticeTextInput({
  value,
  onChange,
  onSubmit,
  onSpecialKey,
  placeholder = "Type romaji…",
  submitLabel = "Check",
  autoFocus = true,
  inputProps,
}: PracticeTextInputProps) {
  return (
    <div
      className="flex items-center gap-2"
      style={{
        background: "var(--practice-surface)",
        border: "1px solid var(--practice-stroke)",
        borderRadius: "var(--practice-radius)",
        padding: "8px 8px 8px 16px",
      }}
    >
      <input
        {...inputProps}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
            return;
          }
          onSpecialKey?.(e);
        }}
        placeholder={placeholder}
        className="practice-ui flex-1 bg-transparent outline-none"
        style={{
          color: "var(--practice-text)",
          fontSize: 16,
          padding: "6px 0",
        }}
      />
      <PracticeButton onClick={onSubmit}>{submitLabel}</PracticeButton>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buttons.
// ---------------------------------------------------------------------------

type Variant = "primary" | "ghost" | "danger";

type PracticeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function PracticeButton({
  variant = "primary",
  className,
  children,
  ...props
}: PracticeButtonProps) {
  const styles = getButtonStyle(variant);
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "practice-ui inline-flex items-center justify-center whitespace-nowrap font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      style={{
        ...styles,
        fontSize: 13,
        padding: "8px 16px",
        borderRadius: "var(--practice-radius)",
      }}
    >
      {children}
    </button>
  );
}

function getButtonStyle(variant: Variant) {
  if (variant === "primary") {
    return {
      background: "var(--practice-accent)",
      color: "var(--practice-accent-ink)",
      border: "1px solid var(--practice-accent)",
    };
  }
  if (variant === "danger") {
    return {
      background: "transparent",
      color: "var(--practice-danger)",
      border: "1px solid color-mix(in srgb, var(--practice-danger) 40%, transparent)",
    };
  }
  return {
    background: "var(--practice-surface)",
    color: "var(--practice-text-secondary)",
    border: "1px solid var(--practice-stroke)",
  };
}

// ---------------------------------------------------------------------------
// Keyboard hint row.
// ---------------------------------------------------------------------------

export type KeyHint = {
  key: ReactNode;
  label: ReactNode;
};

export function PracticeHints({ hints }: { hints: KeyHint[] }) {
  return (
    <div
      className="practice-ui flex flex-wrap items-center gap-x-3 gap-y-2 text-xs"
      style={{ color: "var(--practice-text-tertiary)" }}
    >
      {hints.map((h, i) => (
        <span key={i} className="inline-flex items-center gap-2">
          <Kbd>{h.key}</Kbd>
          <span>{h.label}</span>
          {i < hints.length - 1 && (
            <span
              aria-hidden
              style={{ color: "var(--practice-stroke-subtle)" }}
            >
              ·
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center"
      style={{
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        background: "var(--practice-surface)",
        border: "1px solid var(--practice-stroke)",
        color: "var(--practice-text-secondary)",
        borderRadius: "var(--practice-radius-sm)",
        padding: "2px 8px",
        fontSize: 11,
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Recent strip — compact list of the last N answers.
// ---------------------------------------------------------------------------

export type RecentItem = {
  prompt: string;
  answer: string;
  ok: boolean;
  meaning?: string;
};

export function PracticeRecent({
  items,
  limit = 3,
  label = "Recent",
}: {
  items: RecentItem[];
  limit?: number;
  label?: string;
}) {
  const display = [...items].reverse().slice(0, limit);
  const hidden = Math.max(0, items.length - limit);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="practice-ui"
        style={{
          color: "var(--practice-text-tertiary)",
          fontSize: 11,
          letterSpacing: 1.1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      {items.length === 0 ? (
        <div
          className="practice-ui"
          style={{
            padding: "14px 12px",
            color: "var(--practice-text-tertiary)",
            fontSize: 13,
            border: "1px dashed var(--practice-stroke-subtle)",
            borderRadius: "var(--practice-radius)",
            textAlign: "center",
          }}
        >
          No questions answered yet
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {display.map((item, i) => (
            <RecentRow key={i} item={item} />
          ))}
          {hidden > 0 && (
            <div
              className="practice-ui"
              style={{
                color: "var(--practice-text-tertiary)",
                fontSize: 12,
                textAlign: "center",
                paddingTop: 4,
              }}
            >
              … and {hidden} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecentRow({ item }: { item: RecentItem }) {
  const tone = item.ok ? "var(--practice-success)" : "var(--practice-danger)";
  return (
    <div
      className="flex items-center gap-3"
      style={{
        background: "var(--practice-surface-elev)",
        border: "1px solid var(--practice-stroke-subtle)",
        borderLeft: `3px solid ${tone}`,
        borderRadius: "var(--practice-radius)",
        padding: "8px 12px",
      }}
    >
      <span
        className="practice-kana shrink-0"
        style={{
          color: "var(--practice-text)",
          fontSize: 18,
          minWidth: 22,
        }}
      >
        {item.prompt}
      </span>
      <span
        className="practice-ui"
        style={{ color: "var(--practice-text-tertiary)" }}
      >
        →
      </span>
      <div className="min-w-0 flex-1">
        <div
          className="practice-ui truncate"
          style={{ color: "var(--practice-text)", fontSize: 13 }}
        >
          {item.answer}
        </div>
        {item.meaning && (
          <div
            className="practice-ui truncate"
            style={{
              color: "var(--practice-text-tertiary)",
              fontSize: 11,
              marginTop: 2,
            }}
          >
            {item.meaning}
          </div>
        )}
      </div>
      <span
        className="practice-ui shrink-0"
        style={{
          color: tone,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {item.ok ? "Correct" : "Missed"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline feedback pill (correct / incorrect).
// ---------------------------------------------------------------------------

export function PracticeFeedback({
  kind,
}: {
  kind: "correct" | "incorrect";
}) {
  const tone =
    kind === "correct"
      ? "var(--practice-success)"
      : "var(--practice-danger)";
  return (
    <div
      className="practice-ui self-center"
      style={{
        color: tone,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 0.5,
        textTransform: "uppercase",
      }}
    >
      {kind === "correct" ? "✓ Correct" : "✗ Try again"}
    </div>
  );
}
