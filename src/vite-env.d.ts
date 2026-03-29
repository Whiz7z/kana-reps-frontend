/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** Google Ads conversion `send_to`: `AW-XXXX/label` from the conversion action. */
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
  handwriting: {
    Canvas: HandwritingCanvasCtor;
    recognize: (...args: unknown[]) => void;
  };
}
