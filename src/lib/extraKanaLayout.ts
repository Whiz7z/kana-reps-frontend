/** Five vowel columns (dakuten / handakuten rows). */
export const VOWEL_FIVE = ["a", "i", "u", "e", "o"] as const;

export const DAKUTEN_ROW_LABELS = ["g", "z", "d", "b"] as const;
export const HANDAKUTEN_ROW_LABEL = "p" as const;

/** Merged dakuten + handakuten desktop row labels (5 rows). */
export const DAKUTEN_HAND_ROW_LABELS = [
  ...DAKUTEN_ROW_LABELS,
  HANDAKUTEN_ROW_LABEL,
] as const;

/** Yoon: 11 rows × 3 cols (ya, yu, yo) — matches `kanaCatalog` yoon order. */
export const YOON_MATRIX: [string, string, string][] = [
  ["kya", "kyu", "kyo"],
  ["sha", "shu", "sho"],
  ["cha", "chu", "cho"],
  ["nya", "nyu", "nyo"],
  ["hya", "hyu", "hyo"],
  ["mya", "myu", "myo"],
  ["rya", "ryu", "ryo"],
  ["gya", "gyu", "gyo"],
  ["ja", "ju", "jo"],
  ["bya", "byu", "byo"],
  ["pya", "pyu", "pyo"],
];

export const YOON_COL_LABELS = ["ya", "yu", "yo"] as const;

/** Short row ids for labels (mobile / desktop). */
export const YOON_ROW_LABELS = [
  "k",
  "sh",
  "ch",
  "n",
  "h",
  "m",
  "r",
  "g",
  "j",
  "b",
  "p",
] as const;
