import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
};

export function SubscriptionModal({ open, onClose, onSubscribe }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl border border-slate-100 bg-[var(--color-paper)] p-6 shadow-xl shadow-slate-300/40 dark:border-white/10 dark:shadow-black/50"
      >
        <h2 className="kana-page-title text-xl font-bold">Unlock writing mode</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Writing practice needs an active trial or subscription. Start checkout
          to continue.
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
