import type { HangmanState } from "../types";

export function generateHangmanState(word: string, maxLives: number = 6): HangmanState {
  return {
    word: word.trim().toUpperCase(),
    guessedLetters: [],
    livesLeft: maxLives,
    maxLives,
  };
}
