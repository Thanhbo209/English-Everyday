import { Users, UserPlus } from "@phosphor-icons/react";
import { EmptyState, Button } from "../../../components/ui";

export default function StudentsPage() {
  return (
    <EmptyState
      icon={<Users size={26} />}
      title="Students"
      description="View and manage all students enrolled in your classrooms. Student management is coming soon."
      action={<Button leftIcon={<UserPlus size={16} />}>Invite Student</Button>}
    />
  );
}
