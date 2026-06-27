import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlashcardSession } from "../hooks/useFlashcardSession";
import { useFlashcardDeck } from "../hooks/useFlashcardDeck";
import { useActivityResult } from "../hooks/useActivityResult";
import { DeckProgress } from "../components/DeckProgress";
import { FlashCard } from "../components/FlashCard";
import { FlashcardControls } from "../components/FlashcardControls";
import { SessionResult } from "../components/SessionResult";
import { EmptyDeck } from "../components/EmptyDeck";
import { LoadingDeck } from "../components/LoadingDeck";

export default function FlipCardsPage() {
  const { vocabSetId, assignmentId } = useParams<{ vocabSetId: string; assignmentId: string }>();
  const navigate = useNavigate();

  const [isFlipped, setIsFlipped] = useState(false);
  const { assignment, vocabSet, vocabItems, isLoading } = useFlashcardDeck(assignmentId, vocabSetId);
  const result = useActivityResult(assignment, vocabItems);

  const session = useFlashcardSession(vocabItems, {
    onSessionFinish: (stats) => {
      result.finishSession({
        total: stats.total,
        known: stats.total,
        stillLearning: 0,
        accuracy: 100,
      });
    },
  });

  if (isLoading) {
    return <LoadingDeck />;
  }

  if (vocabItems.length === 0) {
    return <EmptyDeck vocabSetTitle={vocabSet?.title} onBackClick={() => navigate(-1)} />;
  }

  if (result.showResults && result.resultsStats) {
    return (
      <SessionResult
        totalUniqueCount={result.resultsStats.total}
        knownCount={result.resultsStats.known}
        stillLearningCount={result.resultsStats.stillLearning}
        accuracyPercent={result.resultsStats.accuracy}
        score={result.resultsStats.score}
        timeTakenSec={result.resultsStats.timeTakenSec}
        onStudyAgain={() => {
          result.resetResults();
          setIsFlipped(false);
          session.resetSession();
        }}
        onExit={() => navigate("/dashboard")}
      />
    );
  }

  const currentCard = session.currentItem;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      session.nextCard();
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      session.prevCard();
    }, 150);
  };

  return (
    <div className="min-h-[500px] flex flex-col justify-between py-6 px-4 space-y-8 select-none">
      {/* Top progress */}
      <DeckProgress
        currentIndex={session.currentIndex}
        totalCards={session.totalCards}
        activityName="A2 • Flip Cards"
        vocabSetTitle={vocabSet?.title ?? "Vocabulary Set"}
        onBackClick={() => navigate(-1)}
      />

      {/* Main Study Card */}
      {currentCard && (
        <div className="flex-1 flex items-center justify-center py-4">
          <FlashCard
            item={currentCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((prev) => !prev)}
          />
        </div>
      )}

      {/* Bottom Controls */}
      <FlashcardControls
        onNext={handleNext}
        onPrev={handlePrev}
        disabledNext={false}
        disabledPrev={session.currentIndex === 0}
      />
    </div>
  );
}
