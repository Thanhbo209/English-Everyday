import type { FC } from "react";
import { useState, useMemo, useEffect, useRef } from "react";
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
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/utils";

interface ConnectPageProps {
  activityType: "C1" | "C2";
}

interface Connection {
  id: string; // vocab item id
  leftId: string;
  rightId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isCorrect: boolean;
}

export const ConnectPage: FC<ConnectPageProps> = ({ activityType }) => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const { vocabSet, vocabItems, isLoading } = useFlashcardDeck(assignmentId);
  const submission = useSubmission(assignmentId);

  const containerRef = useRef<HTMLDivElement>(null);

  const [leftSide, setLeftSide] = useState<MatchPair[]>([]);
  const [rightSide, setRightSide] = useState<MatchPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null); // leftId
  const [selectedRight, setSelectedRight] = useState<string | null>(null); // rightId

  const [connections, setConnections] = useState<Connection[]>([]);
  
  const [shakeIds, setShakeIds] = useState<string[]>([]); // connection vocab IDs that shook

  const [retryCount, setRetryCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStats, setSessionStats] = useState<any>(null);

  const questions = useMemo(() => {
    if (!vocabItems) return [];
    // Limit to 5 pairs for optimal display and layout
    const slice = vocabItems.slice(0, 5);
    return slice.map((item) => ({
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
    durationSeconds: 90,
    onTimeout: () => {
      // Auto-submit remaining
      questions.forEach((q) => {
        const hasConn = connections.some((c) => c.id === q.id && c.isCorrect);
        if (!hasConn) {
          recordAnswer(q.id, q.term, "", false);
        }
      });
    },
    autoStart: !showSummary && !isLoading && !!vocabItems && vocabItems.length > 0,
  });

  // Generate lists
  useEffect(() => {
    if (questions.length > 0) {
      const type = activityType === "C1" ? "image" : "meaning";
      const { leftSide: lSide, rightSide: rSide } = generateMatchingPairs(questions, type);
      setLeftSide(lSide);
      setRightSide(rSide);
      setConnections([]);
      
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }, [questions]);

  // Recalculate coordinates helper
  const getCoordinates = (id: string, side: "left" | "right") => {
    const el = document.getElementById(`dot-${side}-${id}`);
    const container = containerRef.current;
    if (!el || !container) return { x: 0, y: 0 };

    const rect = el.getBoundingClientRect();
    const parentRect = container.getBoundingClientRect();

    return {
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top + rect.height / 2,
    };
  };

  // Recalculate lines when resizing or rendering changes
  const updateConnectionCoordinates = () => {
    setConnections((prev) =>
      prev.map((conn) => {
        const pt1 = getCoordinates(conn.leftId, "left");
        const pt2 = getCoordinates(conn.rightId, "right");
        return {
          ...conn,
          x1: pt1.x,
          y1: pt1.y,
          x2: pt2.x,
          y2: pt2.y,
        };
      })
    );
  };

  useEffect(() => {
    window.addEventListener("resize", updateConnectionCoordinates);
    // Trigger coordinates update once DOM has stabilized
    const timer = setTimeout(updateConnectionCoordinates, 200);
    return () => {
      window.removeEventListener("resize", updateConnectionCoordinates);
      clearTimeout(timer);
    };
  }, [leftSide, rightSide, connections.length]);

  // Handle clicking left card
  const handleLeftClick = (leftId: string) => {
    const card = leftSide.find((c) => c.leftId === leftId);
    if (!card || card.isMatched) return;

    setSelectedLeft(leftId);

    // If right was already selected, make temporary line
    
  };

  // Handle clicking right card
  const handleRightClick = (rightId: string) => {
    const card = rightSide.find((c) => c.rightId === rightId);
    if (!card || card.isMatched || !selectedLeft) return;

    setSelectedRight(rightId);

    const leftCard = leftSide.find((c) => c.leftId === selectedLeft);
    if (!leftCard) return;

    const pt1 = getCoordinates(selectedLeft, "left");
    const pt2 = getCoordinates(rightId, "right");

    const isCorrect = leftCard.id === card.id;

    const newConnection: Connection = {
      id: leftCard.id,
      leftId: selectedLeft,
      rightId,
      x1: pt1.x,
      y1: pt1.y,
      x2: pt2.x,
      y2: pt2.y,
      isCorrect,
    };

    if (isCorrect) {
      setConnections((prev) => [...prev, newConnection]);
      setLeftSide((prev) =>
        prev.map((c) => (c.leftId === selectedLeft ? { ...c, isMatched: true } : c))
      );
      setRightSide((prev) =>
        prev.map((c) => (c.rightId === rightId ? { ...c, isMatched: true } : c))
      );
      recordAnswer(leftCard.id, leftCard.leftVal, card.rightVal, true);

      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Shaking animation / temporary incorrect connection
      setConnections((prev) => [...prev, newConnection]);
      setShakeIds((prev) => [...prev, leftCard.id]);
      recordAnswer(leftCard.id, leftCard.leftVal, card.rightVal, false);

      setSelectedLeft(null);
      setSelectedRight(null);

      setTimeout(() => {
        // Remove the connection and shake state
        setConnections((prev) => prev.filter((c) => c.id !== leftCard.id));
        setShakeIds((prev) => prev.filter((id) => id !== leftCard.id));
      }, 800);
    }
  };

  // Check if all matched
  const allMatched = useMemo(() => {
    if (leftSide.length === 0) return false;
    return leftSide.every((c) => c.isMatched);
  }, [leftSide]);

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

  const matchedCount = leftSide.filter((c) => c.isMatched).length;

  return (
    <ActivityLayout>
      <GameHeader
        currentIndex={matchedCount}
        totalCards={totalQuestions}
        secondsLeft={timer.secondsLeft}
        activityName={
          activityType === "C1" ? "C1 • Connect Word ↔ Image" : "C2 • Connect Word ↔ Meaning"
        }
        vocabSetTitle={vocabSet?.title || "Vocabulary Set"}
        onExit={() => navigate("/dashboard")}
      />

      <div ref={containerRef} className="flex-1 grid grid-cols-2 gap-20 items-center py-6 relative">
        {/* SVG Canvas for drawing lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {connections.map((conn) => {
            const isShaking = shakeIds.includes(conn.id);
            return (
              <motion.line
                key={conn.id}
                x1={conn.x1}
                y1={conn.y1}
                x2={conn.x2}
                y2={conn.y2}
                stroke={conn.isCorrect ? "var(--color-emerald-500, #10b981)" : "var(--color-destructive, #ef4444)"}
                strokeWidth={isShaking ? 4 : 3}
                animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
              />
            );
          })}
        </svg>

        {/* Left Column */}
        <div className="flex flex-col gap-6 z-20">
          {leftSide.map((card) => {
            const isSelected = selectedLeft === card.leftId;
            return (
              <div
                key={card.leftId}
                onClick={() => handleLeftClick(card.leftId)}
                className={cn(
                  "h-16 px-4 flex items-center justify-between border-2 rounded-2xl cursor-pointer select-none transition-all shadow-sm text-sm font-bold bg-card relative",
                  card.isMatched && "opacity-50 pointer-events-none border-emerald-500/30 bg-emerald-500/5 text-emerald-700",
                  isSelected && "border-primary scale-105"
                )}
              >
                <span>{card.leftVal}</span>
                {/* Connector Dot */}
                <div
                  id={`dot-left-${card.leftId}`}
                  className={cn(
                    "w-3 h-3 rounded-full border border-border bg-muted absolute right-[-7px] top-[calc(50%-6px)]",
                    card.isMatched && "bg-emerald-500 border-emerald-500",
                    isSelected && "bg-primary border-primary animate-ping"
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 z-20">
          {rightSide.map((card) => {
            const isSelected = selectedRight === card.rightId;
            return (
              <div
                key={card.rightId}
                onClick={() => handleRightClick(card.rightId)}
                className={cn(
                  "h-16 px-4 flex items-center justify-start border-2 rounded-2xl cursor-pointer select-none transition-all shadow-sm text-sm font-bold bg-card relative",
                  card.isMatched && "opacity-50 pointer-events-none border-emerald-500/30 bg-emerald-500/5 text-emerald-700",
                  isSelected && "border-primary scale-105"
                )}
              >
                {/* Connector Dot */}
                <div
                  id={`dot-right-${card.rightId}`}
                  className={cn(
                    "w-3 h-3 rounded-full border border-border bg-muted absolute left-[-7px] top-[calc(50%-6px)]",
                    card.isMatched && "bg-emerald-500 border-emerald-500",
                    isSelected && "bg-primary border-primary animate-ping"
                  )}
                />
                <div className="pl-4 w-full text-ellipsis overflow-hidden line-clamp-3">
                  {activityType === "C1" && card.rightVal ? (
                    <img
                      src={card.rightVal}
                      alt="vocab connect"
                      className="h-12 w-12 object-cover rounded-lg"
                    />
                  ) : (
                    card.rightVal
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border mt-auto">
        <span className="text-xs font-semibold text-muted-foreground">
          Connections found: {matchedCount} / {totalQuestions}
        </span>
      </div>
    </ActivityLayout>
  );
};
