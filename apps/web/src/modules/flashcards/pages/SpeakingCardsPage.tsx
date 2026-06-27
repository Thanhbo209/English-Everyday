import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlashcardSession } from "../hooks/useFlashcardSession";
import { useSpeechRecorder } from "../hooks/useSpeechRecorder";
import { useFlashcardDeck } from "../hooks/useFlashcardDeck";
import { useActivityResult } from "../hooks/useActivityResult";
import { DeckProgress } from "../components/DeckProgress";
import { FlashCard } from "../components/FlashCard";
import { SpeechRecorder } from "../components/SpeechRecorder";
import { FlashcardControls } from "../components/FlashcardControls";
import { SessionResult } from "../components/SessionResult";
import { EmptyDeck } from "../components/EmptyDeck";
import { LoadingDeck } from "../components/LoadingDeck";

export default function SpeakingCardsPage() {
  const { vocabSetId, assignmentId } = useParams<{ vocabSetId: string; assignmentId: string }>();
  const navigate = useNavigate();

  const [recordings, setRecordings] = useState<Array<{ vocabItemId: string; durationSec: number; hasRecording: boolean }>>([]);
  const { assignment, vocabSet, vocabItems, isLoading } = useFlashcardDeck(assignmentId, vocabSetId);
  const result = useActivityResult(assignment, vocabItems);

  const session = useFlashcardSession(vocabItems, {
    onSessionFinish: (stats) => {
      result.finishSession(
        {
          total: stats.total,
          known: stats.total,
          stillLearning: 0,
          accuracy: 100,
        },
        { recordings },
      );
    },
  });

  const recorder = useSpeechRecorder();

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
          setRecordings([]);
          session.resetSession();
          recorder.clearRecording();
        }}
        onExit={() => navigate("/dashboard")}
      />
    );
  }

  const currentCard = session.currentItem;

  const handleNext = () => {
    let nextRecordings = recordings;
    if (currentCard) {
      nextRecordings = [
        ...recordings.filter((entry) => entry.vocabItemId !== currentCard.id),
        {
          vocabItemId: currentCard.id,
          durationSec: recorder.recordingSeconds,
          hasRecording: Boolean(recorder.audioUrl),
        },
      ];
      setRecordings(nextRecordings);
    }
    recorder.stopRecording();
    recorder.clearRecording();

    if (session.currentIndex === session.totalCards - 1) {
      result.finishSession(
        {
          total: session.totalUniqueCount,
          known: session.totalUniqueCount,
          stillLearning: 0,
          accuracy: 100,
        },
        { recordings: nextRecordings },
      );
      return;
    }

    session.nextCard();
  };

  const handlePrev = () => {
    recorder.stopRecording();
    recorder.clearRecording();
    session.prevCard();
  };

  return (
    <div className="min-h-[500px] flex flex-col justify-between py-6 px-4 space-y-8 select-none">
      {/* Top progress */}
      <DeckProgress
        currentIndex={session.currentIndex}
        totalCards={session.totalCards}
        activityName="A6 • Speaking Practice"
        vocabSetTitle={vocabSet?.title ?? "Vocabulary Set"}
        onBackClick={() => navigate(-1)}
      />

      {/* Card and recorder workspace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto w-full">
        {/* Main Card */}
        {currentCard && (
          <FlashCard
            item={currentCard}
            isFlipped={false} // Front side only for speaking cards
            onFlip={() => {}} // No flipping for speaking practice front face
          />
        )}

        {/* Recorder interface */}
        {currentCard && (
          <SpeechRecorder
            isRecording={recorder.isRecording}
            seconds={recorder.recordingSeconds}
            audioUrl={recorder.audioUrl}
            onStart={recorder.startRecording}
            onStop={recorder.stopRecording}
            targetAudioUrl={currentCard.audioUrl}
          />
        )}
      </div>

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
