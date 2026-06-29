import type { FC } from "react";
import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlashcardDeck } from "@/features/student/activities/flashcard";
import { useGameSession } from "@/features/student/activities/shared/hooks/useGameSession";
import { useGameTimer } from "@/features/student/activities/shared/hooks/useGameTimer";
import { useSubmission } from "@/features/student/activities/shared/hooks/useSubmission";
import { generateMatchingPairs } from "@/features/student/activities/shared/utils/generateMatchingPairs";
import type { MatchPair } from "@/features/student/activities/shared/types";
import {
  ActivityLayout,
  GameHeader,
  LoadingGame,
  EmptyGame,
  SessionSummary,
} from "@/features/student/activities/shared/components";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils/utils";

interface MatchMeaningPageProps {
  activityType: "M1" | "M2";
}

export const MatchMeaningPage: FC<MatchMeaningPageProps> = ({ activityType }) => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const { vocabSet, vocabItems, isLoading } = useFlashcardDeck(assignmentId);
  const submission = useSubmission(assignmentId);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [leftCards, setLeftCards] = useState<MatchPair[]>([]);
  const [rightCards, setRightCards] = useState<MatchPair[]>([]);
  const [wrongPairs, setWrongPairs] = useState<string[]>([]); // holds ids that just shook

  const [retryCount, setRetryCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStats, setSessionStats] = useState<any>(null);

  const questions = useMemo(() => {
    if (!vocabItems) return [];
    return vocabItems.map((item) => ({
      id: item.id,
      term: item.term,
      definition: item.definition,
      phonetic: item.phonetic,
      partOfSpeech: item.partOfSpeech,
      exampleSentence: item.exampleSentence,
      imageUrl: item.imageUrl,
      audioUrl: item.audioUrl,
    }));
  }, [vocabItems]);

  const {
    totalQuestions,
    isCompleted,
    recordAnswer,
    nextQuestion,
    resetSession,
  } = useGameSession({
    questions,
    onComplete: async (session) => {
      setSessionStats(session);
      if (assignmentId) {
        try {
          await submission.mutateAsync({
            score: session.score,
            accuracy: session.accuracy,
            timeTakenSec: session.timeTakenSec,
            answers: {
              activityType,
              total: session.answers.length,
              correct: session.score,
              wrong: session.answers.length - session.score,
              answersMeta: session.answers,
            },
          });
        } catch {
          // Ignore
        }
      }
      setShowSummary(true);
    },
  });

  const timer = useGameTimer({
    durationSeconds: 120, // 2 minutes total for matching
    onTimeout: () => {
      // Auto-submit remaining as wrong
      if (leftCards.length > 0) {
        leftCards.forEach((card) => {
          if (!card.isMatched) {
            recordAnswer(card.id, card.leftVal, "", false);
          }
        });
      }
    },
    autoStart: !showSummary && !isLoading && !!vocabItems && vocabItems.length > 0,
  });

  // Load pairs on start or retry
  useEffect(() => {
    if (questions.length > 0) {
      const type = activityType === "M2" ? "image" : "meaning";
      const { leftSide, rightSide } = generateMatchingPairs(questions, type);
      setLeftCards(leftSide);
      setRightCards(rightSide);
    }
  }, [questions, retryCount]);

  // Handle selection match checking
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const leftCard = leftCards.find((c) => c.leftId === selectedLeft);
      const rightCard = rightCards.find((c) => c.rightId === selectedRight);

      if (leftCard && rightCard) {
        if (leftCard.id === rightCard.id) {
          // Match!
          setLeftCards((prev) =>
            prev.map((c) => (c.id === leftCard.id ? { ...c, isMatched: true } : c))
          );
          setRightCards((prev) =>
            prev.map((c) => (c.id === rightCard.id ? { ...c, isMatched: true } : c))
          );
          recordAnswer(leftCard.id, leftCard.leftVal, rightCard.rightVal, true);
          setSelectedLeft(null);
          setSelectedRight(null);
        } else {
          // Wrong
          setWrongPairs([selectedLeft, selectedRight]);
          recordAnswer(leftCard.id, leftCard.leftVal, rightCard.rightVal, false);

          setTimeout(() => {
            setWrongPairs([]);
            setSelectedLeft(null);
            setSelectedRight(null);
          }, 800);
        }
      }
    }
  }, [selectedLeft, selectedRight]);

  // Check if all matched, if so complete
  const allMatched = useMemo(() => {
    if (leftCards.length === 0) return false;
    return leftCards.every((c) => c.isMatched);
  }, [leftCards]);

  useEffect(() => {
    if (allMatched && !isCompleted) {
      // Since all items are matched, we manually trigger the finish!
      // In matching, we match everything in one screen, so we set all items as recorded.
      // Call nextQuestion until completed.
      const finish = async () => {
        timer.pause();
        for (let i = 0; i < totalQuestions; i++) {
          nextQuestion();
        }
      };
      finish();
    }
  }, [allMatched]);

  if (isLoading) return <LoadingGame />;
  if (!vocabItems || vocabItems.length === 0) {
    return <EmptyGame onExit={() => navigate("/dashboard")} />;
  }

  if (showSummary && sessionStats) {
    return (
      <SessionSummary
        total={totalQuestions}
        correct={sessionStats.score}
        wrong={totalQuestions - sessionStats.score}
        accuracy={sessionStats.accuracy}
        score={sessionStats.score}
        timeTakenSec={sessionStats.timeTakenSec}
        answers={sessionStats.answers}
        isSubmitting={submission.isPending}
        onExit={() => navigate("/dashboard")}
        onRetry={() => {
          setRetryCount((prev) => prev + 1);
          setShowSummary(false);
          setSessionStats(null);
          setSelectedLeft(null);
          setSelectedRight(null);
          resetSession();
        }}
      />
    );
  }

  // Calculate matched progress
  const matchedCount = leftCards.filter((c) => c.isMatched).length;

  return (
    <ActivityLayout>
      <GameHeader
        currentIndex={matchedCount}
        totalCards={totalQuestions}
        secondsLeft={timer.secondsLeft}
        activityName={
          activityType === "M1" ? "M1 • Match Word ↔ Meaning" : "M2 • Match Image ↔ Word"
        }
        vocabSetTitle={vocabSet?.title || "Vocabulary Set"}
        onExit={() => navigate("/dashboard")}
      />

      <div className="flex-1 grid grid-cols-2 gap-8 items-center py-6">
        {/* Left Column (Words or Images) */}
        <div className="flex flex-col gap-3">
          <h3 className="text-center font-bold text-sm text-muted-foreground">
            {activityType === "M1" ? "Word" : "Image"}
          </h3>
          <AnimatePresence>
            {leftCards.map((card) => {
              if (card.isMatched) return null;

              const isSelected = selectedLeft === card.leftId;
              const isWrong = wrongPairs.includes(card.leftId);

              return (
                <motion.div
                  key={card.leftId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: isWrong ? [0, -10, 10, -10, 10, 0] : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => !isWrong && setSelectedLeft(card.leftId)}
                  className={cn(
                    "h-16 px-4 flex items-center justify-center text-center font-bold border-2 rounded-2xl cursor-pointer select-none transition-all shadow-sm text-sm md:text-base",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground scale-105"
                      : "bg-card border-border text-foreground hover:bg-secondary/40",
                    isWrong && "border-destructive bg-destructive/10 text-destructive"
                  )}
                >
                  {activityType === "M2" ? (
                    card.leftVal ? (
                      <img
                        src={card.leftVal}
                        alt="Match prompt"
                        className="h-12 w-12 object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">No image</span>
                    )
                  ) : (
                    card.leftVal
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Right Column (Meanings or Words) */}
        <div className="flex flex-col gap-3">
          <h3 className="text-center font-bold text-sm text-muted-foreground">
            {activityType === "M1" ? "Meaning" : "Word"}
          </h3>
          <AnimatePresence>
            {rightCards.map((card) => {
              if (card.isMatched) return null;

              const isSelected = selectedRight === card.rightId;
              const isWrong = wrongPairs.includes(card.rightId);

              return (
                <motion.div
                  key={card.rightId}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: isWrong ? [0, -10, 10, -10, 10, 0] : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => !isWrong && setSelectedRight(card.rightId)}
                  className={cn(
                    "h-16 px-4 flex items-center justify-center text-center font-bold border-2 rounded-2xl cursor-pointer select-none transition-all shadow-sm text-sm md:text-base leading-snug overflow-hidden text-ellipsis",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground scale-105"
                      : "bg-card border-border text-foreground hover:bg-secondary/40",
                    isWrong && "border-destructive bg-destructive/10 text-destructive"
                  )}
                >
                  {card.rightVal}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border mt-auto">
        <span className="text-xs font-semibold text-muted-foreground">
          Matches found: {matchedCount} / {totalQuestions}
        </span>
      </div>
    </ActivityLayout>
  );
};
