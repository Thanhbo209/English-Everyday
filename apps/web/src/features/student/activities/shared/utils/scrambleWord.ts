import { shuffleLetters } from "./shuffleLetters";

export function scrambleWord(word: string): string {
  const clean = word.trim().toUpperCase();
  if (clean.length <= 1) return clean;

  const chars = clean.split("");
  let scrambled = shuffleLetters(chars).join("");
  let attempts = 0;
  while (scrambled === clean && attempts < 10) {
    scrambled = shuffleLetters(chars).join("");
    attempts++;
  }
  return scrambled;
}
