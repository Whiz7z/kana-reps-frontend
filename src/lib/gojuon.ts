/**
 * Classic gojūon layout: rows = a i u e o, columns = vowel-only then k s t n h m y r w, plus ん.
 */

import type { KanaRow } from "@/api/types";

export const ROW_LABELS = ["a", "i", "u", "e", "o"] as const;

export const COL_HEADERS = [
  "∅",
  "k",
  "s",
  "t",
  "n",
  "h",
  "m",
  "y",
  "r",
  "w",
  "ん",
] as const;

/** [row][col] romaji key, or null for empty cell */
export const GOJUON_ROMAJI: (string | null)[][] = [
  ["a", "ka", "sa", "ta", "na", "ha", "ma", "ya", "ra", "wa", null],
  ["i", "ki", "shi", "chi", "ni", "hi", "mi", null, "ri", null, null],
  ["u", "ku", "su", "tsu", "nu", "fu", "mu", "yu", "ru", null, "n"],
  ["e", "ke", "se", "te", "ne", "he", "me", null, "re", null, null],
  ["o", "ko", "so", "to", "no", "ho", "mo", "yo", "ro", "wo", null],
];

const ALIASES: Record<string, string> = {
  tu: "tsu",
  si: "shi",
  ti: "chi",
  hu: "fu",
  zi: "ji",
  di: "ji",
  du: "zu",
};

export function normalizeRomajiKey(r: string): string {
  const x = r.trim().toLowerCase();
  return ALIASES[x] ?? x;
}

export function romajiMatchesCell(
  catalogRomaji: string,
  cellKey: string
): boolean {
  const a = normalizeRomajiKey(catalogRomaji);
  const b = normalizeRomajiKey(cellKey);
  if (a === b) return true;
  if (b === "wo" && a === "o") return true;
  if (b === "o" && a === "wo") return true;
  return false;
}

export function cellKana(
  rows: KanaRow[],
  script: "hiragana" | "katakana",
  cellKey: string | null
): KanaRow | undefined {
  if (!cellKey) return undefined;
  const normCell = normalizeRomajiKey(cellKey);
  // Prefer exact romaji match so that "o" and "wo" don't collapse to the
  // same cell when both exist in the catalog (e.g. お vs を, オ vs ヲ).
  const exact = rows.find(
    (r) => r.kana_type === script && normalizeRomajiKey(r.romaji) === normCell
  );
  if (exact) return exact;
  return rows.find(
    (r) => r.kana_type === script && romajiMatchesCell(r.romaji, cellKey)
  );
}
