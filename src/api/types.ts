export type MeResponse = {
  id: string;
  email: string;
  username: string | null;
  subscription_status: string;
  trial_expires_at: string | null;
  subscription_expires_at: string | null;
  stripe_customer_id: string | null;
  role: string;
  hasAccess: boolean;
  entitlements: {
    writing: boolean;
    word_practice: boolean;
    custom_set_unlimited: boolean;
  };
};

export type KanaRow = {
  char: string;
  romaji: string;
  kana_type: "hiragana" | "katakana";
  level: string;
  meaning?: string;
  category?: string;
};

export type PracticeMode = "kana-to-romaji" | "romaji-to-kana" | "writing";

export type PracticeLevel = "kana" | "word";

export type WordCategorySummary = {
  id: string;
  kana_type: "hiragana" | "katakana";
  count: number;
};

export type PracticeSession = {
  mode: PracticeMode;
  kanaType: "hiragana" | "katakana";
  setLabel: string;
  setName: string | string[] | undefined;
  customRomaji?: { romaji: string; type: string }[];
  level?: PracticeLevel;
  categories?: string[];
  customWords?: { char: string }[];
};
