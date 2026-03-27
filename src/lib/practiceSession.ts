import type { KanaRow, PracticeSession } from "@/api/types";

export const PRACTICE_SESSION_KEY = "kanareps-practice-session";

export type PracticePayload = PracticeSession & { kanaData: KanaRow[] };

export function savePracticeToSession(payload: PracticePayload): void {
  sessionStorage.setItem(PRACTICE_SESSION_KEY, JSON.stringify(payload));
}

export function loadPracticeFromSession(): PracticePayload | null {
  try {
    const raw = sessionStorage.getItem(PRACTICE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PracticePayload;
  } catch {
    return null;
  }
}
