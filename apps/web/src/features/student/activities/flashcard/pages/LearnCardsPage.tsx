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

export default function LearnCardsPage() {
  const { vocabSetId, assignmentId } = useParams<{ vocabSetId: string; assignmentId: string }>();
  const navigate = useNavigate();
  const { assignment, vocabSet, vocabItems, isLoading } = useFlashcardDeck(assignmentId, vocabSetId);
  const result = useActivityResult(assignment, vocabItems);

  const session = useFlashcardSession(vocabItems, {
    isAutoPlayMode: true,
    autoPlayInterval: 3000,
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
          session.resetSession();
        }}
        onExit={() => navigate("/dashboard")}
      />
    );
  }

  const currentCard = session.currentItem;

  return (
    <div className="min-h-[500px] flex flex-col justify-between py-6 px-4 space-y-8 select-none">
      {/* Top progress */}
      <DeckProgress
        currentIndex={session.currentIndex}
        totalCards={session.totalCards}
        activityName="A1 • Learn Cards"
        vocabSetTitle={vocabSet?.title ?? "Vocabulary Set"}
        onBackClick={() => navigate(-1)}
      />

      {/* Main Study Card */}
      {currentCard && (
        <div className="flex-1 flex items-center justify-center py-4">
          <FlashCard
            item={currentCard}
            isFlipped={session.autoPlayStep === "definition"}
            onFlip={() => {}} // Read-only autoplay in A1, clicking has no flip effect
          />
        </div>
      )}

      {/* Bottom Controls */}
      <FlashcardControls
        onNext={session.nextCard}
        onPrev={session.prevCard}
        disabledNext={session.currentIndex === session.totalCards - 1}
        disabledPrev={session.currentIndex === 0}
        showAutoPlay
        isPlaying={session.isPlaying}
        onPlayToggle={() => session.setIsPlaying((prev) => !prev)}
      />
    </div>
  );
}
