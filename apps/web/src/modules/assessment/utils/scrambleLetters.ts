import { shuffle } from "./shuffle";

/**
 * Takes a word and returns its letters shuffled.
 * Ensures the output is an array of uppercase letter characters.
 */
export function scrambleLetters(word: string): string[] {
  const letters = word.toUpperCase().replace(/[^A-Z]/g, "").split("");
  if (letters.length <= 1) return letters;

  let scrambled = shuffle(letters);
  // Try to avoid returning the exact same word if possible
  let attempts = 0;
  while (scrambled.join("") === letters.join("") && attempts < 5) {
    scrambled = shuffle(letters);
    attempts++;
  }
  return scrambled;
}
