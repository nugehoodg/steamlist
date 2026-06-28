/**
 * Basic profanity filter using a word list.
 * Not exhaustive — meant to catch obvious abuse, not be a full content moderation system.
 */

const BLOCKED_WORDS = [
  "nigger", "nigga", "faggot", "fag", "chink", "spic", "kike",
  "cunt", "fuck", "shit", "ass", "bitch", "bastard", "whore",
  "nazi", "hitler", "rape", "rapist", "pedo", "pedophile",
];

/**
 * Returns true if the text contains any blocked words (case-insensitive, whole-word match).
 */
export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some((word) => {
    // Whole-word match using word boundaries
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
    return regex.test(lower);
  });
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
