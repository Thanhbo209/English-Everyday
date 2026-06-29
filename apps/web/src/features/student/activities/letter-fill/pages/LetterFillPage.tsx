import type { FC } from "react";
import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlashcardDeck } from "@/features/student/activities/flashcard";
import { useGameSession } from "@/features/student/activities/shared/hooks/useGameSession";
import { useGameTimer } from "@/features/student/activities/shared/hooks/useGameTimer";
import { useSubmission } from "@/features/student/activities/shared/hooks/useSubmission";
import { generateLetterSlots } from "@/features/student/activities/shared/utils/generateLetterSlots";
import { normalizeAnswer } from "@/features/student/activities/shared/utils/normalizeAnswer";
import type { LetterSlot } from "@/features/student/activities/shared/types";
import {
  ActivityLayout,
  GameHeader,
  GameFooter,
  CorrectAnimation,
  WrongAnimation,
  LoadingGame,
  EmptyGame,
  SessionSummary,
} from "@/features/student/activities/shared/components";
import { Button, Card } from "@/shared/components";
import { Lightbulb, WarningCircle, Sparkle, Trophy } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/utils";

interface LetterFillPageProps {
  activityType: "V1" | "V2" | "V3";
}

export const LetterFillPage: FC<LetterFillPageProps> = ({ activityType }) => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const { vocabSet, vocabItems, isLoading } = useFlashcardDeck(assignmentId);
  const submission = useSubmission(assignmentId);

  // V3 Difficulty setup
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(
    activityType === "V3" ? null : activityType === "V1" ? "medium" : "hard"
  );

  const [slots, setSlots] = useState<LetterSlot[]>([]);
  const [hintsUsedThisItem, setHintsUsedThisItem] = useState(0);

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
    currentIndex,
    currentQuestion,
    totalQuestions,
    hasAnswered,
    isAnswerCorrect,
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
              difficulty: difficulty || undefined,
              total: session.answers.length,
              correct: session.score,
              wrong: session.answers.length - session.score,
              answersMeta: session.answers,
            },
          });
        } catch {
          // Fallback
        }
      }
      setShowSummary(true);
    },
  });

  const timer = useGameTimer({
    durationSeconds: 40,
    onTimeout: () => {
      if (!hasAnswered && currentQuestion) {
        recordAnswer(currentQuestion.id, currentQuestion.term, "", false);
      }
    },
    autoStart: !showSummary && !isLoading && !!currentQuestion && difficulty !== null,
  });

  // Initialize Slots
  useEffect(() => {
    if (currentQuestion && difficulty !== null) {
      const mode = activityType === "V3" ? difficulty : activityType === "V1" ? "v1" : "v2";
      const initialSlots = generateLetterSlots(currentQuestion.term, mode);
      setSlots(initialSlots);
      setHintsUsedThisItem(0);
      timer.reset(40);
    }
  }, [currentIndex, currentQuestion, difficulty, retryCount]);

  if (isLoading) return <LoadingGame />;
  if (!vocabItems || vocabItems.length === 0) {
    return <EmptyGame onExit={() => navigate("/dashboard")} />;
  }

  // Choose difficulty view for V3
  if (activityType === "V3" && difficulty === null) {
    return (
      <div className="max-w-md mx-auto py-10 px-4">
        <Card className="p-8 space-y-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Trophy size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Choose Hint Level</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select difficulty to begin your Letter Fill activity.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => setDifficulty("easy")}
              className="flex items-center justify-between p-4 border border-border rounded-2xl hover:bg-secondary/40 transition-all text-left cursor-pointer"
            >
              <div>
                <p className="font-bold text-sm text-emerald-500">Easy</p>
                <p className="text-xs text-muted-foreground">40% letters revealed, hint button active.</p>
              </div>
              <Sparkle className="text-emerald-500" size={20} />
            </button>

            <button
              onClick={() => setDifficulty("medium")}
              className="flex items-center justify-between p-4 border border-border rounded-2xl hover:bg-secondary/40 transition-all text-left cursor-pointer"
            >
              <div>
                <p className="font-bold text-sm text-amber-500">Medium</p>
                <p className="text-xs text-muted-foreground">20% letters revealed, hint button active.</p>
              </div>
              <Lightbulb className="text-amber-500" size={20} />
            </button>

            <button
              onClick={() => setDifficulty("hard")}
              className="flex items-center justify-between p-4 border border-border rounded-2xl hover:bg-secondary/40 transition-all text-left cursor-pointer"
            >
              <div>
                <p className="font-bold text-sm text-destructive">Hard</p>
                <p className="text-xs text-muted-foreground">0% letters revealed, hints disabled.</p>
              </div>
              <WarningCircle className="text-destructive" size={20} />
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const handleRevealLetter = () => {
    if (hasAnswered) return;
    // Find unrevealed alphabetic slot
    const unrevealed = slots.filter((s) => !s.isRevealed);
    if (unrevealed.length === 0) return;

    const randomSlot = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    setSlots((prev) =>
      prev.map((s) =>
        s.index === randomSlot.index ? { ...s, isRevealed: true, userChar: s.char } : s
      )
    );
    setHintsUsedThisItem((prev) => prev + 1);
  };

  const handleCharChange = (idx: number, val: string) => {
    if (hasAnswered) return;
    const char = val.slice(-1).toUpperCase();
    setSlots((prev) =>
      prev.map((s) => (s.index === idx ? { ...s, userChar: char } : s))
    );

    // Auto-focus next input
    if (char) {
      const nextInput = document.getElementById(`slot-input-${idx + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (idx: number, e: any) => {
    if (e.key === "Backspace" && !slots[idx].userChar) {
      // Focus previous input
      const prevInput = document.getElementById(`slot-input-${idx - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
        // Clear previous input
        setSlots((prev) =>
          prev.map((s) => (s.index === idx - 1 ? { ...s, userChar: "" } : s))
        );
      }
    }
  };

  const currentGuess = slots.map((s) => s.userChar || " ").join("");

  const handleCheck = () => {
    if (!currentQuestion || hasAnswered) return;
    const isCorrect =
      normalizeAnswer(currentGuess) === normalizeAnswer(currentQuestion.term);
    recordAnswer(currentQuestion.id, currentQuestion.term, currentGuess, isCorrect);
    timer.pause();
  };

  const handleSkip = () => {
    if (!currentQuestion || hasAnswered) return;
    recordAnswer(currentQuestion.id, currentQuestion.term, "", false);
    timer.pause();
  };

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
          if (activityType === "V3") setDifficulty(null);
          resetSession();
        }}
      />
    );
  }

  // Hints button should be enabled if we are in V1 or difficulty is easy/medium, and hints are available
  const canUseHints =
    !hasAnswered &&
    difficulty !== "hard" &&
    slots.some((s) => !s.isRevealed);

  return (
    <ActivityLayout>
      <GameHeader
        currentIndex={currentIndex}
        totalCards={totalQuestions}
        secondsLeft={timer.secondsLeft}
        activityName={
          activityType === "V3"
            ? `V3 • Letter Fill (${difficulty ? difficulty.toUpperCase() : ""})`
            : activityType === "V1"
              ? "V1 • Letter Fill (Hints)"
              : "V2 • Letter Fill (No Hints)"
        }
        vocabSetTitle={vocabSet?.title || "Vocabulary Set"}
        onExit={() => navigate("/dashboard")}
      />

      <div className="flex-1 flex flex-col items-center justify-center py-6 space-y-6">
        {/* Clue/Definition Card */}
        <Card className="w-full max-w-lg p-6 bg-secondary/10 border border-border flex flex-col items-center text-center space-y-4">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            {currentQuestion?.partOfSpeech}
          </span>
          <p className="text-lg font-bold text-foreground leading-relaxed">
            {currentQuestion?.definition}
          </p>
          {currentQuestion?.exampleSentence && (
            <p className="text-sm text-muted-foreground italic">
              "{currentQuestion.exampleSentence}"
            </p>
          )}
        </Card>

        {/* Letter Slots */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-4">
          {slots.map((slot) => {
            const isReadonly = slot.isRevealed || hasAnswered;

            return (
              <div key={slot.index} className="flex flex-col items-center">
                <input
                  id={`slot-input-${slot.index}`}
                  value={slot.userChar}
                  readOnly={isReadonly}
                  onChange={(e) => handleCharChange(slot.index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(slot.index, e)}
                  disabled={hasAnswered}
                  className={cn(
                    "w-10 h-12 text-center text-lg font-bold border-2 rounded-xl focus:border-primary focus:outline-none transition-all uppercase",
                    slot.isRevealed
                      ? "bg-secondary text-muted-foreground border-transparent font-semibold shadow-inner"
                      : "bg-input border-border text-foreground focus:ring-2 focus:ring-primary/20",
                    hasAnswered && "bg-muted cursor-not-allowed opacity-50"
                  )}
                  maxLength={1}
                />
              </div>
            );
          })}
        </div>

        {/* Hint button */}
        {difficulty !== "hard" && (
          <Button
            variant="outline"
            disabled={!canUseHints}
            onClick={handleRevealLetter}
            className="gap-1.5 cursor-pointer"
          >
            <Lightbulb size={16} className={canUseHints ? "text-yellow-500" : ""} />
            <span>Hint {hintsUsedThisItem > 0 ? `(${hintsUsedThisItem})` : ""}</span>
          </Button>
        )}

        {hasAnswered && (
          <div className="w-full max-w-sm">
            {isAnswerCorrect ? (
              <CorrectAnimation />
            ) : (
              <WrongAnimation correctAnswerText={currentQuestion?.term} />
            )}
          </div>
        )}
      </div>

      <GameFooter
        hasAnswered={hasAnswered}
        onNext={nextQuestion}
        onSkip={handleSkip}
        onSubmit={handleCheck}
        submitDisabled={slots.some((s) => !s.userChar)}
        isLast={currentIndex === totalQuestions - 1}
      />
    </ActivityLayout>
  );
};
