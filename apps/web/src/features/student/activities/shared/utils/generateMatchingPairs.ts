import type { GameQuestion, MatchPair } from "../types";
import { shuffleLetters } from "./shuffleLetters";

export function generateMatchingPairs(
  questions: GameQuestion[],
  matchType: "meaning" | "image"
): { leftSide: MatchPair[]; rightSide: MatchPair[] } {
  const pairs: MatchPair[] = questions.map((q) => {
    const leftVal = q.term;
    const rightVal = matchType === "image" ? (q.imageUrl || "") : q.definition;

    return {
      id: q.id,
      leftId: `left-${q.id}`,
      rightId: `right-${q.id}`,
      leftVal,
      rightVal,
      isMatched: false,
    };
  });

  const leftSide = shuffleLetters(pairs);
  const rightSide = shuffleLetters(pairs);

  return { leftSide, rightSide };
}
