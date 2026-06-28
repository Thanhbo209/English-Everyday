import { useMemo, useState, type FormEvent } from "react";
import { ClipboardText, Plus, Trash, CalendarBlank } from "@phosphor-icons/react";
import { Badge, Button, Card, Input, LoadingSpinner } from "../../../components/ui";
import { useClassrooms } from "../../../features/classroom/hooks/useClassrooms";
import { useVocabSets } from "../../../features/vocab/hooks/useVocabs";
import {
  useAssignments,
  useCreateAssignment,
  useDeleteAssignment,
} from "../../../modules/flashcards/hooks/useAssignment";
import type { ActivityType } from "../../../api/learning.api";

const ACTIVITY_TYPES: ActivityType[] = ["A1", "A2", "A3", "A4", "A5", "A6"];

export default function AssignmentsPage() {
  const { data: classrooms, isLoading: loadingClassrooms } = useClassrooms();
  const { data: vocabSets, isLoading: loadingVocabSets } = useVocabSets();
  const { data: assignments, isLoading: loadingAssignments } = useAssignments();
  const createAssignment = useCreateAssignment();
  const deleteAssignment = useDeleteAssignment();

  const [title, setTitle] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [vocabSetId, setVocabSetId] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("A1");
  const [dueAt, setDueAt] = useState("");

  const filteredVocabSets = useMemo(
    () =>
      vocabSets?.filter((set) => !classroomId || set.classroomId === classroomId) ??
      [],
    [classroomId, vocabSets],
  );

  const isLoading = loadingClassrooms || loadingVocabSets || loadingAssignments;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !classroomId || !vocabSetId) return;

    createAssignment.mutate(
      {
        title: title.trim(),
        classroomId,
        vocabSetId,
        activityType,
        config: {},
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          setTitle("");
          setVocabSetId("");
          setDueAt("");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Learning engine</p>
          <h2 className="text-2xl font-bold text-foreground">Assignments</h2>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
          <div className="lg:col-span-2">
            <Input
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Weekly flashcard review"
            />
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Classroom
            <select
              value={classroomId}
              onChange={(event) => {
                setClassroomId(event.target.value);
                setVocabSetId("");
              }}
              className="h-9 rounded-lg border border-border bg-input px-3 text-sm"
            >
              <option value="">Select classroom</option>
              {classrooms?.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Vocabulary Set
            <select
              value={vocabSetId}
              onChange={(event) => setVocabSetId(event.target.value)}
              className="h-9 rounded-lg border border-border bg-input px-3 text-sm"
            >
              <option value="">Select set</option>
              {filteredVocabSets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Activity
            <select
              value={activityType}
              onChange={(event) => setActivityType(event.target.value as ActivityType)}
              className="h-9 rounded-lg border border-border bg-input px-3 text-sm"
            >
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <Input
            label="Due"
            type="datetime-local"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
          />

          <Button
            type="submit"
            leftIcon={<Plus size={16} />}
            loading={createAssignment.isPending}
            disabled={!title.trim() || !classroomId || !vocabSetId}
          >
            Create
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        {assignments?.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardText size={32} className="text-muted-foreground mb-2" />
            <p className="text-sm font-semibold text-foreground">No assignments yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create an assignment to send real flashcard activities to students.
            </p>
          </Card>
        ) : (
          assignments?.map((assignment) => (
            <Card key={assignment.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ClipboardText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {assignment.title}
                  </p>
                  <Badge variant="info">{assignment.activityType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {assignment.classroom?.name ?? "Classroom"} · {assignment.vocabSet?.title ?? "Vocabulary set"} · {assignment._count?.submissions ?? 0} submissions
                </p>
                {assignment.dueAt && (
                  <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                    <CalendarBlank size={13} />
                    Due {new Date(assignment.dueAt).toLocaleString()}
                  </p>
                )}
              </div>
              <Button
                variant="destructive"
                size="sm"
                leftIcon={<Trash size={15} />}
                loading={deleteAssignment.isPending}
                onClick={() => deleteAssignment.mutate(assignment.id)}
              >
                Delete
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
