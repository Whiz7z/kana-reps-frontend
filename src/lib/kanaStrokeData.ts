import type { KanaRow } from "@/api/types";

export type KanaSvgStroke = { id: string; value: string };

export type KanaSvgMedian = {
  id: string;
  value: [number, number][];
};

export type KanaSvgJson = {
  charCode: number;
  strokes: KanaSvgStroke[];
  medians: KanaSvgMedian[];
  clipPaths: { id: string; value: string }[];
};

const hiraganaLoaders = import.meta.glob("../../node_modules/kana-svg-data/dist/hiragana/*.json");

const katakanaLoaders = import.meta.glob("../../node_modules/kana-svg-data/dist/katakana/*.json");

function stemFromGlobKey(key: string): string {
  const norm = key.replace(/\\/g, "/");
  const base = norm.split("/").pop() ?? "";
  return base.replace(/\.json$/i, "");
}

function buildCharLoaderMap(
  loaders: Record<string, () => Promise<{ default: KanaSvgJson }>>
): Record<string, () => Promise<KanaSvgJson>> {
  const map: Record<string, () => Promise<KanaSvgJson>> = {};
  for (const [key, loader] of Object.entries(loaders)) {
    const char = stemFromGlobKey(key);
    map[char] = async () => (await loader()).default;
  }
  return map;
}

const hiraganaByChar = buildCharLoaderMap(
  hiraganaLoaders as Record<string, () => Promise<{ default: KanaSvgJson }>>
);
const katakanaByChar = buildCharLoaderMap(
  katakanaLoaders as Record<string, () => Promise<{ default: KanaSvgJson }>>
);

async function loadOneKanaSvgJson(
  ch: string,
  map: Record<string, () => Promise<KanaSvgJson>>
): Promise<KanaSvgJson | null> {
  const loader = map[ch];
  if (!loader) return null;
  try {
    return await loader();
  } catch {
    return null;
  }
}

/** Single kana or yoon / multi-glyph string (e.g. みょ) with per-glyph stroke JSON. */
export type KanaStrokeHintPayload =
  | { layout: "single"; data: KanaSvgJson }
  | { layout: "row"; parts: KanaSvgJson[] };

export async function loadKanaStrokeHintData(
  char: string,
  kind: KanaRow["kana_type"]
): Promise<KanaStrokeHintPayload | null> {
  const symbols = [...char];
  if (symbols.length === 0) return null;

  const map = kind === "hiragana" ? hiraganaByChar : katakanaByChar;

  if (symbols.length === 1) {
    const data = await loadOneKanaSvgJson(symbols[0]!, map);
    return data ? { layout: "single", data } : null;
  }

  const loaded = await Promise.all(symbols.map((ch) => loadOneKanaSvgJson(ch, map)));
  if (loaded.some((x) => x === null)) return null;
  return { layout: "row", parts: loaded as KanaSvgJson[] };
}
