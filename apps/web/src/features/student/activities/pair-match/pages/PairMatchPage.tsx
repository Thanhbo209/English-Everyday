import type { FC } from "react";
import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlashcardDeck } from "@/features/student/activities/flashcard";
import { useGameSession } from "@/features/student/activities/shared/hooks/useGameSession";
import { useGameTimer } from "@/features/student/activities/shared/hooks/useGameTimer";
import { useSubmission } from "@/features/student/activities/shared/hooks/useSubmission";
import { shuffleLetters } from "@/features/student/activities/shared/utils/shuffleLetters";
import {
  ActivityLayout,
  GameHeader,
  LoadingGame,
  EmptyGame,
  SessionSummary,
} from "@/features/student/activities/shared/components";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/utils";

interface PairMatchPageProps {
  activityType: "O1" | "O2";
}

interface MemoryCard {
  id: string; // unique card id: e.g. term-id or match-id
  vocabItemId: string;
  type: "term" | "match";
  content: string; // text or image url
}

export const PairMatchPage: FC<PairMatchPageProps> = ({ activityType }) => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const { vocabSet, vocabItems, isLoading } = useFlashcardDeck(assignmentId);
  const submission = useSubmission(assignmentId);

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]); // holds unique card IDs
  const [matched, setMatched] = useState<string[]>([]); // holds vocab item IDs that are matched

  const [retryCount, setRetryCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStats, setSessionStats] = useState<any>(null);

  const questions = useMemo(() => {
    if (!vocabItems) return [];
    // Memory card grid is limited to 6 pairs (12 cards) at once to fit nicely on mobile.
    // If there are more items, we take a random slice of 6.
    const shuffledItems = shuffleLetters(vocabItems);
    return shuffledItems.slice(0, 6).map((item) => ({
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
    durationSeconds: 120, // 2 minutes for memory
    onTimeout: () => {
      // Auto-submit remaining
      questions.forEach((q) => {
        if (!matched.includes(q.id)) {
          recordAnswer(q.id, q.term, "", false);
        }
      });
    },
    autoStart: !showSummary && !isLoading && !!vocabItems && vocabItems.length > 0,
  });

  // Initialize Memory Cards
  useEffect(() => {
    if (questions.length > 0) {
      const generatedCards: MemoryCard[] = [];
      questions.forEach((q) => {
        generatedCards.push({
          id: `term-${q.id}`,
          vocabItemId: q.id,
          type: "term",
          content: q.term,
        });

        generatedCards.push({
          id: `match-${q.id}`,
          vocabItemId: q.id,
          type: "match",
          content: activityType === "O1" ? (q.imageUrl || "") : q.definition,
        });
      });

      setCards(shuffleLetters(generatedCards));
      setFlipped([]);
      setMatched([]);
    }
  }, [questions]);

  // Check matching cards when flipped reaches 2
  useEffect(() => {
    if (flipped.length === 2) {
      const cardA = cards.find((c) => c.id === flipped[0]);
      const cardB = cards.find((c) => c.id === flipped[1]);

      if (cardA && cardB) {
        if (cardA.vocabItemId === cardB.vocabItemId) {
          // Correct match!
          setMatched((prev) => [...prev, cardA.vocabItemId]);
          recordAnswer(cardA.vocabItemId, cardA.content, cardB.content, true);
          setFlipped([]);
        } else {
          // Incorrect match
          recordAnswer(cardA.vocabItemId, cardA.content, cardB.content, false);
          setTimeout(() => {
            setFlipped([]);
          }, 1000);
        }
      }
    }
  }, [flipped]);

  // Check game completion when all items match
  const allMatched = useMemo(() => {
    if (questions.length === 0) return false;
    return matched.length === questions.length;
  }, [matched, questions]);

  useEffect(() => {
    if (allMatched && !isCompleted) {
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
          resetSession();
        }}
      />
    );
  }

  const handleCardClick = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    // Prevent clicking matched cards, already flipped cards, or when 2 cards are already showing
    if (
      matched.includes(card.vocabItemId) ||
      flipped.includes(cardId) ||
      flipped.length >= 2
    ) {
      return;
    }

    setFlipped((prev) => [...prev, cardId]);
  };

  return (
    <ActivityLayout>
      <GameHeader
        currentIndex={matched.length}
        totalCards={totalQuestions}
        secondsLeft={timer.secondsLeft}
        activityName={
          activityType === "O1" ? "O1 • Pair Match (Word ↔ Image)" : "O2 • Pair Match (Word ↔ Meaning)"
        }
        vocabSetTitle={vocabSet?.title || "Vocabulary Set"}
        onExit={() => navigate("/dashboard")}
      />

      <div className="flex-1 flex items-center justify-center py-6">
        {/* Responsive Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-2xl w-full">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.vocabItemId);
            const isCardMatched = matched.includes(card.vocabItemId);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className="aspect-square relative cursor-pointer select-none perspective-[1000px]"
              >
                {/* 3D Card container */}
                <motion.div
                  className="w-full h-full rounded-xl transition-all duration-500 transform-style-3d border-2 border-border/80 shadow-sm"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Card Front (Face down / question mark) */}
                  <div
                    className="absolute inset-0 bg-primary/10 hover:bg-primary/15 flex items-center justify-center font-black text-primary/60 text-2xl rounded-lg"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    ?
                  </div>

                  {/* Card Back (Face up / content) */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-card flex items-center justify-center text-center p-2 font-bold text-xs md:text-sm rounded-lg overflow-hidden leading-tight border-primary/20",
                      isCardMatched ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" : "text-foreground"
                    )}
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {card.type === "match" && activityType === "O1" && card.content ? (
                      <img
                        src={card.content}
                        alt="vocab"
                        className="h-full w-full object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-ellipsis overflow-hidden line-clamp-4">
                        {card.content}
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border mt-auto">
        <span className="text-xs font-semibold text-muted-foreground">
          Pairs matched: {matched.length} / {totalQuestions}
        </span>
      </div>
    </ActivityLayout>
  );
};
