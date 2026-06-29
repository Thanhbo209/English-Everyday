import { Trash, Calendar } from "@phosphor-icons/react";
import { Button, Avatar } from "@/shared/components";
import type { ClassroomMember } from "../../api/classroom.api";

interface StudentRowProps {
  member: ClassroomMember;
  isTeacher: boolean;
  onRemove?: (id: string) => void;
  isRemoving?: boolean;
}

export function StudentRow({
  member,
  isTeacher,
  onRemove,
  isRemoving,
}: StudentRowProps) {
  const formattedDate = new Date(member.joinAt).toLocaleDateString();

  return (
    <tr className="hover:bg-secondary/20 transition-colors select-none text-xs">
      <td className="px-5 py-3 font-semibold text-foreground">
        <div className="flex items-center gap-2.5">
          <Avatar name={member.user.name} size="sm" />
          <span>{member.user.name}</span>
        </div>
      </td>
      <td className="px-5 py-3 text-muted-foreground font-medium">
        {member.user.email}
      </td>
      <td className="px-5 py-3 text-muted-foreground flex items-center gap-1.5 justify-end">
        <Calendar size={13} />
        {formattedDate}
      </td>
      {isTeacher && (
        <td className="px-5 py-3 text-right">
          <Button
            size="sm"
            variant="ghost"
            loading={isRemoving}
            onClick={() => onRemove?.(member.studentId)}
            className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0 flex items-center justify-center rounded-lg"
            title="Remove Student"
          >
            <Trash size={13} />
          </Button>
        </td>
      )}
    </tr>
  );
}
