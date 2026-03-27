/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
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
  handwriting: {
    Canvas: HandwritingCanvasCtor;
    recognize: (...args: unknown[]) => void;
  };
}
