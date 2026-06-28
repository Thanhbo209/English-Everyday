import { Student } from "@phosphor-icons/react";
import { EmptyState } from "@/shared/components";

export default function ProfilePage() {
  return (
    <EmptyState
      icon={<Student size={26} />}
      title="Profile"
      description="View and update your profile, avatar, and account details here. Coming soon."
    />
  );
}
