/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** Optional override for conversion label (default matches index.html snippet). */
  readonly VITE_GADS_SUBSCRIPTION_SEND_TO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface HandwritingCanvasCtor {
  new (canvas: HTMLCanvasElement, lineWidth?: number): {
    erase: () => void;
    setLineWidth: (n: number) => void;
    setOptions: (o: Record<string, unknown>) => void;
    setCallBack: (
      cb: (results: string[] | undefined, err: Error | undefined) => void
    ) => void;
    recognize: () => void;
  };
}

interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  /** Google Ads snippet in index.html — optional redirect URL, optional Stripe session id */
  gtag_report_conversion?: (
    url?: string | null,
    transactionId?: string
  ) => boolean;
  handwriting: {
    Canvas: HandwritingCanvasCtor;
    recognize: (...args: unknown[]) => void;
  };
}
