import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Calendar,
  PencilSimple,
  Trash,
  CheckCircle,
  Copy,
} from "@phosphor-icons/react";
import {
  Card,
  Button,
  Badge,
  EmptyState,
  useToast,
  LoadingSpinner,
} from "../../components/ui";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  useClassroom,
  useClassroomMembers,
  useDeleteClassroom,
} from "../../features/classroom/hooks/useClassrooms";
import { ClassroomModal } from "../../features/classroom/components/ClassroomModal";
import { ConfirmDeleteModal } from "../../features/classroom/components/ConfirmDeleteModal";

export default function ClassroomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const isTeacher = user?.role === "TEACHER";

  const {
    data: classroom,
    isLoading: isLoadingClassroom,
    error: classroomError,
  } = useClassroom(id ?? "");
  const { data: members, isLoading: isLoadingMembers } = useClassroomMembers(
    id ?? "",
  );
  const deleteMutation = useDeleteClassroom();

  const [activeTab, setActiveTab] = useState<"overview" | "members">(
    "overview",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleCopyCode() {
    if (!classroom) return;
    navigator.clipboard.writeText(classroom.joinCode);
    toast.success("Join code copied to clipboard!");
  }

  function handleConfirmDelete() {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Classroom deleted successfully");
        navigate("/dashboard/classrooms");
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message ?? "Failed to delete classroom";
        toast.error(msg);
      },
    });
  }

  if (isLoadingClassroom) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">
            Loading classroom details…
          </p>
        </div>
      </div>
    );
  }

  if (classroomError || !classroom) {
    return (
      <EmptyState
        icon={<ArrowLeft size={26} />}
        title="Classroom not found"
        description="The classroom you are looking for does not exist or you do not have permission to view it."
        action={
          <Button onClick={() => navigate("/dashboard/classrooms")}>
            Back to Classrooms
          </Button>
        }
      />
    );
  }

  const formattedDate = new Date(classroom.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("/dashboard/classrooms")}
          className="self-start"
        >
          Back to Classrooms
        </Button>

        {isTeacher && (
          <div className="flex items-center gap-2 self-end">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<PencilSimple size={15} />}
              onClick={() => setModalOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              leftIcon={<Trash size={15} />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Overview & Members tabs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b border-border flex items-center gap-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2.5 text-sm font-semibold border-b-2 transition-all ${
                activeTab === "overview"
                  ? "border-primary text-foreground font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`pb-2.5 text-sm  font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "members"
                  ? "border-primary text-foreground font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Members
              <span className="text-[11px] bg-primary px-1.5 py-0.5 rounded font-bold text-black">
                {members?.length ?? 0}
              </span>
            </button>
          </div>

          {activeTab === "overview" ? (
            <Card className="space-y-4 min-h-62.5">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {classroom.name}
                </h3>
                <Badge
                  variant={
                    classroom.status === "ACTIVE" ? "success" : "warning"
                  }
                  className="mt-2"
                >
                  Classroom {classroom.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Description
                </h4>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {classroom.description ||
                    "No description provided for this classroom."}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="min-h-[250px]" padding="none">
              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="md" />
                </div>
              ) : !members || members.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    icon={<Users size={26} />}
                    title="No members yet"
                    description={
                      isTeacher
                        ? "No students have joined this classroom. Share the code to invite them!"
                        : "No students have joined this classroom yet."
                    }
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-sidebar-accent text-xs font-semibold text-muted-foreground">
                        <th className="px-6 py-3.5">Name</th>
                        <th className="px-6 py-3.5">Email</th>
                        <th className="px-6 py-3.5 text-right">Joined At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {members.map((member) => (
                        <tr
                          key={member.id}
                          className="hover:bg-secondary/40 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-foreground">
                            {member.user.name}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {member.user.email}
                          </td>
                          <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                            {new Date(member.joinAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Side: Key Metadata Card */}
        <div className="space-y-5">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Classroom Information
            </h3>

            {/* Join Code block */}
            <div className="bg-primary/50 border border-border p-3.5 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Invite Code
                </span>
                <button
                  onClick={handleCopyCode}
                  title="Copy Code"
                  aria-label="Copy Code"
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="font-mono text-2xl font-extrabold text-foreground tracking-wider select-all">
                {classroom.joinCode}
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal">
                Share this code with students so they can join this classroom
                immediately.
              </p>
            </div>

            {/* Metadata Rows */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar size={14} />
                  Created On
                </span>
                <span className="font-medium text-foreground">
                  {formattedDate}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  Status
                </span>
                <Badge
                  variant={
                    classroom.status === "ACTIVE" ? "success" : "warning"
                  }
                >
                  {classroom.status}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Classroom Modal */}
      <ClassroomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classroom={classroom}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        classroomName={classroom.name}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
