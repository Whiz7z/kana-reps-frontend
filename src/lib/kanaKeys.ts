import type { KanaRow } from "@/api/types";

/** Stable unique key per kana (handles duplicate Hepburn romaji). */
export function kanaKey(row: Pick<KanaRow, "char" | "kana_type">): string {
  return `${row.char}:${row.kana_type}`;
}

/** Migrate legacy `romaji:kana_type` keys when catalog is available. */
export function migrateLegacyKey(
  key: string,
  catalog: KanaRow[]
): string | null {
  const parts = key.split(":");
  if (parts.length !== 2) return null;
  const [a, type] = parts;
  if (type !== "hiragana" && type !== "katakana") return null;
  if ([...a].length === 1) return key;
  const matches = catalog.filter((r) => r.romaji === a && r.kana_type === type);
  if (matches.length === 1) return kanaKey(matches[0]);
  return null;
}
