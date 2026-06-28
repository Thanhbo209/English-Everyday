import type { VocabItem } from "../../../api/vocab.api";

export interface AssessmentQuestion {
  id: string;
  vocabItem: VocabItem;
  type: "MCQ" | "FIB";
  promptType: "word" | "meaning" | "audio" | "image";
  prompt: string;
  correctAnswer: string;
  options?: string[]; // For MCQ choices
  scrambledHint?: string[]; // For FIB hint letters
  activityType: string;
}

export interface UserAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpentSec: number;
}

export interface AssessmentStats {
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
  score: number;
  timeTakenSec: number;
}
