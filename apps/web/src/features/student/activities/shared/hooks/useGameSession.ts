import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { GameQuestion, GameSession } from "../types";

export interface UseGameSessionOptions {
  questions: GameQuestion[];
  onComplete?: (session: GameSession) => void;
}

export function useGameSession({ questions, onComplete }: UseGameSessionOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<GameSession["answers"]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());

  const currentQuestion = useMemo(() => {
    return questions[currentIndex] || null;
  }, [questions, currentIndex]);

  const totalQuestions = questions.length;

  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    setHasAnswered(false);
    setIsAnswerCorrect(false);
  }, [currentIndex]);

  const recordAnswer = useCallback(
    (vocabItemId: string, term: string, userResponse: string, isCorrect: boolean) => {
      if (hasAnswered) return;

      const newAnswer = {
        vocabItemId,
        term,
        isCorrect,
        userResponse,
      };

      setAnswers((prev) => [...prev, newAnswer]);
      setIsAnswerCorrect(isCorrect);
      setHasAnswered(true);
      if (isCorrect) {
        setScore((prev) => prev + 1);
      }
    },
    [hasAnswered]
  );

  const nextQuestion = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      const total = answers.length;
      const correct = answers.filter((a) => a.isCorrect).length;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      const timeTakenSec = Math.max(
        1,
        Math.round((Date.now() - startTimeRef.current) / 1000)
      );

      const finalSession: GameSession = {
        score: correct,
        accuracy,
        timeTakenSec,
        answers,
      };

      if (onComplete) {
        onComplete(finalSession);
      }
    }
  }, [currentIndex, totalQuestions, answers, onComplete]);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setHasAnswered(false);
    setIsAnswerCorrect(false);
    setIsCompleted(false);
    setScore(0);
    startTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();
  }, []);

  return {
    currentIndex,
    currentQuestion,
    totalQuestions,
    answers,
    hasAnswered,
    isAnswerCorrect,
    isCompleted,
    score,
    recordAnswer,
    nextQuestion,
    resetSession,
  };
}
