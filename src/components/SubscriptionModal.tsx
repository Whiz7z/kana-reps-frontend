import { Button } from "@/components/ui/Button";

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
    body: "Writing practice needs an active trial or subscription. Start checkout to continue.",
  },
  word_practice: {
    title: "Unlock word practice",
    body: "Word practice needs an active trial or subscription. Start checkout to continue.",
  },
};

export function SubscriptionModal({
  open,
  onClose,
  onSubscribe,
  feature = "writing",
}: Props) {
  if (!open) return null;
  const { title, body } = COPY[feature];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl border border-slate-100 bg-[var(--color-paper)] p-6 shadow-xl shadow-slate-300/40 dark:border-white/10 dark:shadow-black/50"
      >
        <h2 className="kana-page-title text-xl font-bold">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {body}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            className="flex-1 text-white"
            onClick={onSubscribe}
          >
            Subscribe
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
