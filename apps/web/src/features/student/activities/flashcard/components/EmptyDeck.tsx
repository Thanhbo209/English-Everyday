import type { FC } from "react";
import { Books } from "@phosphor-icons/react";
import { EmptyState, Button } from "@/shared/components";

interface EmptyDeckProps {
  vocabSetTitle?: string;
  onBackClick: () => void;
}

export const EmptyDeck: FC<EmptyDeckProps> = ({ vocabSetTitle = "this set", onBackClick }) => {
  return (
    <div className="max-w-md mx-auto py-12 px-4 select-none">
      <EmptyState
        icon={<Books size={32} className="text-muted-foreground" />}
        title="Empty Vocabulary Set"
        description={`There are currently no vocabulary items inside ${vocabSetTitle}. Please ask your teacher to add words.`}
        action={<Button onClick={onBackClick}>Back to Dashboard</Button>}
      />
    </div>
  );
};
