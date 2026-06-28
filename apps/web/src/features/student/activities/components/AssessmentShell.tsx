import type { FC } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { AssessmentQuestion, AssessmentStats } from "../types";
import { useAssessment } from "../hooks/useAssessment";
import { useQuestionTimer } from "../hooks/useQuestionTimer";
import { QuestionHeader } from "./QuestionHeader";
import { QuestionFooter } from "./QuestionFooter";
import { CorrectAnimation } from "./CorrectAnimation";
import { WrongAnimation } from "./WrongAnimation";
import { Card } from "@/shared/components";

// Import renderers
import Q1Renderer from "../mcq/renderers/Q1Renderer";
import Q2Renderer from "../mcq/renderers/Q2Renderer";
import Q3Renderer from "../mcq/renderers/Q3Renderer";
import Q4Renderer from "../mcq/renderers/Q4Renderer";
import Q5Renderer from "../mcq/renderers/Q5Renderer";
import Q6Renderer from "../mcq/renderers/Q6Renderer";
import Q7Renderer from "../mcq/renderers/Q7Renderer";
import F1Renderer from "../fill-blank/renderers/F1Renderer";
import F2Renderer from "../fill-blank/renderers/F2Renderer";
import F3Renderer from "../fill-blank/renderers/F3Renderer";
import F4Renderer from "../fill-blank/renderers/F4Renderer";
import F5Renderer from "../fill-blank/renderers/F5Renderer";
import F6Renderer from "../fill-blank/renderers/F6Renderer";

const RENDERERS: Record<string, any> = {
  Q1: Q1Renderer,
  Q2: Q2Renderer,
  Q3: Q3Renderer,
  Q4: Q4Renderer,
  Q5: Q5Renderer,
  Q6: Q6Renderer,
  Q7: Q7Renderer,
  F1: F1Renderer,
  F2: F2Renderer,
  F3: F3Renderer,
  F4: F4Renderer,
  F5: F5Renderer,
  F6: F6Renderer,
};

interface AssessmentShellProps {
  questions: AssessmentQuestion[];
  vocabSetTitle: string;
  activityName: string;
  onComplete: (stats: AssessmentStats) => void;
  isSubmitting?: boolean;
}

export const AssessmentShell: FC<AssessmentShellProps> = ({
  questions,
  vocabSetTitle,
  activityName,
  onComplete,
  isSubmitting = false,
}) => {
  const navigate = useNavigate();
  const [userValue, setUserValue] = useState("");

  const handleTimeout = () => {
    // Force submit an empty answer on timeout
    submitAnswer("");
  };

  const {
    currentQuestionIndex,
    currentQuestion,
    totalQuestions,
    hasAnswered,
    isAnswerCorrect,
    submitAnswer,
    nextQuestion,
    skipQuestion,
  } = useAssessment({
    questions,
    showImmediateFeedback: true,
    onComplete,
  });

  // Question countdown limit is 15 seconds
  const QUESTION_DURATION = 15;
  const timer = useQuestionTimer({
    durationSeconds: QUESTION_DURATION,
    onTimeout: handleTimeout,
    autoStart: true,
  });

  // Reset local state when active question index changes
  useEffect(() => {
    setUserValue("");
    timer.reset(QUESTION_DURATION);
  }, [currentQuestionIndex]);

  // Pause timer once user has submitted
  useEffect(() => {
    if (hasAnswered) {
      timer.pause();
    }
  }, [hasAnswered]);

  // Keyboard shortcut handlers (Enter, Escape, arrow navigation)
  useEffect(() => {
    const isInteractiveTarget = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.closest("input, textarea, button, a, [role='button']") !== null ||
        target.isContentEditable);
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isInteractiveTarget(e.target)) {
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        navigate("/dashboard");
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (!hasAnswered) {
          // Only submit if user selected something or typed
          if (userValue.trim()) {
            submitAnswer(userValue);
          }
        } else {
          nextQuestion();
        }
      }

      if (e.key === "ArrowRight" && hasAnswered) {
        e.preventDefault();
        nextQuestion();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [hasAnswered, userValue, submitAnswer, nextQuestion, navigate]);

  if (!currentQuestion) return null;

  const ActiveQuestionRenderer =
    RENDERERS[currentQuestion.activityType] || Q3Renderer;
  const isLast = currentQuestionIndex === totalQuestions - 1;

  // Checks if user has provided input to allow submitting
  const canSubmit = userValue.trim().length > 0;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-4 px-4 space-y-6 md:space-y-8 select-none min-h-[550px]">
      {/* Question Progress & Timer info */}
      <QuestionHeader
        currentIndex={currentQuestionIndex}
        totalCards={totalQuestions}
        secondsLeft={timer.secondsLeft}
        activityName={activityName}
        vocabSetTitle={vocabSetTitle}
        onExit={() => navigate("/dashboard")}
      />

      {/* Main question workspace wrapper */}
      <div className="flex-1 flex items-center justify-center py-4">
        <Card className="w-full p-6 md:p-10 border border-border/80 shadow-md flex flex-col justify-center min-h-[320px]">
          <AnimatePresence mode="wait">
            {!hasAnswered ? (
              <motion.div
                key={`q-${currentQuestionIndex}`}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="w-full flex justify-center"
              >
                <ActiveQuestionRenderer
                  question={currentQuestion}
                  value={userValue}
                  onChange={setUserValue}
                  onSubmit={() => submitAnswer(userValue)}
                  disabled={hasAnswered}
                  hasAnswered={hasAnswered}
                  isCorrect={isAnswerCorrect}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`feedback-${currentQuestionIndex}`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col items-center justify-center py-6 space-y-4"
              >
                {isAnswerCorrect ? (
                  <CorrectAnimation />
                ) : (
                  <WrongAnimation
                    correctAnswerText={currentQuestion.correctAnswer}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Bottom control actions */}
      <QuestionFooter
        hasAnswered={hasAnswered}
        canSubmit={canSubmit}
        onSubmit={() => submitAnswer(userValue)}
        onNext={nextQuestion}
        onSkip={skipQuestion}
        isLast={isLast}
        disabledNext={isSubmitting}
      />
    </div>
  );
};
