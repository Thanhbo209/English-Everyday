import { useState } from "react";
import { ClipboardText, Plus, Trash, Calendar, Users, Books } from "@phosphor-icons/react";
import {
  EmptyState,
  Button,
  Card,
  Modal,
  Input,
  Badge,
  LoadingSpinner,
  useToast,
} from "@/shared/components";
import { useClassrooms } from "@/features/teacher/classrooms";
import { useVocabSets } from "@/features/teacher/vocab-builder";
import {
  useAssignments,
  useCreateAssignment,
  useDeleteAssignment,
} from "@/features/teacher/assignments";
import type { ActivityType, Assignment } from "@/features/student/dashboard/api/learning.api";

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "A1", label: "A1 • Learn Cards (Autoplay)" },
  { value: "A2", label: "A2 • Flip Cards" },
  { value: "A3", label: "A3 • Self Learning" },
  { value: "A4", label: "A4 • Listening Practice" },
  { value: "A5", label: "A5 • Hidden Meaning" },
  { value: "A6", label: "A6 • Speaking Cards" },
  { value: "Q1", label: "Q1 • MCQ Match Image" },
  { value: "Q2", label: "Q2 • MCQ Match Word" },
  { value: "Q3", label: "Q3 • MCQ Match Definition" },
  { value: "Q4", label: "Q4 • MCQ Definition to Word" },
  { value: "Q5", label: "Q5 • MCQ Audio to Word" },
  { value: "Q6", label: "Q6 • MCQ Audio to Image" },
  { value: "Q7", label: "Q7 • MCQ Audio to Definition" },
  { value: "F1", label: "F1 • FIB Image to Word" },
  { value: "F2", label: "F2 • FIB Definition to Word" },
  { value: "F3", label: "F3 • FIB Audio to Word" },
  { value: "F4", label: "F4 • FIB Image to Scrambled Word" },
  { value: "F5", label: "F5 • FIB Definition to Scrambled Word" },
  { value: "F6", label: "F6 • FIB Audio to Scrambled Word" },
];

export default function AssignmentsPage() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [selectedVocabSetId, setSelectedVocabSetId] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("Q3");
  const [dueAt, setDueAt] = useState("");

  // Queries
  const { data: assignments, isLoading: loadingAssignments } = useAssignments();
  const { data: classrooms, isLoading: loadingClassrooms } = useClassrooms();
  // Fetch vocabulary sets for the selected classroom
  const { data: vocabSets, isLoading: loadingVocabSets } = useVocabSets(
    selectedClassroomId || undefined
  );

  // Mutations
  const createMutation = useCreateAssignment();
  const deleteMutation = useDeleteAssignment();

  const handleOpenCreateModal = () => {
    setTitle("");
    setSelectedClassroomId(classrooms?.[0]?.id || "");
    setSelectedVocabSetId("");
    setActivityType("Q3");
    setDueAt("");
    setModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast("Title is required", "error");
      return;
    }
    if (!selectedClassroomId) {
      toast("Please select a classroom", "error");
      return;
    }
    if (!selectedVocabSetId) {
      toast("Please select a vocabulary deck", "error");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title,
        classroomId: selectedClassroomId,
        vocabSetId: selectedVocabSetId,
        activityType,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      });

      toast("Assignment created successfully", "success");
      setModalOpen(false);
    } catch {
      toast("Failed to create assignment", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast("Assignment deleted successfully", "success");
    } catch {
      toast("Failed to delete assignment", "error");
    }
  };

  if (loadingAssignments || loadingClassrooms) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">
            Assignments
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create tasks, learning activities, and assessments for your classrooms.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          variant="primary"
          leftIcon={<Plus size={16} />}
          className="cursor-pointer"
        >
          Create Assignment
        </Button>
      </div>

      {/* Main content grid */}
      {!assignments || assignments.length === 0 ? (
        <EmptyState
          icon={<ClipboardText size={26} />}
          title="No assignments created yet"
          description="Build task assignments for your students to let them learn vocabulary cards and practice assessments."
          action={
            <Button
              onClick={handleOpenCreateModal}
              variant="primary"
              leftIcon={<Plus size={16} />}
              className="cursor-pointer"
            >
              Create Assignment
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignments.map((assignment: Assignment) => {
            const hasDueDate = !!assignment.dueAt;
            const dueDateString = hasDueDate
              ? new Date(assignment.dueAt!).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "No due date";

            return (
              <Card key={assignment.id} className="p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="info" className="uppercase font-semibold tracking-wider">
                      {assignment.activityType}
                    </Badge>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-secondary transition-colors cursor-pointer"
                      title="Delete assignment"
                    >
                      <Trash size={16} />
                    </button>
                  </div>

                  {/* Title & info */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground line-clamp-1">
                      {assignment.title}
                    </h3>
                  </div>

                  {/* Relationships details */}
                  <div className="space-y-1.5 pt-1 text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="shrink-0" />
                      <span className="truncate">Class: {assignment.classroom?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Books size={14} className="shrink-0" />
                      <span className="truncate">Deck: {assignment.vocabSet?.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="shrink-0" />
                      <span className="truncate">{dueDateString}</span>
                    </div>
                  </div>
                </div>

                {/* Submissions count summary */}
                <div className="border-t border-border/60 pt-3 flex justify-between items-center text-xs font-semibold text-muted-foreground">
                  <span>Submissions</span>
                  <span className="text-foreground font-bold">
                    {assignment._count?.submissions ?? 0}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Slide-over create assignment modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Assignment"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-5 pt-2">
          {/* Title */}
          <Input
            label="Assignment Title"
            placeholder="e.g. Unit 3 Vocabulary Quiz"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Classroom Selection */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="classroomId" className="text-sm font-medium text-foreground">Classroom</label>
            <select
              id="classroomId"
              value={selectedClassroomId}
              onChange={(e) => {
                setSelectedClassroomId(e.target.value);
                setSelectedVocabSetId("");
              }}
              className="w-full h-9 rounded-lg border border-border bg-input px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
              required
            >
              <option value="" disabled>Select Classroom</option>
              {classrooms?.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vocabulary Set Selection */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vocabSetId" className="text-sm font-medium text-foreground">Vocabulary Set</label>
            <select
              id="vocabSetId"
              value={selectedVocabSetId}
              onChange={(e) => setSelectedVocabSetId(e.target.value)}
              className="w-full h-9 rounded-lg border border-border bg-input px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors disabled:opacity-50"
              disabled={!selectedClassroomId || loadingVocabSets}
              required
            >
              <option value="" disabled>
                {!selectedClassroomId
                  ? "Select a classroom first"
                  : loadingVocabSets
                    ? "Loading sets..."
                    : "Select Vocabulary Set"}
              </option>
              {vocabSets?.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.title} ({set.language})
                </option>
              ))}
            </select>
          </div>

          {/* Activity Type Selection */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="activityType" className="text-sm font-medium text-foreground">Activity Type</label>
            <select
              id="activityType"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as ActivityType)}
              className="w-full h-9 rounded-lg border border-border bg-input px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
              required
            >
              {ACTIVITY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dueAt" className="text-sm font-medium text-foreground">Due Date & Time (Optional)</label>
            <input
              id="dueAt"
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full h-9 rounded-lg border border-border bg-input px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending}
              className="cursor-pointer"
            >
              Create Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
