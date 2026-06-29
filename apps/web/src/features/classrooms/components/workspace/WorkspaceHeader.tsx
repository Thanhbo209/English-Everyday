import {
  Users,
  ClipboardText,
  Books,
  Copy,
  PencilSimple,
  Archive,
  Trash,
} from "@phosphor-icons/react";
import { Badge, Button } from "@/shared/components";
import type { Classroom } from "../../api/classroom.api";
import { useInviteCode } from "../../hooks/useInviteCode";
import { useWorkspace } from "../../hooks/useWorkspace";

interface WorkspaceHeaderProps {
  classroom: Classroom;
  isTeacher: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
}

export function WorkspaceHeader({
  classroom,
  isTeacher,
  onEdit,
  onDelete,
  onToggleStatus,
}: WorkspaceHeaderProps) {
  const { copyCode } = useInviteCode();
  const { theme } = useWorkspace(classroom.id);

  const initials = classroom.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${theme.border} bg-card shadow-sm select-none`}>
      {/* Decorative top theme band */}
      <div className={`h-24 md:h-28 w-full ${theme.bg} opacity-85 relative`} />

      {/* Content wrapper */}
      <div className="relative px-6 pb-6 pt-0 flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          {/* Avatar floating overlapping the banner */}
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-white text-3xl shadow-lg border-4 border-card shrink-0 ${theme.bg}`}>
            {initials}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight truncate">
                {classroom.name}
              </h1>
              <Badge variant={classroom.status === "ACTIVE" ? "success" : "warning"} className="text-[9px] uppercase tracking-wider py-0.5 font-bold">
                {classroom.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl line-clamp-2 md:line-clamp-1 leading-normal">
              {classroom.description || "No classroom description has been provided."}
            </p>

            {/* Quick meta indicators */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-extrabold pt-1">
              <span className="flex items-center gap-1">
                <Users size={13} />
                {classroom._count?.classroomsMembers ?? 0} Students
              </span>
              <span className="flex items-center gap-1">
                <ClipboardText size={13} />
                {classroom._count?.assignments ?? 0} Assignments
              </span>
              <span className="flex items-center gap-1">
                <Books size={13} />
                {classroom._count?.vocabularySets ?? 0} Decks
              </span>
            </div>
          </div>
        </div>

        {/* Right side controls: Invite block + Teacher operations */}
        <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3 shrink-0">
          {/* Invite block */}
          <div className="flex items-center gap-2 bg-secondary/15 border border-border/80 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-foreground">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-sans">Code:</span>
            <span className="tracking-widest select-all">{classroom.joinCode}</span>
            <button
              onClick={() => copyCode(classroom.joinCode)}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Copy Invite Code"
            >
              <Copy size={13} />
            </button>
          </div>

          {/* Teacher operational actions */}
          {isTeacher && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<PencilSimple size={14} />}
                onClick={onEdit}
                className="h-8 text-xs cursor-pointer"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Archive size={14} />}
                onClick={onToggleStatus}
                className="h-8 text-xs cursor-pointer"
              >
                {classroom.status === "ACTIVE" ? "Archive" : "Activate"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                leftIcon={<Trash size={14} />}
                onClick={onDelete}
                className="h-8 text-xs cursor-pointer"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
