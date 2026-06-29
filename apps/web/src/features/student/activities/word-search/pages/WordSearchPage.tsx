import type { FC } from "react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFlashcardDeck } from "@/features/student/activities/flashcard";
import { useGameTimer } from "@/features/student/activities/shared/hooks/useGameTimer";
import { useSubmission } from "@/features/student/activities/shared/hooks/useSubmission";
import { api } from "@/shared/api/axios";
import {
  ActivityLayout,
  GameHeader,
  LoadingGame,
  EmptyGame,
  SessionSummary,
} from "@/features/student/activities/shared/components";
import { Card } from "@/shared/components";
import { cn } from "@/shared/utils/utils";

interface WordSearchWord {
  word: string;
  clue: string;
  found: boolean;
}

export const WordSearchPage: FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const { vocabSet, isLoading: loadingDeck } = useFlashcardDeck(assignmentId);
  const submission = useSubmission(assignmentId);

  const gridContainerRef = useRef<HTMLDivElement>(null);

  // States
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<WordSearchWord[]>([]);
  const [loadingGrid, setLoadingGrid] = useState(true);
  const [error, setError] = useState("");

  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState<{ r: number; c: number } | null>(null);
  const [endCell, setEndCell] = useState<{ r: number; c: number } | null>(null);

  // Permanently found cell keys "r-c" mapping to color index or true
  const [foundCells, setFoundCells] = useState<Record<string, boolean>>({});

  const [retryCount, setRetryCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStats, setSessionStats] = useState<any>(null);

  const timer = useGameTimer({
    durationSeconds: 180, // 3 minutes for word search
    onTimeout: () => {
      handleComplete();
    },
    autoStart: !showSummary && !loadingDeck && !loadingGrid && grid.length > 0,
  });

  // Fetch word search grid
  useEffect(() => {
    if (vocabSet?.id) {
      setLoadingGrid(true);
      setError("");
      api
        .get(`/activities/w1/${vocabSet.id}/grid`)
        .then((res) => {
          setGrid(res.data.grid);
          setWords(res.data.words);
          setFoundCells({});
          setLoadingGrid(false);
        })
        .catch((err) => {
          setError(err.response?.data?.message ?? "Failed to load word search grid.");
          setLoadingGrid(false);
        });
    }
  }, [vocabSet?.id, retryCount]);

  // Compute selected cells along the line from startCell to endCell
  const selectedCells = useMemo(() => {
    if (!startCell || !endCell) return [];

    const cells: { r: number; c: number }[] = [];
    const dr = endCell.r - startCell.r;
    const dc = endCell.c - startCell.c;

    // Check if horizontal, vertical, or 45-degree diagonal
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    if (dr === 0 || dc === 0 || absDr === absDc) {
      const steps = Math.max(absDr, absDc);
      const stepR = dr === 0 ? 0 : dr / absDr;
      const stepC = dc === 0 ? 0 : dc / absDc;

      for (let i = 0; i <= steps; i++) {
        cells.push({
          r: startCell.r + stepR * i,
          c: startCell.c + stepC * i,
        });
      }
    }

    return cells;
  }, [startCell, endCell]);

  const selectedWordText = useMemo(() => {
    if (selectedCells.length === 0) return "";
    return selectedCells.map((cell) => grid[cell.r]?.[cell.c] || "").join("");
  }, [selectedCells, grid]);

  // Check game completion when all words found
  const allFound = useMemo(() => {
    if (words.length === 0) return false;
    return words.every((w) => w.found);
  }, [words]);

  const handleComplete = async () => {
    timer.pause();
    const correctCount = words.filter((w) => w.found).length;
    const totalCount = words.length;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    const stats = {
      score: correctCount,
      accuracy,
      timeTakenSec: timer.timeElapsed,
      answers: words.map((w) => ({
        vocabItemId: w.word,
        term: w.word,
        isCorrect: w.found,
        userResponse: w.found ? w.word : "",
      })),
    };

    setSessionStats(stats);

    if (assignmentId) {
      try {
        await submission.mutateAsync({
          score: stats.score,
          accuracy: stats.accuracy,
          timeTakenSec: stats.timeTakenSec,
          answers: {
            activityType: "W1",
            total: totalCount,
            correct: correctCount,
            wrong: totalCount - correctCount,
            answersMeta: stats.answers,
          },
        });
      } catch {
        // Ignore
      }
    }
    setShowSummary(true);
  };

  useEffect(() => {
    if (allFound && grid.length > 0 && !showSummary) {
      handleComplete();
    }
  }, [allFound, grid.length]);

  if (loadingDeck || loadingGrid) return <LoadingGame />;
  if (error || !grid || grid.length === 0) {
    return <EmptyGame message={error} onExit={() => navigate("/dashboard")} />;
  }

  if (showSummary && sessionStats) {
    return (
      <SessionSummary
        total={words.length}
        correct={sessionStats.score}
        wrong={words.length - sessionStats.score}
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
        }}
      />
    );
  }

  // Selection start
  const handleCellStart = (r: number, c: number) => {
    setIsSelecting(true);
    setStartCell({ r, c });
    setEndCell({ r, c });
  };

  // Selection move
  const handleCellEnter = (r: number, c: number) => {
    if (isSelecting) {
      setEndCell({ r, c });
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (r: number, c: number) => {
    handleCellStart(r, c);
  };

  const handleTouchMove = (e: any) => {
    if (!isSelecting) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const dataCell = element.getAttribute("data-cell");
    if (dataCell) {
      const [rStr, cStr] = dataCell.split(",");
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (!isNaN(r) && !isNaN(c)) {
        setEndCell({ r, c });
      }
    }
  };

  // Selection check
  const handleSelectionEnd = () => {
    if (!isSelecting) return;
    setIsSelecting(false);

    const normalWord = selectedWordText;
    const reversedWord = selectedWordText.split("").reverse().join("");

    let foundMatch = false;

    setWords((prev) =>
      prev.map((w) => {
        if (!w.found && (w.word === normalWord || w.word === reversedWord)) {
          foundMatch = true;
          return { ...w, found: true };
        }
        return w;
      })
    );

    if (foundMatch) {
      // Mark cells permanently found
      const newFound = { ...foundCells };
      selectedCells.forEach((cell) => {
        newFound[`${cell.r}-${cell.c}`] = true;
      });
      setFoundCells(newFound);
    }

    setStartCell(null);
    setEndCell(null);
  };

  const foundCount = words.filter((w) => w.found).length;

  return (
    <ActivityLayout className="max-w-5xl">
      <GameHeader
        currentIndex={foundCount}
        totalCards={words.length}
        secondsLeft={timer.secondsLeft}
        activityName="W1 • Word Search Grid"
        vocabSetTitle={vocabSet?.title || "Vocabulary Set"}
        onExit={() => navigate("/dashboard")}
      />

      <div
        className="flex-1 flex flex-col md:flex-row gap-6 py-6 items-center md:items-start"
        onMouseUp={handleSelectionEnd}
        onTouchEnd={handleSelectionEnd}
      >
        {/* Word Search Grid */}
        <div
          ref={gridContainerRef}
          onTouchMove={handleTouchMove}
          className="grid gap-1 p-2 bg-secondary/15 rounded-2xl border border-border/80 select-none w-full max-w-[480px] aspect-square"
          style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}
        >
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const isFound = foundCells[`${r}-${c}`];
              const isSelected = selectedCells.some((cell) => cell.r === r && cell.c === c);

              return (
                <div
                  key={`${r}-${c}`}
                  data-cell={`${r},${c}`}
                  onMouseDown={() => handleCellStart(r, c)}
                  onMouseEnter={() => handleCellEnter(r, c)}
                  onTouchStart={() => handleTouchStart(r, c)}
                  className={cn(
                    "flex items-center justify-center font-bold text-sm md:text-base aspect-square rounded-md cursor-pointer transition-all border border-transparent shadow-sm",
                    isFound
                      ? "bg-emerald-500 text-white font-extrabold"
                      : isSelected
                        ? "bg-primary text-primary-foreground scale-105"
                        : "bg-card text-foreground hover:bg-secondary/40"
                  )}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>

        {/* Word Clues Sidebar */}
        <div className="flex-1 w-full space-y-4">
          <Card className="p-4 border border-border bg-card">
            <h3 className="font-bold text-sm text-foreground mb-3">Words to Find ({words.length})</h3>
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {words.map((w, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-xl border transition-all flex flex-col gap-1 text-xs",
                    w.found
                      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700/80 line-through font-medium"
                      : "border-border bg-secondary/5 text-foreground"
                  )}
                >
                  {w.found ? (
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                      <span>✓ {w.word}</span>
                    </div>
                  ) : (
                    <span className="font-semibold text-muted-foreground">Word {idx + 1}</span>
                  )}
                  <p className="text-xs italic leading-relaxed text-muted-foreground">
                    "Clue: {w.clue}"
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border mt-auto">
        <span className="text-xs font-semibold text-muted-foreground">
          Words found: {foundCount} / {words.length}
        </span>
        <button
          onClick={handleComplete}
          className="text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          Submit Early
        </button>
      </div>
    </ActivityLayout>
  );
};
