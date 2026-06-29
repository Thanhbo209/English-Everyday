import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import {
  Button,
  EmptyState,
  useToast,
  Modal,
  Input,
  LoadingSpinner,
} from "@/shared/components";
import { useAuth } from "@/features/auth";
import { useWorkspace } from "../hooks/useWorkspace";
import { useDeleteClassroom, useUpdateClassroom } from "@/features/classrooms";
import { useCreateAssignment } from "@/features/teacher/assignments";
import { useVocabSets } from "@/features/teacher/vocab-builder";
import { ClassroomModal } from "@/features/teacher/classrooms/components/ClassroomModal";
import { ConfirmDeleteModal } from "@/features/teacher/classrooms/components/ConfirmDeleteModal";
import {
  WorkspaceHeader,
  WorkspaceSidebar,
  WorkspaceTabs,
  TeacherOverview,
  StudentOverview,
  TeacherAssignments,
  StudentAssignments,
  TeacherVocabulary,
  StudentVocabulary,
  MembersTab,
  AnalyticsTab,
  ProgressTab,
  SettingsTab,
  EmptyWorkspace,
} from "../components";

const workspaceTabs = [
  { id: "overview", roles: ["TEACHER", "STUDENT"] },
  { id: "assignments", roles: ["TEACHER", "STUDENT"] },
  { id: "vocabulary", roles: ["TEACHER", "STUDENT"] },
  { id: "members", roles: ["TEACHER", "STUDENT"] },
  { id: "analytics", roles: ["TEACHER"] },
  { id: "progress", roles: ["STUDENT"] },
  { id: "settings", roles: ["TEACHER"] },
];

export default function ClassroomWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const { classroom, isLoading, theme, isTeacher, isStudent } = useWorkspace(id);
  const deleteMutation = useDeleteClassroom();
  const updateMutation = useUpdateClassroom();
  const createAssignmentMutation = useCreateAssignment();

  const [activeTab, setActiveTab] = useState("overview");

  // Modal controls
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  // Create Assignment Form state
  const [assignTitle, setAssignTitle] = useState("");
  const [selectedVocabSetId, setSelectedVocabSetId] = useState("");
  const [activityType, setActivityType] = useState("Q3");
  const [dueAt, setDueAt] = useState("");

  const { data: vocabSets } = useVocabSets(id);

  // Filter tabs by role
  const availableTabs = useMemo(() => {
    if (!user) return [];
    return workspaceTabs.filter((tab) => tab.roles.includes(user.role));
  }, [user]);

  function handleToggleStatus() {
    if (!classroom) return;
    const newStatus = classroom.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateMutation.mutate(
      {
        id: classroom.id,
        payload: { status: newStatus },
      },
      {
        onSuccess: () => {
          toast.success(`Classroom status updated to ${newStatus.toLowerCase()}`);
        },
      }
    );
  }

  function handleConfirmDelete() {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Classroom deleted successfully");
        navigate("/dashboard/classrooms");
      },
    });
  }

  const handleOpenAssignModal = (vocabSetId?: string) => {
    setAssignTitle("");
    setSelectedVocabSetId(vocabSetId || (vocabSets?.[0]?.id ?? ""));
    setActivityType("Q3");
    setDueAt("");
    setAssignOpen(true);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || !id || !selectedVocabSetId) return;

    try {
      await createAssignmentMutation.mutateAsync({
        title: assignTitle,
        classroomId: id,
        vocabSetId: selectedVocabSetId,
        activityType: activityType as any,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      });
      toast.success("Assignment created successfully");
      setAssignOpen(false);
    } catch {
      toast.error("Failed to create assignment");
    }
  };

  const isClassroomEmpty = useMemo(() => {
    if (!classroom) return true;
    return (
      (classroom._count?.assignments ?? 0) === 0 &&
      (classroom._count?.vocabularySets ?? 0) === 0 &&
      (classroom._count?.classroomsMembers ?? 0) === 0
    );
  }, [classroom]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] select-none">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Opening your classroom workspace...</p>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <EmptyState
        icon={<ArrowLeft size={26} />}
        title="Classroom not found"
        description="The classroom workspace you are trying to access does not exist or you do not have permission to view it."
        action={<Button onClick={() => navigate("/dashboard/classrooms")}>Back to Classrooms</Button>}
      />
    );
  }

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Back to list */}
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ArrowLeft size={16} />}
        onClick={() => navigate("/dashboard/classrooms")}
        className="self-start text-xs font-bold h-8 cursor-pointer"
      >
        Back to Classrooms
      </Button>

      {/* Classroom header banner */}
      <WorkspaceHeader
        classroom={classroom as any}
        isTeacher={isTeacher}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
        onToggleStatus={handleToggleStatus}
      />

      {/* Mobile-only tab bar */}
      <WorkspaceTabs
        tabs={availableTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
      />

      {/* Desktop split layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar navigation */}
        <div className="hidden md:block">
          <WorkspaceSidebar
            tabs={availableTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            theme={theme}
          />
        </div>

        {/* Content container */}
        <div className="flex-1 min-w-0">
          {isClassroomEmpty && activeTab === "overview" ? (
            <EmptyWorkspace
              isTeacher={isTeacher}
              onNavigateToTab={setActiveTab}
            />
          ) : (
            <>
              {activeTab === "overview" && isTeacher && (
                <TeacherOverview
                  classroomId={classroom.id}
                  onTabChange={setActiveTab}
                  onCreateAssignment={() => handleOpenAssignModal()}
                />
              )}
              {activeTab === "overview" && isStudent && (
                <StudentOverview
                  classroomId={classroom.id}
                  onTabChange={setActiveTab}
                />
              )}
              {activeTab === "assignments" && isTeacher && (
                <TeacherAssignments
                  classroomId={classroom.id}
                  onCreateClick={() => handleOpenAssignModal()}
                />
              )}
              {activeTab === "assignments" && isStudent && (
                <StudentAssignments classroomId={classroom.id} />
              )}
              {activeTab === "vocabulary" && isTeacher && (
                <TeacherVocabulary
                  classroomId={classroom.id}
                  onAssignClick={(setId) => handleOpenAssignModal(setId)}
                />
              )}
              {activeTab === "vocabulary" && isStudent && (
                <StudentVocabulary classroomId={classroom.id} />
              )}
              {activeTab === "members" && <MembersTab classroomId={classroom.id} />}
              {activeTab === "analytics" && isTeacher && <AnalyticsTab classroomId={classroom.id} />}
              {activeTab === "progress" && isStudent && <ProgressTab classroomId={classroom.id} />}
              {activeTab === "settings" && isTeacher && <SettingsTab classroom={classroom as any} />}
            </>
          )}
        </div>
      </div>

      {/* Classroom modification modals */}
      <ClassroomModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        classroom={classroom as any}
      />

      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        classroomName={classroom.name}
        loading={deleteMutation.isPending}
      />

      {/* Create Assignment Modal */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Create Classroom Assignment">
        <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
          <Input
            id="assign-title"
            label="Assignment Title"
            value={assignTitle}
            onChange={(e) => setAssignTitle(e.target.value)}
            required
            className="text-xs py-1.5"
            placeholder="e.g. Weekly Vocabulary Review"
          />

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Select Vocabulary Deck
            </label>
            <select
              value={selectedVocabSetId}
              onChange={(e) => setSelectedVocabSetId(e.target.value)}
              className="w-full bg-card border border-border rounded-xl p-2.5 text-xs focus:outline-none"
              required
            >
              <option value="">-- Choose Deck --</option>
              {vocabSets?.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.title} ({set._count?.vocabItems ?? 0} words)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Activity Type
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full bg-card border border-border rounded-xl p-2.5 text-xs focus:outline-none"
            >
              <option value="A1">A1 • Learn Cards (Autoplay)</option>
              <option value="A2">A2 • Flip Cards</option>
              <option value="A3">A3 • Self Learning</option>
              <option value="A4">A4 • Listening Practice</option>
              <option value="A5">A5 • Hidden Meaning</option>
              <option value="A6">A6 • Speaking Cards</option>
              <option value="Q3">Q3 • MCQ Match Definition</option>
              <option value="F2">F2 • FIB Definition to Word</option>
              <option value="U2">U2 • Unscramble (Drag & Arrange)</option>
              <option value="H1">H1 • Hangman Challenge</option>
            </select>
          </div>

          <Input
            id="assign-due"
            label="Due Date (Optional)"
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="text-xs py-1.5"
          />

          <div className="flex justify-end gap-2.5 pt-4">
            <Button variant="ghost" onClick={() => setAssignOpen(false)} className="h-9 text-xs cursor-pointer">
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createAssignmentMutation.isPending}
              className="h-9 text-xs font-bold px-4 cursor-pointer"
            >
              Create Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
