import type { VocabItem } from "../../../api/vocab.api";
import type { AssessmentQuestion } from "../types";
import { shuffle } from "./shuffle";
import { scrambleLetters } from "./scrambleLetters";

/**
 * Generates an array of assessment questions based on the vocabulary items
 * and the requested activity type (Q1-Q7 or F1-F6).
 */
export function generateQuestions(
  items: VocabItem[],
  activityType: string
): AssessmentQuestion[] {
  const upperType = activityType.toUpperCase();
  const isMcq = upperType.startsWith("Q");
  
  // Shuffled items represent the question order
  const shuffledItems = shuffle(items);

  return shuffledItems.map((item) => {
    let questionType: "MCQ" | "FIB" = isMcq ? "MCQ" : "FIB";
    let promptType: "word" | "meaning" | "audio" | "image" = "word";
    let prompt = "";
    let correctAnswer = "";
    let options: string[] | undefined = undefined;
    let scrambledHint: string[] | undefined = undefined;

    // Define correct options and prompts depending on type
    switch (upperType) {
      // Multiple Choice
      case "Q1":
        promptType = "word";
        prompt = item.term;
        correctAnswer = item.imageUrl || "";
        break;
      case "Q2":
        promptType = "image";
        prompt = item.imageUrl || "";
        correctAnswer = item.term;
        break;
      case "Q3":
        promptType = "word";
        prompt = item.term;
        correctAnswer = item.definition;
        break;
      case "Q4":
        promptType = "meaning";
        prompt = item.definition;
        correctAnswer = item.term;
        break;
      case "Q5":
        promptType = "audio";
        prompt = item.audioUrl || "";
        correctAnswer = item.term;
        break;
      case "Q6":
        promptType = "audio";
        prompt = item.audioUrl || "";
        correctAnswer = item.imageUrl || "";
        break;
      case "Q7":
        promptType = "audio";
        prompt = item.audioUrl || "";
        correctAnswer = item.definition;
        break;

      // Fill in Blank
      case "F1":
        promptType = "image";
        prompt = item.imageUrl || "";
        correctAnswer = item.term;
        break;
      case "F2":
        promptType = "meaning";
        prompt = item.definition;
        correctAnswer = item.term;
        break;
      case "F3":
        promptType = "audio";
        prompt = item.audioUrl || "";
        correctAnswer = item.term;
        break;
      case "F4":
        promptType = "image";
        prompt = item.imageUrl || "";
        correctAnswer = item.term;
        scrambledHint = scrambleLetters(item.term);
        break;
      case "F5":
        promptType = "meaning";
        prompt = item.definition;
        correctAnswer = item.term;
        scrambledHint = scrambleLetters(item.term);
        break;
      case "F6":
        promptType = "audio";
        prompt = item.audioUrl || "";
        correctAnswer = item.term;
        scrambledHint = scrambleLetters(item.term);
        break;

      default:
        // Default fallback to word matching meaning
        promptType = "word";
        prompt = item.term;
        correctAnswer = item.definition;
    }

    if (questionType === "MCQ") {
      // 1. Gather all potential distractors (values from other vocab items in this set)
      const otherItems = items.filter((x) => x.id !== item.id);
      
      const potentialDistractors = otherItems
        .map((x) => {
          switch (upperType) {
            case "Q1":
            case "Q6":
              return x.imageUrl || "";
            case "Q2":
            case "Q4":
            case "Q5":
              return x.term;
            case "Q3":
            case "Q7":
              return x.definition;
            default:
              return x.definition;
          }
        })
        .filter((val) => val && val.trim() !== "" && val !== correctAnswer);

      // Deduplicate distractors
      const uniqueDistractors = Array.from(new Set(potentialDistractors));
      
      // Shuffle distractors and pick up to 3
      let chosenDistractors = shuffle(uniqueDistractors).slice(0, 3);

      // Pad distractors if not enough items
      while (chosenDistractors.length < 3) {
        chosenDistractors.push(`Distractor Option ${chosenDistractors.length + 1}`);
      }

      // Final choices array (correct answer + 3 distractors) shuffled
      options = shuffle([correctAnswer, ...chosenDistractors]);
    }

    return {
      id: item.id,
      vocabItem: item,
      type: questionType,
      promptType,
      prompt,
      correctAnswer,
      options,
      scrambledHint,
      activityType: upperType,
    };
  });
}
