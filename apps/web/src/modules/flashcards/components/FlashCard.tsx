import type { FC } from "react";
import { motion } from "framer-motion";
import { FlashCardFront } from "./FlashCardFront";
import { FlashCardBack } from "./FlashCardBack";
import type { SessionItem } from "../hooks/useFlashcardSession";

interface FlashCardProps {
  item: SessionItem;
  isFlipped: boolean;
  onFlip?: () => void;
  hideTerm?: boolean;
  hideDefinition?: boolean;
  blurDefinition?: boolean;
  isListeningMode?: boolean;
}

export const FlashCard: FC<FlashCardProps> = ({
  item,
  isFlipped,
  onFlip,
  hideTerm = false,
  hideDefinition = false,
  blurDefinition = false,
  isListeningMode = false,
}) => {
  return (
    <div className="perspective-1000 w-full max-w-xl mx-auto select-none">
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Card animation wrapper */}
      <motion.div
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.995 }}
        className="w-full aspect-[1.5/1] cursor-pointer"
        onClick={onFlip}
      >
        <div
          className={`relative w-full h-full duration-300 transform-style-3d transition-transform ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Card Front face */}
          <div className="absolute inset-0 w-full h-full bg-card rounded-2xl border border-border shadow-md backface-hidden">
            <FlashCardFront
              term={item.term}
              imageUrl={item.imageUrl}
              hideTerm={hideTerm}
              isListeningMode={isListeningMode}
              audioUrl={item.audioUrl}
            />
          </div>

          {/* Card Back face */}
          <div className="absolute inset-0 w-full h-full bg-card rounded-2xl border border-border shadow-md backface-hidden rotate-y-180">
            {!hideDefinition && (
              <FlashCardBack
                definition={item.definition}
                phonetic={item.phonetic}
                partOfSpeech={undefined}
                exampleSentence={item.exampleSentence}
                audioUrl={item.audioUrl}
                blurDefinition={blurDefinition}
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
