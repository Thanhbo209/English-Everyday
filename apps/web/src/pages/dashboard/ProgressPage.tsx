import { ChartLineUp } from '@phosphor-icons/react';
import { EmptyState } from '../../components/ui';

export default function ProgressPage() {
  return (
    <EmptyState
      icon={<ChartLineUp size={26} />}
      title="Progress"
      description="Track your learning journey, XP, streaks, and skill mastery over time. Coming soon."
    />
  );
}
