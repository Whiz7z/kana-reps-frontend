import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
};

export function SubscriptionModal({ open, onClose, onSubscribe }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          Unlock writing mode
        </h2>
        <p className="mt-3 text-sm text-gray-600">
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
