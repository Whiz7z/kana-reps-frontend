import type {
  ButtonHTMLAttributes,
  CSSProperties,
  MouseEventHandler,
  ReactNode,
} from "react";
import { ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared UI primitives for the Menu screen.
 *
 * These reuse the `--practice-*` CSS custom properties already declared in
 * `src/index.css` so that Practice and Menu render the same Washi-light /
 * Modern-Dark theme with a small 6px radius scale.
 */

// ---------------------------------------------------------------------------
// Outer themed card — matches the "paper" frame from the canvas mock.
// ---------------------------------------------------------------------------

export function MenuRoot({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "practice-root mx-auto w-full max-w-4xl overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-0">{children}</div>
      {/* {children} */}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status row — trial info on the left + primary CTA on the right.
// ---------------------------------------------------------------------------

export function MenuStatusRow({
  status,
  action,
}: {
  status?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div
        className="practice-ui flex min-h-7 items-center text-xs"
        style={{ color: "var(--practice-text-secondary)" }}
      >
        {status}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panels — inner bordered sections that group content.
// ---------------------------------------------------------------------------

export function MenuPanel({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn("relative", className)}
      style={{
        background: "var(--practice-surface)",
        border: "1px solid var(--practice-stroke)",
        borderRadius: "var(--practice-radius)",
        padding: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function MenuSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="practice-ui"
      style={{
        color: "var(--practice-text-tertiary)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mode picker — 2-column grid; the Writing chip can span the full row.
// ---------------------------------------------------------------------------

export function ModePickerGrid({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid gap-2.5"
      style={{ gridTemplateColumns: "1fr 1fr" }}
    >
      {children}
    </div>
  );
}

export function ModeChip({
  active = false,
  locked = false,
  span = 1,
  leading,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  locked?: boolean;
  span?: 1 | 2;
  leading?: ReactNode;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}) {
  const style: CSSProperties = active
    ? {
        background: "var(--practice-accent)",
        color: "var(--practice-accent-ink)",
        border: "1px solid var(--practice-accent)",
      }
    : {
        background: "var(--practice-surface-elev)",
        color: "var(--practice-text-secondary)",
        border: "1px solid var(--practice-stroke)",
      };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "practice-ui inline-flex items-center justify-center gap-2 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
        span === 2 && "col-span-2"
      )}
      style={{
        ...style,
        borderRadius: "var(--practice-radius)",
        padding: "14px 16px",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {locked ? <Lock className="h-3.5 w-3.5" aria-hidden /> : leading}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Set row — icon + title + subtitle + chevron. Used for Custom/Word and for
// the "First 10" / "All" rows inside set cards (via the `minimal` variant).
// ---------------------------------------------------------------------------

export function SetRow({
  icon,
  title,
  subtitle,
  onClick,
  disabled,
  locked,
  minimal = false,
  className,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  locked?: boolean;
  minimal?: boolean;
  className?: string;
}) {
  const padding = minimal ? "12px 14px" : "14px 16px";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "practice-ui flex w-full items-center gap-3 text-left transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        background: "var(--practice-surface-elev)",
        border: "1px solid var(--practice-stroke-subtle)",
        borderRadius: "var(--practice-radius)",
        padding,
      }}
    >
      {(locked || icon) && (
        <span
          className="flex shrink-0 items-center justify-center"
          style={{
            color: locked
              ? "var(--practice-text-tertiary)"
              : "var(--practice-accent)",
            width: 28,
            height: 28,
          }}
        >
          {locked ? <Lock className="h-4 w-4" aria-hidden /> : icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className="block truncate"
          style={{
            color: "var(--practice-text)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            className="mt-0.5 block truncate"
            style={{
              color: "var(--practice-text-secondary)",
              fontSize: 12,
            }}
          >
            {subtitle}
          </span>
        )}
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0"
        aria-hidden
        style={{ color: "var(--practice-text-tertiary)" }}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Level chips — small outlined pills for Basic/Dakuten/Handakuten/Yoon.
// ---------------------------------------------------------------------------

export function LevelChipRow({ children }: { children: ReactNode }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">{children}</div>
  );
}

export function LevelChip({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children: ReactNode;
}) {
  const style: CSSProperties = active
    ? {
        background: "var(--practice-accent-soft)",
        color: "var(--practice-accent)",
        border: "1px solid var(--practice-accent)",
      }
    : {
        background: "transparent",
        color: "var(--practice-text-secondary)",
        border: "1px solid var(--practice-stroke)",
      };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="practice-ui transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        ...style,
        borderRadius: "var(--practice-radius)",
        padding: "5px 11px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Primary CTA — full-width filled accent button.
// ---------------------------------------------------------------------------

type PrimaryCTAProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PrimaryCTA({ className, children, ...props }: PrimaryCTAProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "practice-ui w-full transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      style={{
        background: "var(--practice-accent)",
        color: "var(--practice-accent-ink)",
        borderRadius: "var(--practice-radius)",
        padding: "12px 16px",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 0.2,
      }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Compact / secondary pill button (used for the top-right "Get lifetime" CTA
// where we want a smaller, more restrained sizing than the full-width CTA).
// ---------------------------------------------------------------------------

type PillCTAProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PillCTA({ className, children, ...props }: PillCTAProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "practice-ui inline-flex items-center gap-2 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        background: "var(--practice-accent)",
        color: "var(--practice-accent-ink)",
        borderRadius: "var(--practice-radius)",
        padding: "8px 14px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Set card — the Hiragana / Katakana section with the faded kana watermark.
// ---------------------------------------------------------------------------

export function MenuSetCard({
  label,
  watermark,
  children,
}: {
  label: string;
  watermark: string;
  children: ReactNode;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "var(--practice-surface)",
        border: "1px solid var(--practice-stroke)",
        borderRadius: "var(--practice-radius)",
        padding: 18,
      }}
    >
      <div
        aria-hidden
        className="practice-kana pointer-events-none absolute whitespace-nowrap select-none"
        style={{
          top: -24,
          left: -18,
          fontSize: 180,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: -8,
          color: "var(--practice-accent)",
          opacity: "var(--practice-watermark-opacity, 0.08)",
          transform: "rotate(-8deg)",
        }}
      >
        {watermark}
      </div>
      <div className="relative z-1 flex flex-col gap-2.5">
        <MenuSectionLabel>{label}</MenuSectionLabel>
        {children}
      </div>
    </div>
  );
}
