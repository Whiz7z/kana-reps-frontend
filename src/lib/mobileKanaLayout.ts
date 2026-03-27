import { COL_HEADERS, GOJUON_ROMAJI } from "@/lib/gojuon";

/** Consonant-group rows × five vowels (a, i, u, e, o); used for mobile layout. */
export type ConsonantRowDef = {
  label: string;
  /** Romaji cell or null for empty slot */
  cells: (string | null)[];
};

export function consonantRowsFromGojuon(): ConsonantRowDef[] {
  const out: ConsonantRowDef[] = [];
  for (let c = 0; c < COL_HEADERS.length; c++) {
    const cells: (string | null)[] = [];
    for (let v = 0; v < 5; v++) {
      cells.push(GOJUON_ROMAJI[v][c] ?? null);
    }
    out.push({ label: COL_HEADERS[c], cells });
  }
  return out;
}

/** Vowel labels shown above the five columns (optional header row). */
export const VOWEL_COL_LABELS = ["a", "i", "u", "e", "o"] as const;
