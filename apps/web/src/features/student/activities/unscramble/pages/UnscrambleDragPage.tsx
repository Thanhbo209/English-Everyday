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
import { Card } from "@/shared/components";

// dnd-kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  letter: string;
  disabled?: boolean;
}

const SortableLetter: FC<SortableItemProps> = ({ id, letter, disabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-12 h-12 flex items-center justify-center text-xl font-bold bg-primary text-primary-foreground border-2 border-primary/20 rounded-xl shadow-md cursor-grab active:cursor-grabbing select-none transition-all hover:scale-105"
    >
      {letter}
    </div>
  );
};

export const UnscrambleDragPage: FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const { vocabSet, vocabItems, isLoading } = useFlashcardDeck(assignmentId);
  const submission = useSubmission(assignmentId);

  const [letters, setLetters] = useState<Array<{ id: string; char: string }>>([]);
  
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
              activityType: "U2",
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
    durationSeconds: 45, // more time for dragging
    onTimeout: () => {
      if (!hasAnswered && currentQuestion) {
        recordAnswer(currentQuestion.id, currentQuestion.term, "", false);
      }
    },
    autoStart: !showSummary && !isLoading && !!currentQuestion,
  });

  // Initialize scrambled letters list
  useEffect(() => {
    if (currentQuestion) {
      const scrambled = scrambleWord(currentQuestion.term);
      const items = scrambled.split("").map((char, index) => ({
        id: `char-${char}-${index}-${Date.now()}`,
        char,
      }));
      setLetters(items);
      timer.reset(45);
    }
  }, [currentIndex, currentQuestion]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // Allow clicks without dragging immediately
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLetters((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  if (isLoading) return <LoadingGame />;
  if (!vocabItems || vocabItems.length === 0) {
    return <EmptyGame onExit={() => navigate("/dashboard")} />;
  }

  const currentTermGuess = letters.map((l) => l.char).join("");

  const handleCheck = () => {
    if (!currentQuestion || hasAnswered) return;
    const isCorrect =
      normalizeAnswer(currentTermGuess) === normalizeAnswer(currentQuestion.term);
    recordAnswer(
      currentQuestion.id,
      currentQuestion.term,
      currentTermGuess,
      isCorrect
    );
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
        activityName="U2 • Unscramble (Drag & Arrange)"
        vocabSetTitle={vocabSet?.title || "Vocabulary Set"}
        onExit={() => navigate("/dashboard")}
      />

      <div className="flex-1 flex flex-col items-center justify-center py-6 space-y-8">
        {/* Definition/Clue Card */}
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

        {/* Drag and drop letters section */}
        <div className="w-full flex justify-center py-2">
          {!hasAnswered ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={letters.map((l) => l.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-muted/30 border border-dashed border-border rounded-2xl min-h-[80px]">
                  {letters.map((item) => (
                    <SortableLetter
                      key={item.id}
                      id={item.id}
                      letter={item.char}
                      disabled={hasAnswered}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex flex-wrap items-center justify-center gap-3 p-4">
                {letters.map((item) => (
                  <div
                    key={item.id}
                    className="w-12 h-12 flex items-center justify-center text-xl font-bold bg-muted text-muted-foreground border-2 border-border rounded-xl shadow-inner select-none"
                  >
                    {item.char}
                  </div>
                ))}
              </div>
              {isAnswerCorrect ? (
                <CorrectAnimation />
              ) : (
                <WrongAnimation correctAnswerText={currentQuestion?.term} />
              )}
            </div>
          )}
        </div>
      </div>

      <GameFooter
        hasAnswered={hasAnswered}
        onNext={nextQuestion}
        onSkip={handleSkip}
        onSubmit={handleCheck}
        submitDisabled={letters.length === 0}
        isLast={currentIndex === totalQuestions - 1}
      />
    </ActivityLayout>
  );
};
