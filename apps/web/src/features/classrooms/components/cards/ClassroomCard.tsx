import { useNavigate } from "react-router-dom";
import {
  Users,
  ClipboardText,
  Books,
  DotsThreeVertical,
  PencilSimple,
  Archive,
  Trash,
  Key,
  Calendar,
} from "@phosphor-icons/react";
import { Badge, Card } from "@/shared/components";
import type { Classroom } from "../../api/classroom.api";
import { useInviteCode } from "../../hooks/useInviteCode";
import { useWorkspace } from "../../hooks/useWorkspace";
import { useState, useRef, useEffect } from "react";

interface ClassroomCardProps {
  classroom: Classroom;
  isTeacher: boolean;
  onEdit?: (classroom: Classroom) => void;
  onDelete?: (classroom: Classroom) => void;
  onToggleStatus?: (classroom: Classroom) => void;
}

export function ClassroomCard({
  classroom,
  isTeacher,
  onEdit,
  onDelete,
  onToggleStatus,
}: ClassroomCardProps) {
  const navigate = useNavigate();
  const { copyCode } = useInviteCode();
  const { theme } = useWorkspace(classroom.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = classroom.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedDate = new Date(classroom.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card
      hover
      className={`relative flex flex-col justify-between border-t-4 ${theme.border} border-t-primary/75 p-5 min-h-[220px] transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer`}
      onClick={() => navigate(`/dashboard/classrooms/${classroom.id}`)}
    >
      <div className="space-y-3">
        {/* Header section with avatar and three-dot menu */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-inner ${theme.bg}`}>
              {initials}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                {classroom.name}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Teacher: {classroom.teacher?.name ?? "Anonymous"}
              </p>
            </div>
          </div>

          {/* Context three-dot menu */}
          {isTeacher && (
            <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-7 h-7 rounded-lg hover:bg-secondary/40 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              >
                <DotsThreeVertical size={18} weight="bold" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 z-50 w-36 bg-card border border-border shadow-xl rounded-xl py-1 text-xs divide-y divide-border">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit?.(classroom);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-secondary/30 flex items-center gap-2 cursor-pointer"
                    >
                      <PencilSimple size={14} />
                      Edit Details
                    </button>
                    <button
                      onClick={() => {
                        copyCode(classroom.joinCode);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-secondary/30 flex items-center gap-2 cursor-pointer"
                    >
                      <Key size={14} />
                      Copy Invite
                    </button>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onToggleStatus?.(classroom);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-secondary/30 flex items-center gap-2 cursor-pointer"
                    >
                      <Archive size={14} />
                      {classroom.status === "ACTIVE" ? "Archive Class" : "Activate Class"}
                    </button>
                    <button
                      onClick={() => {
                        onDelete?.(classroom);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-secondary/30 text-destructive flex items-center gap-2 cursor-pointer"
                    >
                      <Trash size={14} />
                      Delete Class
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {classroom.description || "No classroom description has been provided yet."}
        </p>

        {/* Statistics details */}
        <div className="flex items-center gap-3 pt-2 text-[10px] text-muted-foreground font-bold border-t border-border/40">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {classroom._count?.classroomsMembers ?? 0} Students
          </span>
          <span className="flex items-center gap-1">
            <ClipboardText size={12} />
            {classroom._count?.assignments ?? 0} Assignments
          </span>
          <span className="flex items-center gap-1">
            <Books size={12} />
            {classroom._count?.vocabularySets ?? 0} Decks
          </span>
        </div>
      </div>

      {/* Footer area showing status and date */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40 text-[10px] text-muted-foreground">
        <Badge variant={classroom.status === "ACTIVE" ? "success" : "warning"} className="text-[9px] uppercase tracking-wider py-0.5">
          {classroom.status}
        </Badge>
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          Created {formattedDate}
        </span>
      </div>
    </Card>
  );
}
