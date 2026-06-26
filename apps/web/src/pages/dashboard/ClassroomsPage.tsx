import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChalkboardTeacher,
  Plus,
  Users,
  Key,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import { Card, Button, Badge, EmptyState, useToast } from "../../components/ui";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  useClassrooms,
  useDeleteClassroom,
} from "../../features/classroom/hooks/useClassrooms";
import { ClassroomModal } from "../../features/classroom/components/ClassroomModal";
import { ConfirmDeleteModal } from "../../features/classroom/components/ConfirmDeleteModal";
import type { Classroom } from "../../api/classroom.api";

export default function ClassroomsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const isTeacher = user?.role === "TEACHER";

  const { data: classrooms, isLoading, error } = useClassrooms();
  const deleteMutation = useDeleteClassroom();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | undefined>(undefined);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | undefined>(undefined);

  function handleCreateClick() {
    setSelectedClassroom(undefined);
    setModalOpen(true);
  }

  function handleEditClick(e: React.MouseEvent, cls: Classroom) {
    e.stopPropagation();
    setSelectedClassroom(cls);
    setModalOpen(true);
  }

  function handleDeleteClick(e: React.MouseEvent, cls: Classroom) {
    e.stopPropagation();
    setClassroomToDelete(cls);
    setDeleteOpen(true);
  }

  function handleConfirmDelete() {
    if (!classroomToDelete) return;
    deleteMutation.mutate(classroomToDelete.id, {
      onSuccess: () => {
        toast.success("Classroom deleted successfully");
        setDeleteOpen(false);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message ?? "Failed to delete classroom";
        toast.error(msg);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-card animate-pulse rounded-lg border border-border" />
          <div className="h-9 w-32 bg-card animate-pulse rounded-lg border border-border" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-card rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<ChalkboardTeacher size={26} className="text-destructive" />}
        title="Failed to load classrooms"
        description={error.message ?? "An error occurred while fetching classrooms."}
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  const hasClassrooms = classrooms && classrooms.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Classrooms</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isTeacher
              ? "Create and manage your educational groups and students."
              : "Access your active learning groups and progress."}
          </p>
        </div>

        {isTeacher ? (
          <Button leftIcon={<Plus size={16} />} onClick={handleCreateClick} size="sm">
            Create Classroom
          </Button>
        ) : (
          <Button leftIcon={<Key size={16} />} onClick={() => navigate("/dashboard/classrooms/join")} size="sm">
            Join Classroom
          </Button>
        )}
      </div>

      {/* Classroom List */}
      {!hasClassrooms ? (
        <EmptyState
          icon={<ChalkboardTeacher size={32} />}
          title="No Classrooms Yet"
          description={
            isTeacher
              ? "Create your first classroom to begin teaching and managing students."
              : "You haven't joined any classrooms yet. Ask your teacher for a join code!"
          }
          action={
            isTeacher ? (
              <Button leftIcon={<Plus size={16} />} onClick={handleCreateClick}>
                Create Classroom
              </Button>
            ) : (
              <Button leftIcon={<Key size={16} />} onClick={() => navigate("/dashboard/classrooms/join")}>
                Join Classroom
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classrooms.map((cls) => (
            <Card
              key={cls.id}
              hover
              onClick={() => navigate(`/dashboard/classrooms/${cls.id}`)}
              className="flex flex-col justify-between min-h-[180px] cursor-pointer group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {cls.name}
                  </h3>
                  <Badge variant={cls.status === "ACTIVE" ? "success" : "warning"} className="shrink-0">
                    {cls.status}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {cls.description || "No description provided."}
                </p>

                {!isTeacher && cls.teacher && (
                  <p className="text-[11px] text-muted-foreground">
                    Teacher: <span className="font-semibold text-foreground">{cls.teacher.name}</span>
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users size={15} />
                    <span>{cls._count?.classroomsMembers ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Key size={15} />
                    <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-[11px] font-bold text-foreground">
                      {cls.joinCode}
                    </span>
                  </div>
                </div>

                {isTeacher && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleEditClick(e, cls)}
                      title="Edit Classroom"
                      aria-label="Edit Classroom"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <PencilSimple size={15} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, cls)}
                      title="Delete Classroom"
                      aria-label="Delete Classroom"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Classroom Modal */}
      <ClassroomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classroom={selectedClassroom}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        classroomName={classroomToDelete?.name ?? ""}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
