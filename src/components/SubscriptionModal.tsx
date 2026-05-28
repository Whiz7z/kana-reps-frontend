import { useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import { X } from "lucide-react";

export type SubscriptionFeature = "writing" | "word_practice";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  feature?: SubscriptionFeature;
};

const COPY: Record<SubscriptionFeature, { title: string; body: string }> = {
  writing: {
    title: "Unlock writing mode",
    body: "Writing practice is part of lifetime access. One payment, unlocked forever.",
  },
  word_practice: {
    title: "Unlock word practice",
    body: "Word practice is part of lifetime access. One payment, unlocked forever.",
  },
};

export function SubscriptionModal({
  open,
  onClose,
  onSubscribe,
  feature = "writing",
}: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const { title, body } = COPY[feature];

  return (
    <div
      className="practice-root fixed inset-0 z-200 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(0, 0, 0, 0.55)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-modal-title"
        onClick={(ev) => ev.stopPropagation()}
        className="w-full max-w-md"
        style={{
          background: "var(--practice-surface)",
          border: "1px solid var(--practice-stroke)",
          borderRadius: "var(--practice-radius-lg)",
          padding: 24,
          color: "var(--practice-text)",
        }}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2
              id="subscription-modal-title"
              className="practice-kana"
              style={{
                color: "var(--practice-text)",
                fontFamily: "var(--practice-ui-font)",
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h2>
            <p
              className="practice-ui mt-2"
              style={{
                color: "var(--practice-text-secondary)",
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              {body}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center transition hover:opacity-80"
            style={{
              background: "var(--practice-surface-elev)",
              border: "1px solid var(--practice-stroke)",
              borderRadius: "var(--practice-radius)",
              color: "var(--practice-text-secondary)",
            }}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <ModalButton primary onClick={onSubscribe}>
            Get lifetime access
          </ModalButton>
          <ModalButton onClick={onClose}>Not now</ModalButton>
        </div>
      </div>
    </div>
  );
}

function ModalButton({
  primary,
  onClick,
  children,
}: {
  primary?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const tone: CSSProperties = primary
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
      className="practice-ui transition"
      style={{
        ...tone,
        flex: primary ? 1 : "0 0 auto",
        borderRadius: "var(--practice-radius)",
        padding: "10px 18px",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: 0.2,
      }}
    >
      {children}
    </button>
  );
}
