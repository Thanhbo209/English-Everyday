import type { FC } from "react";
import { ClipboardText } from "@phosphor-icons/react";
import { EmptyState, Button } from "../../../components/ui";

interface EmptyAssessmentProps {
  vocabSetTitle?: string;
  onBackClick: () => void;
}

export const EmptyAssessment: FC<EmptyAssessmentProps> = ({
  vocabSetTitle,
  onBackClick,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <EmptyState
        icon={<ClipboardText size={26} />}
        title="Empty Assessment"
        description={`The vocabulary set "${vocabSetTitle || "Deck"}" has no words or items configured for testing.`}
        action={
          <Button onClick={onBackClick} variant="primary">
            Go Back
          </Button>
        }
      />
    </div>
  );
};
