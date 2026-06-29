import type { FC } from "react";
import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlashcardDeck } from "@/features/student/activities/flashcard";
import { useGameSession } from "@/features/student/activities/shared/hooks/useGameSession";
import { useSubmission } from "@/features/student/activities/shared/hooks/useSubmission";
import { generateHangmanState } from "@/features/student/activities/shared/utils/generateHangmanState";
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
import { Card } from "@/shared/components";

import { cn } from "@/shared/utils/utils";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const HangmanPage: FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const { vocabSet, vocabItems, isLoading } = useFlashcardDeck(assignmentId);
  const submission = useSubmission(assignmentId);

  // Hangman specific state per vocab item
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [livesLeft, setLivesLeft] = useState(6);

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
  }, [vocabItems, retryCount]);

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
              activityType: "H1",
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

  const wordToGuess = useMemo(() => {
    if (!currentQuestion) return "";
    return currentQuestion.term.trim().toUpperCase();
  }, [currentQuestion]);

  // Clean letters needed to win (ignoring spaces/punctuation)
  const lettersNeeded = useMemo(() => {
    const cleanLetters = wordToGuess.replace(/[^A-Z]/g, "");
    return Array.from(new Set(cleanLetters.split("")));
  }, [wordToGuess]);

  // Check win/loss state for current word
  const wordWon = useMemo(() => {
    if (lettersNeeded.length === 0) return false;
    return lettersNeeded.every((l) => guessedLetters.includes(l));
  }, [lettersNeeded, guessedLetters]);

  const wordLost = useMemo(() => {
    return livesLeft <= 0;
  }, [livesLeft]);

  // Reset hangman state for next question
  useEffect(() => {
    if (currentQuestion) {
      const state = generateHangmanState(currentQuestion.term, 6);
      setGuessedLetters(state.guessedLetters);
      setLivesLeft(state.livesLeft);
    }
  }, [currentIndex, currentQuestion]);

  // Automatically record answer in session when item wins or loses
  useEffect(() => {
    if (currentQuestion && !hasAnswered) {
      if (wordWon) {
        recordAnswer(currentQuestion.id, currentQuestion.term, wordToGuess, true);
      } else if (wordLost) {
        recordAnswer(currentQuestion.id, currentQuestion.term, guessedLetters.join(","), false);
      }
    }
  }, [wordWon, wordLost, currentQuestion, hasAnswered]);

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
          resetSession();
        }}
      />
    );
  }

  const handleGuess = (letter: string) => {
    if (hasAnswered || guessedLetters.includes(letter)) return;

    setGuessedLetters((prev) => [...prev, letter]);
    if (!wordToGuess.includes(letter)) {
      setLivesLeft((prev) => Math.max(0, prev - 1));
    }
  };

  const handleSkip = () => {
    if (hasAnswered) return;
    recordAnswer(currentQuestion!.id, currentQuestion!.term, "", false);
  };

  const mistakesCount = 6 - livesLeft;

  return (
    <ActivityLayout>
      <GameHeader
        currentIndex={currentIndex}
        totalCards={totalQuestions}
        secondsLeft={0}
        activityName="H1 • Hangman Challenge"
        vocabSetTitle={vocabSet?.title || "Vocabulary Set"}
        onExit={() => navigate("/dashboard")}
        showTimer={false}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center py-6">
        {/* Visual Hangman Canvas (Mistakes drawing) */}
        <div className="w-full max-w-[240px] aspect-square border border-border bg-secondary/10 rounded-2xl flex items-center justify-center p-4 relative">
          <svg className="w-full h-full stroke-foreground fill-none stroke-[3] stroke-linecap-round">
            {/* Gallows base */}
            <line x1="20" y1="180" x2="160" y2="180" />
            <line x1="60" y1="180" x2="60" y2="20" />
            <line x1="60" y1="20" x2="130" y2="20" />
            <line x1="130" y1="20" x2="130" y2="45" />

            {/* Mistake 1: Rope / noose loop */}
            {mistakesCount >= 1 && (
              <circle cx="130" cy="55" r="10" stroke="var(--color-amber-500, #f59e0b)" />
            )}

            {/* Mistake 2: Head */}
            {mistakesCount >= 2 && <circle cx="130" cy="73" r="8" />}

            {/* Mistake 3: Body / Torso */}
            {mistakesCount >= 3 && <line x1="130" y1="81" x2="130" y2="120" />}

            {/* Mistake 4: Left Arm */}
            {mistakesCount >= 4 && <line x1="130" y1="95" x2="115" y2="105" />}

            {/* Mistake 5: Right Arm */}
            {mistakesCount >= 5 && <line x1="130" y1="95" x2="145" y2="105" />}

            {/* Mistake 6: Legs */}
            {mistakesCount >= 6 && (
              <>
                <line x1="130" y1="120" x2="115" y2="140" />
                <line x1="130" y1="120" x2="145" y2="140" />
              </>
            )}
          </svg>
          <span className="absolute top-3 right-4 text-xs font-bold bg-muted px-2.5 py-1 rounded-full text-foreground/80">
            Lives: {livesLeft}
          </span>
        </div>

        {/* Game State Panel */}
        <div className="flex-1 w-full flex flex-col items-center gap-6">
          {/* Definition hint */}
          <Card className="w-full p-4 bg-secondary/15 border border-border text-center space-y-1.5">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Clue</span>
            <p className="text-sm font-semibold text-foreground leading-snug">
              {currentQuestion?.definition}
            </p>
          </Card>

          {/* Word Blanks */}
          <div className="flex flex-wrap gap-2 justify-center py-2">
            {wordToGuess.split("").map((char, idx) => {
              const isSpecial = char === " " || char === "-" || char === "'";
              const isRevealed = guessedLetters.includes(char) || isSpecial || wordLost;

              return (
                <div
                  key={idx}
                  className={cn(
                    "w-8 h-10 border-b-2 flex items-center justify-center font-bold text-lg select-none",
                    isSpecial ? "border-transparent" : "border-foreground/40",
                    isRevealed && !isSpecial && "text-primary border-primary",
                    wordLost && !guessedLetters.includes(char) && "text-destructive border-destructive"
                  )}
                >
                  {isRevealed ? char : ""}
                </div>
              );
            })}
          </div>

          {/* Keyboard input */}
          {!hasAnswered ? (
            <div className="grid grid-cols-7 gap-1.5 max-w-sm w-full">
              {ALPHABET.map((letter) => {
                const isGuessed = guessedLetters.includes(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => handleGuess(letter)}
                    disabled={isGuessed}
                    className={cn(
                      "aspect-square flex items-center justify-center font-extrabold text-xs rounded-lg border transition-all select-none cursor-pointer",
                      isGuessed
                        ? "bg-secondary text-muted-foreground border-transparent cursor-not-allowed opacity-50"
                        : "bg-card border-border text-foreground hover:bg-secondary/40"
                    )}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ) : isAnswerCorrect ? (
            <CorrectAnimation />
          ) : (
            <WrongAnimation correctAnswerText={currentQuestion?.term} />
          )}
        </div>
      </div>

      <GameFooter
        hasAnswered={hasAnswered}
        onNext={nextQuestion}
        onSkip={handleSkip}
        isLast={currentIndex === totalQuestions - 1}
      />
    </ActivityLayout>
  );
};
