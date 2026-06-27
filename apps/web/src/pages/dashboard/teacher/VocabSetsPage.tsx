import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Books,
  Plus,
  PencilSimple,
  Trash,
  Globe,
  ChalkboardTeacher,
} from "@phosphor-icons/react";
import {
  Card,
  Button,
  Badge,
  Input,
  Modal,
  EmptyState,
  PageSpinner,
  useToast,
} from "../../../components/ui";
import { useClassrooms } from "../../../features/classroom/hooks/useClassrooms";
import {
  useVocabSets,
  useCreateVocabSet,
  useUpdateVocabSet,
  useDeleteVocabSet,
} from "../../../features/vocab/hooks/useVocabs";
import type { VocabSet } from "../../../api/vocab.api";

export default function VocabSetsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    data: classrooms,
    isLoading: loadingClassrooms,
    error: classroomsError,
  } = useClassrooms();
  const {
    data: vocabSets,
    isLoading: loadingSets,
    error: vocabSetsError,
  } = useVocabSets();

  const pageError = classroomsError ?? vocabSetsError;

  const createMutation = useCreateVocabSet();
  const updateMutation = useUpdateVocabSet();
  const deleteMutation = useDeleteVocabSet();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<VocabSet | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<VocabSet | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("English");
  const [description, setDescription] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [formError, setFormError] = useState("");

  const isLoading = loadingClassrooms || loadingSets;

  function handleCreateClick() {
    setEditingSet(null);
    setTitle("");
    setLanguage("English");
    setDescription("");
    // Default to first classroom if available
    if (classrooms && classrooms.length > 0) {
      setClassroomId(classrooms[0].id);
    } else {
      setClassroomId("");
    }
    setFormError("");
    setModalOpen(true);
  }

  function handleEditClick(e: React.MouseEvent, set: VocabSet) {
    e.stopPropagation();
    setEditingSet(set);
    setTitle(set.title);
    setLanguage(set.language);
    setDescription(set.description ?? "");
    setClassroomId(set.classroomId);
    setFormError("");
    setModalOpen(true);
  }

  function handleDeleteClick(e: React.MouseEvent, set: VocabSet) {
    e.stopPropagation();
    setSetToDelete(set);
    setDeleteOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Title is required");
      return;
    }
    if (!language.trim()) {
      setFormError("Language is required");
      return;
    }
    if (!editingSet && !classroomId) {
      setFormError("Classroom is required");
      return;
    }

    try {
      if (editingSet) {
        await updateMutation.mutateAsync({
          id: editingSet.id,
          payload: {
            title,
            language,
            description: description || undefined,
          },
        });
        toast.success("Vocabulary set updated successfully");
      } else {
        await createMutation.mutateAsync({
          title,
          language,
          description: description || undefined,
          classroomId,
        });
        toast.success("Vocabulary set created successfully");
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "An error occurred");
    }
  }

  async function handleConfirmDelete() {
    if (!setToDelete) return;
    try {
      await deleteMutation.mutateAsync(setToDelete.id);
      toast.success("Vocabulary set deleted successfully");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to delete set");
    }
  }

  if (isLoading) {
    return <PageSpinner />;
  }

  if (pageError) {
    return (
      <EmptyState
        icon={<Books size={26} className="text-destructive" />}
        title="Failed to load vocabulary sets"
        description={
          pageError.message ?? "An error occurred while fetching data."
        }
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  const hasClassrooms = classrooms && classrooms.length > 0;
  const hasSets = vocabSets && vocabSets.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Vocabulary Sets</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Build and manage specialized vocab items for study flashcards.
          </p>
        </div>

        <Button
          leftIcon={<Plus size={16} />}
          onClick={handleCreateClick}
          variant="primary"
          size="sm"
          disabled={!hasClassrooms}
          title={!hasClassrooms ? "Create a classroom first" : undefined}
        >
          Create Set
        </Button>
      </div>

      {!hasClassrooms && (
        <Card className="border-warning/30 bg-warning/5 text-warning-foreground text-sm flex items-center gap-3 p-4">
          <ChalkboardTeacher size={20} className="text-warning shrink-0" />
          <div>
            <p className="font-semibold">No classrooms configured</p>
            <p className="text-xs text-muted-foreground">
              You must create at least one classroom before you can construct
              vocabulary sets.{" "}
              <button
                onClick={() => navigate("/dashboard/classrooms")}
                className="underline hover:text-foreground font-semibold"
              >
                Go to Classrooms
              </button>
            </p>
          </div>
        </Card>
      )}

      {/* Sets Grid */}
      {!hasSets ? (
        <EmptyState
          icon={<Books size={32} />}
          title="No Vocabulary Sets Yet"
          description="Build decks of words, phonetic keys, and audio samples to share with your students."
          action={
            hasClassrooms ? (
              <Button
                leftIcon={<Plus size={16} />}
                onClick={handleCreateClick}
                variant="primary"
              >
                Create Vocabulary Set
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vocabSets.map((set) => (
            <Card
              key={set.id}
              hover
              onClick={() => navigate(`/dashboard/vocab-sets/${set.id}`)}
              className="flex flex-col justify-between group h-52"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {set.title}
                  </h3>
                  <Badge
                    variant="default"
                    className="shrink-0 flex items-center gap-1"
                  >
                    <Globe size={12} />
                    {set.language}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 h-8">
                  {set.description || "No description provided."}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge
                    variant="info"
                    className="text-[10px] py-0.5 px-2 bg-secondary/50"
                  >
                    Class: {set.classroom?.name || "Unknown"}
                  </Badge>
                  <Badge
                    variant="info"
                    className="text-[10px] py-0.5 px-2 bg-secondary/50"
                  >
                    {set._count?.vocabItems ?? 0} Cards
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-4 gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs font-semibold py-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/vocab-sets/${set.id}`);
                  }}
                >
                  Manage Items
                </Button>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={(e) => handleEditClick(e, set)}
                    aria-label="Edit set"
                  >
                    <PencilSimple size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDeleteClick(e, set)}
                    aria-label="Delete set"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Side-over Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSet ? "Edit Vocabulary Set" : "Create Vocabulary Set"}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Intermediate Oxford Vocabulary"
            required
          />

          <Input
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="e.g. English, Vietnamese, Spanish"
            required
          />

          {/* Select classroom - only editable on create */}
          {!editingSet && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="classroom-select"
                className="text-sm font-medium text-foreground"
              >
                Classroom
              </label>
              <select
                id="classroom-select"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                className="w-full h-9 rounded-lg border border-border text-sm bg-input text-foreground px-3 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
                required
              >
                {classrooms?.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description-textarea"
              className="text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id="description-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief summary of the vocabulary topic..."
              rows={3}
              className="w-full p-3 rounded-lg border border-border text-sm bg-input text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors resize-none"
            />
          </div>

          {formError && <p className="text-xs text-destructive">{formError}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingSet ? "Save Changes" : "Create Set"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Vocabulary Set"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{setToDelete?.title}"
            </span>
            ? This will permanently delete all the vocabulary items contained
            inside this set.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleConfirmDelete}
              loading={deleteMutation.isPending}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
