import { ClipboardText, Plus } from "@phosphor-icons/react";
import { EmptyState, Button } from "../../../components/ui";

export default function AssignmentsPage() {
  return (
    <EmptyState
      icon={<ClipboardText size={26} />}
      title="Assignments"
      description="Create and manage assignments for your classrooms. Assignments feature is coming soon."
      action={<Button leftIcon={<Plus size={16} />}>Create Assignment</Button>}
    />
  );
}
