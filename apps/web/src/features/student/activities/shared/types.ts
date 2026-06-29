export interface GameQuestion {
  id: string;
  term: string;
  definition: string;
  phonetic?: string | null;
  partOfSpeech: string;
  exampleSentence?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
}

export interface GameSession {
  score: number;
  accuracy: number;
  timeTakenSec: number;
  answers: Array<{
    vocabItemId: string;
    term: string;
    isCorrect: boolean;
    userResponse: string;
  }>;
}

export interface MatchPair {
  id: string; // Vocab item ID
  leftId: string;
  rightId: string;
  leftVal: string; // e.g. term or image url
  rightVal: string; // e.g. definition or term
  isMatched: boolean;
}

export interface LetterSlot {
  index: number;
  char: string;
  isRevealed: boolean;
  userChar: string;
}

export interface HangmanState {
  word: string;
  guessedLetters: string[];
  livesLeft: number;
  maxLives: number;
}

export interface WordSearchWord {
  word: string;
  clue: string;
  found: boolean;
  cells?: Array<[number, number]>;
}

export interface WordSearchGrid {
  grid: string[][];
  words: WordSearchWord[];
}
