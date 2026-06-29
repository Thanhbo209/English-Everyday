import { useState, useMemo } from "react";
import { Books, Plus, MagnifyingGlass, BookOpen } from "@phosphor-icons/react";
import { Button, Card, EmptyState, Input } from "@/shared/components";
import { useVocabSets } from "@/features/teacher/vocab-builder";
import { useNavigate } from "react-router-dom";

interface TeacherVocabularyProps {
  classroomId: string;
  onAssignClick?: (setId: string) => void;
}

export function TeacherVocabulary({ classroomId, onAssignClick }: TeacherVocabularyProps) {
  const navigate = useNavigate();
  const { data: vocabSets, isLoading } = useVocabSets(classroomId);

  const [search, setSearch] = useState("");

  const filteredSets = useMemo(() => {
    if (!vocabSets) return [];
    if (!search.trim()) return vocabSets;
    const q = search.toLowerCase();
    return vocabSets.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [vocabSets, search]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-card rounded-lg" />
        <div className="h-24 bg-card rounded-lg" />
        <div className="h-24 bg-card rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5 select-none">
      {/* Search & Action bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border border-border/80 p-3.5 rounded-xl shadow-xs">
        <div className="relative w-full sm:w-64">
          <Input
            id="vocab-search"
            placeholder="Search decks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<MagnifyingGlass size={16} />}
            className="text-xs py-1.5"
          />
        </div>
        <Button
          onClick={() => navigate("/dashboard/vocab-sets")}
          size="sm"
          leftIcon={<Plus size={15} />}
          className="cursor-pointer w-full sm:w-auto"
        >
          Manage Decks
        </Button>
      </div>

      {/* Vocabulary Card Grid */}
      {filteredSets.length === 0 ? (
        <EmptyState
          icon={<Books size={28} />}
          title="No vocabulary decks"
          description="Build vocabulary card decks and assign them to your students for practice sessions."
          action={
            <Button onClick={() => navigate("/dashboard/vocab-sets")} size="sm">
              Build Vocabulary Set
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSets.map((set) => (
            <Card
              key={set.id}
              className="p-5 flex flex-col justify-between border border-border/80 min-h-[160px] hover:shadow-xs transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Books size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-foreground line-clamp-1">{set.title}</h4>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      Language: {set.language}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {set.description || "No description provided for this vocabulary set."}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-4">
                <span className="text-[10px] font-bold text-muted-foreground">
                  {set._count?.vocabItems ?? 0} Words
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAssignClick?.(set.id)}
                    className="h-7 text-[10px] font-bold px-3 cursor-pointer"
                    leftIcon={<BookOpen size={12} />}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
