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
    custom_set_unlimited: boolean;
  };
};

export type KanaRow = {
  char: string;
  romaji: string;
  kana_type: "hiragana" | "katakana";
  level: string;
};

export type PracticeMode = "kana-to-romaji" | "romaji-to-kana" | "writing";

export type PracticeSession = {
  mode: PracticeMode;
  kanaType: "hiragana" | "katakana";
  setLabel: string;
  setName: string | string[] | undefined;
  customRomaji?: { romaji: string; type: string }[];
};
