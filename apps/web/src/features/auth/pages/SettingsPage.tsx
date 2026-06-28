import { GearSix } from "@phosphor-icons/react";
import { EmptyState } from "@/shared/components";

export default function SettingsPage() {
  return (
    <EmptyState
      icon={<GearSix size={26} />}
      title="Settings"
      description="Manage your notification preferences, security settings, and account options. Coming soon."
    />
  );
}
