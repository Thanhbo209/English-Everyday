import { useState, useMemo } from "react";
import { ClipboardText, Plus, Trash, MagnifyingGlass } from "@phosphor-icons/react";
import { Button, Card, Badge, Input, EmptyState } from "@/shared/components";
import { useAssignments, useDeleteAssignment } from "@/features/teacher/assignments";

interface TeacherAssignmentsProps {
  classroomId: string;
  onCreateClick?: () => void;
}

export function TeacherAssignments({ classroomId, onCreateClick }: TeacherAssignmentsProps) {
  const { data: assignments, isLoading } = useAssignments();
  const deleteMutation = useDeleteAssignment();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DUE" | "OVERDUE">("ALL");

  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    
    // Filter by classroom
    let items = assignments.filter((a) => a.classroomId === classroomId);

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((a) => a.title.toLowerCase().includes(q));
    }

    // Filter by status
    if (statusFilter === "DUE") {
      items = items.filter((a) => !a.dueAt || new Date(a.dueAt).getTime() > Date.now());
    } else if (statusFilter === "OVERDUE") {
      items = items.filter((a) => a.dueAt && new Date(a.dueAt).getTime() < Date.now());
    }

    return items;
  }, [assignments, classroomId, search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Handled internally in mutation callbacks
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-card rounded-lg" />
        <div className="h-20 bg-card rounded-lg" />
        <div className="h-20 bg-card rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5 select-none relative pb-16">
      {/* Search & filters header */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border border-border/80 p-3.5 rounded-xl shadow-xs">
        <div className="relative w-full sm:w-64">
          <Input
            id="assignment-search"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<MagnifyingGlass size={16} />}
            className="text-xs py-1.5"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 focus:outline-none w-full sm:w-auto"
        >
          <option value="ALL">All Assignments</option>
          <option value="DUE">Active Due</option>
          <option value="OVERDUE">Overdue Tasks</option>
        </select>
      </div>

      {/* Roster list */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={<ClipboardText size={28} />}
          title="No assignments found"
          description="Create your first classroom learning activity using the button below."
          action={
            <Button onClick={onCreateClick} size="sm" leftIcon={<Plus size={15} />}>
              Create Assignment
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => {
            const isOverdue = assignment.dueAt && new Date(assignment.dueAt).getTime() < Date.now();
            return (
              <Card
                key={assignment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-secondary/5 border border-border/80 transition-colors gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 border border-orange-500/20">
                    <ClipboardText size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground leading-snug">{assignment.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="info" className="text-[9px] py-0">
                        {assignment.activityType}
                      </Badge>
                      {assignment.dueAt && (
                        <span className={`text-[9px] font-bold ${isOverdue ? "text-rose-500" : "text-muted-foreground"}`}>
                          Due: {new Date(assignment.dueAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 justify-between sm:justify-end shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    Submissions: {assignment._count?.submissions ?? 0}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(assignment.id)}
                      className="text-destructive hover:bg-destructive/10 p-1.5 h-8 w-8 flex items-center justify-center rounded-lg"
                      title="Delete Assignment"
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Create Button */}
      <div className="absolute right-4 bottom-4 z-40">
        <Button
          onClick={onCreateClick}
          className="rounded-full shadow-lg h-12 w-12 flex items-center justify-center cursor-pointer bg-primary text-black hover:bg-primary/95"
          title="Create Assignment"
        >
          <Plus size={20} weight="bold" />
        </Button>
      </div>
    </div>
  );
}
