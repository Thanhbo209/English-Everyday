import type { LetterSlot } from "../types";

export function generateLetterSlots(
  word: string,
  mode: "easy" | "medium" | "hard" | "v1" | "v2"
): LetterSlot[] {
  const clean = word.trim().toUpperCase();
  const slots: LetterSlot[] = clean.split("").map((char, index) => {
    const isSpecial = char === " " || char === "-" || char === "'";
    return {
      index,
      char,
      isRevealed: isSpecial,
      userChar: isSpecial ? char : "",
    };
  });

  // Determine how many letters to pre-reveal
  let revealPct = 0;
  if (mode === "easy") {
    revealPct = 0.4;
  } else if (mode === "medium" || mode === "v1") {
    revealPct = 0.2;
  }

  if (revealPct > 0) {
    const alphabeticIndexes = slots
      .filter((s) => !s.isRevealed)
      .map((s) => s.index);

    const revealCount = Math.max(1, Math.floor(alphabeticIndexes.length * revealPct));
    const shuffledIdx = [...alphabeticIndexes].sort(() => Math.random() - 0.5);
    const toReveal = shuffledIdx.slice(0, revealCount);

    for (const idx of toReveal) {
      slots[idx].isRevealed = true;
      slots[idx].userChar = slots[idx].char;
    }
  }

  return slots;
}
