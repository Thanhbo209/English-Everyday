import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { AssessmentQuestion, UserAnswer, AssessmentStats } from "../types";
import { normalizeAnswer } from "../utils/normalizeAnswer";

export interface UseAssessmentOptions {
  questions: AssessmentQuestion[];
  showImmediateFeedback?: boolean; // immediate feedback (optional)
  onComplete?: (stats: AssessmentStats) => void;
}

export function useAssessment({
  questions,
  showImmediateFeedback = true,
  onComplete,
}: UseAssessmentOptions) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Track session timer
  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());

  // Current active question
  const currentQuestion = useMemo(() => {
    return questions[currentQuestionIndex] || null;
  }, [questions, currentQuestionIndex]);

  // Total count
  const totalQuestions = questions.length;

  // Reset timing when current question changes
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    setHasAnswered(false);
    setCurrentAnswer("");
    setIsAnswerCorrect(false);
  }, [currentQuestionIndex]);

  // Computed scores
  const stats = useMemo<AssessmentStats>(() => {
    const total = answers.length;
    const correct = answers.filter((a) => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    // Score can match accuracy, or a custom formula
    const score = accuracy;
    const timeTakenSec = Math.max(
      1,
      Math.round((Date.now() - startTimeRef.current) / 1000)
    );

    return {
      total: questions.length,
      correct,
      wrong: questions.length - correct,
      accuracy,
      score,
      timeTakenSec,
    };
  }, [answers, questions.length]);

  const submitAnswer = useCallback(
    (answerText: string) => {
      if (hasAnswered || !currentQuestion) return;

      const normUser = normalizeAnswer(answerText);
      const normCorrect = normalizeAnswer(currentQuestion.correctAnswer);
      const isCorrect = normUser === normCorrect;

      const timeSpentSec = Math.max(
        1,
        Math.round((Date.now() - questionStartTimeRef.current) / 1000)
      );

      const newAnswer: UserAnswer = {
        questionId: currentQuestion.id,
        answer: answerText,
        isCorrect,
        timeSpentSec,
      };

      setAnswers((prev) => [...prev, newAnswer]);
      setCurrentAnswer(answerText);
      setIsAnswerCorrect(isCorrect);
      setHasAnswered(true);

      // If immediate feedback is disabled, we can auto-advance or let them click next
      if (!showImmediateFeedback) {
        // Auto-advance or allow user to click next
      }
    },
    [hasAnswered, currentQuestion, showImmediateFeedback]
  );

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Finished the assessment
      setIsCompleted(true);
      if (onComplete) {
        onComplete(stats);
      }
    }
  }, [currentQuestionIndex, totalQuestions, onComplete, stats]);

  const prevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const skipQuestion = useCallback(() => {
    submitAnswer(""); // submit empty answer
  }, [submitAnswer]);

  const resetAssessment = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setHasAnswered(false);
    setCurrentAnswer("");
    setIsAnswerCorrect(false);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();
  }, []);

  return {
    currentQuestionIndex,
    currentQuestion,
    totalQuestions,
    answers,
    hasAnswered,
    currentAnswer,
    isAnswerCorrect,
    isCompleted,
    stats,
    submitAnswer,
    nextQuestion,
    prevQuestion,
    skipQuestion,
    resetAssessment,
  };
}
