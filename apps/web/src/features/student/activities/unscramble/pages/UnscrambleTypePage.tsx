import type { FC } from "react";
import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlashcardDeck } from "@/features/student/activities/flashcard";
import { useGameSession } from "@/features/student/activities/shared/hooks/useGameSession";
import { useGameTimer } from "@/features/student/activities/shared/hooks/useGameTimer";
import { useSubmission } from "@/features/student/activities/shared/hooks/useSubmission";
import { scrambleWord } from "@/features/student/activities/shared/utils/scrambleWord";
import { normalizeAnswer } from "@/features/student/activities/shared/utils/normalizeAnswer";
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
import { Input, Card } from "@/shared/components";

export const UnscrambleTypePage: FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  // Load Vocab items
  const { vocabSet, vocabItems, isLoading } = useFlashcardDeck(assignmentId);

  // Submission mutation
  const submission = useSubmission(assignmentId);

  // States
  const [userTyped, setUserTyped] = useState("");
  
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStats, setSessionStats] = useState<any>(null);

  // Map to GameQuestion structure
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

  // Game session hook
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
              activityType: "U1",
              total: session.answers.length,
              correct: session.score,
              wrong: session.answers.length - session.score,
              answersMeta: session.answers,
            },
          });
        } catch {
          // Fallback to showing summary anyway
        }
      }
      setShowSummary(true);
    },
  });

  // Countdown timer hook (e.g. 30 seconds per item)
  const timer = useGameTimer({
    durationSeconds: 30,
    onTimeout: () => {
      if (!hasAnswered && currentQuestion) {
        recordAnswer(currentQuestion.id, currentQuestion.term, "", false);
      }
    },
    autoStart: !showSummary && !isLoading && !!currentQuestion,
  });

  // Scrambled version of current word
  const scrambledWord = useMemo(() => {
    if (!currentQuestion) return "";
    return scrambleWord(currentQuestion.term);
  }, [currentQuestion]);

  // Reset timer on question advance
  useEffect(() => {
    if (currentQuestion) {
      timer.reset(30);
      setUserTyped("");
    }
  }, [currentIndex, currentQuestion]);

  if (isLoading) return <LoadingGame />;
  if (!vocabItems || vocabItems.length === 0) {
    return <EmptyGame onExit={() => navigate("/dashboard")} />;
  }

  const handleCheck = () => {
    if (!currentQuestion || hasAnswered) return;
    const isCorrect =
      normalizeAnswer(userTyped) === normalizeAnswer(currentQuestion.term);
    recordAnswer(currentQuestion.id, currentQuestion.term, userTyped, isCorrect);
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
          
          setShowSummary(false);
          setSessionStats(null);
          resetSession();
        }}
      />
    );
  }

  return (
    <ActivityLayout>
      <GameHeader
        currentIndex={currentIndex}
        totalCards={totalQuestions}
        secondsLeft={timer.secondsLeft}
        activityName="U1 • Unscramble (Type)"
        vocabSetTitle={vocabSet?.title || "Vocabulary Set"}
        onExit={() => navigate("/dashboard")}
      />

      <div className="flex-1 flex flex-col items-center justify-center py-6 space-y-6">
        {/* Definition/Clue card */}
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

        {/* Scrambled Word Tiles */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {scrambledWord.split("").map((letter, idx) => (
            <div
              key={idx}
              className="w-12 h-12 flex items-center justify-center text-xl font-bold bg-primary/10 text-primary border-2 border-primary/20 rounded-xl shadow-sm select-none animate-fade-in"
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Input box */}
        <div className="w-full max-w-sm">
          {!hasAnswered ? (
            <Input
              id="unscramble-input"
              value={userTyped}
              onChange={(e) => setUserTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && userTyped.trim()) {
                  handleCheck();
                }
              }}
              placeholder="Type unscrambled word..."
              className="text-center font-bold text-lg h-12"
              autoFocus
            />
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
        onSubmit={handleCheck}
        submitDisabled={!userTyped.trim()}
        isLast={currentIndex === totalQuestions - 1}
      />
    </ActivityLayout>
  );
};
