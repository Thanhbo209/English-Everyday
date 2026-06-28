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
  const allowedMcq = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7"];
  const allowedFib = ["F1", "F2", "F3", "F4", "F5", "F6"];

  if (!allowedMcq.includes(upperType) && !allowedFib.includes(upperType)) {
    throw new Error(`Unsupported assessment activity type: ${activityType}`);
  }

  const isMcq = allowedMcq.includes(upperType);

  // Filter items based on media requirements of the selected mode
  const needsImage = ["Q1", "Q2", "Q6", "F1", "F4"].includes(upperType);
  const needsAudio = ["Q5", "Q6", "Q7", "F3", "F6"].includes(upperType);

  const eligibleItems = items.filter((item) => {
    if (needsImage && (!item.imageUrl || !item.imageUrl.trim())) {
      return false;
    }
    if (needsAudio && (!item.audioUrl || !item.audioUrl.trim())) {
      return false;
    }
    return true;
  });

  if (eligibleItems.length === 0) {
    return [];
  }
  
  // Shuffled items represent the question order
  const shuffledItems = shuffle(eligibleItems);

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
      const otherItems = eligibleItems.filter((x) => x.id !== item.id);
      
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

      // Final choices array (correct answer + available distractors) shuffled
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
