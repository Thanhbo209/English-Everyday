import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChalkboardTeacher,
  Plus,
  Key,
  MagnifyingGlass,
  GridFour,
  List,
} from "@phosphor-icons/react";
import { Button, EmptyState, useToast, Input } from "@/shared/components";
import { useAuth } from "@/features/auth";
import {
  useClassrooms,
  useDeleteClassroom,
  useUpdateClassroom,
} from "@/features/classrooms";
import { ClassroomModal } from "@/features/teacher/classrooms/components/ClassroomModal";
import { ConfirmDeleteModal } from "@/features/teacher/classrooms/components/ConfirmDeleteModal";
import type { Classroom } from "../api/classroom.api";
import { ClassroomCard } from "../components/cards/ClassroomCard";

export default function ClassroomListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const isTeacher = user?.role === "TEACHER";

  const { data: classrooms, isLoading, error } = useClassrooms();
  const deleteMutation = useDeleteClassroom();
  const updateMutation = useUpdateClassroom();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | undefined>(undefined);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | undefined>(undefined);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [sortBy, setSortBy] = useState<"name" | "createdDesc" | "createdAsc" | "members">("createdDesc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  function handleCreateClick() {
    setSelectedClassroom(undefined);
    setModalOpen(true);
  }

  function handleEditClick(cls: Classroom) {
    setSelectedClassroom(cls);
    setModalOpen(true);
  }

  function handleDeleteClick(cls: Classroom) {
    setClassroomToDelete(cls);
    setDeleteOpen(true);
  }

  function handleToggleStatus(cls: Classroom) {
    const newStatus = cls.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateMutation.mutate(
      {
        id: cls.id,
        payload: { status: newStatus },
      },
      {
        onSuccess: () => {
          toast.success(`Classroom status updated to ${newStatus.toLowerCase()}`);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message ?? "Failed to update classroom status";
          toast.error(msg);
        },
      }
    );
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

  // Filter & Sort classrooms
  const processedClassrooms = useMemo(() => {
    if (!classrooms) return [];
    let items = [...classrooms];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      items = items.filter((c) => c.status === statusFilter);
    }

    // Sort items
    items.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "createdAsc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "members") {
        return (b._count?.classroomsMembers ?? 0) - (a._count?.classroomsMembers ?? 0);
      } else {
        // default: createdDesc
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return items;
  }, [classrooms, search, statusFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-card rounded-lg border border-border" />
          <div className="h-9 w-32 bg-card rounded-lg border border-border" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-card rounded-xl border border-border" />
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

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Classrooms Workspace</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isTeacher
              ? "Access your classroom dashboards, manage assignments, and track students."
              : "Continue learning inside your active educational classrooms."}
          </p>
        </div>

        {isTeacher ? (
          <Button leftIcon={<Plus size={16} />} onClick={handleCreateClick} size="sm" className="cursor-pointer self-end sm:self-auto">
            Create Classroom
          </Button>
        ) : (
          <Button leftIcon={<Key size={16} />} onClick={() => navigate("/dashboard/classrooms/join")} size="sm" className="cursor-pointer self-end sm:self-auto">
            Join Classroom
          </Button>
        )}
      </div>

      {/* Search, Filters, and Sort controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card border border-border/80 p-4 rounded-xl shadow-sm">
        <div className="relative w-full md:w-72">
          <Input
            id="classroom-search"
            placeholder="Search classrooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<MagnifyingGlass size={16} />}
            className="text-xs py-1.5"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Archived</option>
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="createdDesc">Newest Created</option>
            <option value="createdAsc">Oldest Created</option>
            <option value="name">Alphabetical (A-Z)</option>
            <option value="members">Highest Members</option>
          </select>

          {/* Grid/List layout toggle */}
          <div className="border border-border rounded-lg p-0.5 flex gap-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-primary text-black" : "text-muted-foreground hover:bg-secondary/40"
              }`}
            >
              <GridFour size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "list" ? "bg-primary text-black" : "text-muted-foreground hover:bg-secondary/40"
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Classroom layout lists */}
      {processedClassrooms.length === 0 ? (
        <EmptyState
          icon={<ChalkboardTeacher size={32} />}
          title={search.trim() ? "No search results" : "No classrooms available"}
          description={
            search.trim()
              ? "Try adjusting your search filters to find what you are looking for."
              : isTeacher
              ? "Create your first classroom to begin teaching and managing assignments."
              : "You haven't joined any classrooms yet. Input an invite code to begin."
          }
          action={
            isTeacher ? (
              <Button onClick={handleCreateClick}>Create Classroom</Button>
            ) : (
              <Button onClick={() => navigate("/dashboard/classrooms/join")}>Join Classroom</Button>
            )
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {processedClassrooms.map((cls) => (
            <ClassroomCard
              key={cls.id}
              classroom={cls as any}
              isTeacher={isTeacher}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3 bg-card border border-border/80 rounded-xl divide-y divide-border/60 overflow-hidden shadow-sm">
          {processedClassrooms.map((cls) => {
            const initials = cls.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <div
                key={cls.id}
                onClick={() => navigate(`/dashboard/classrooms/${cls.id}`)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-secondary/15 transition-colors cursor-pointer gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0 border border-primary/20">
                    {initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground leading-snug">{cls.name}</h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{cls.description || "No description provided."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0 justify-between sm:justify-end">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {cls._count?.classroomsMembers ?? 0} students
                  </span>
                  <div className="flex items-center gap-2">
                    {isTeacher && (
                      <>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditClick(cls as any); }} className="px-2 h-7">Edit</Button>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteClick(cls as any); }} className="px-2 h-7 text-destructive hover:bg-destructive/10">Delete</Button>
                      </>
                    )}
                    <Button size="sm" className="h-7 text-[11px] px-3 font-bold">Open</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for creating/updating classroom */}
      <ClassroomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classroom={selectedClassroom as any}
      />

      {/* Modal for deletion confirmation */}
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
