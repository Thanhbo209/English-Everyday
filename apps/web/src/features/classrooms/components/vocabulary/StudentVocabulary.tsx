import { useState } from "react";
import { Books } from "@phosphor-icons/react";
import { EmptyState } from "@/shared/components";
import { useVocabSets } from "@/features/teacher/vocab-builder";
import { useMastery } from "@/features/student/activities/flashcard";
import { PracticeModal } from "@/features/student/activities/flashcard";
import type { VocabSet } from "@/features/teacher/vocab-builder/api/vocab.api";
import { ProgressCard } from "@/shared/components/dashboard";

interface StudentVocabularyProps {
  classroomId: string;
}

export function StudentVocabulary({ classroomId }: StudentVocabularyProps) {
  const { data: vocabSets, isLoading } = useVocabSets(classroomId);
  const { data: mastery } = useMastery();

  const [practiceOpen, setPracticeOpen] = useState(false);
  const [selectedPracticeSet, setSelectedPracticeSet] = useState<VocabSet | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-card rounded-lg" />
        <div className="h-20 bg-card rounded-lg" />
      </div>
    );
  }

  if (!vocabSets || vocabSets.length === 0) {
    return (
      <EmptyState
        icon={<Books size={28} />}
        title="No assigned vocabulary"
        description="Your teacher hasn't assigned any vocabulary decks to this classroom yet."
      />
    );
  }

  const setPercent = {
    known: mastery?.percentages.known ?? 0,
    learning: mastery?.percentages.learning ?? 0,
    new: mastery?.percentages.new ?? 100,
  };

  return (
    <div className="space-y-5 select-none">
      <div className="px-1 text-xs font-black text-muted-foreground uppercase tracking-wider">
        Assigned Decks
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vocabSets.map((set) => (
          <ProgressCard
            key={set.id}
            title={set.title}
            subtitle={set.language}
            known={mastery?.known ?? 0}
            learning={mastery?.learning ?? 0}
            newCount={mastery?.new ?? 0}
            total={set._count?.vocabItems ?? 0}
            percentages={setPercent}
            onClick={() => {
              setSelectedPracticeSet(set as any);
              setPracticeOpen(true);
            }}
          />
        ))}
      </div>

      <PracticeModal
        open={practiceOpen}
        onClose={() => {
          setPracticeOpen(false);
          setSelectedPracticeSet(null);
        }}
        vocabSet={selectedPracticeSet}
      />
    </div>
  );
}
