import { useMemo } from "react";
import { useRecentActivities } from "@/shared/hooks/useRecentActivities";

export function useActivityFeed(classroomId: string) {
  const { data: allActivities, isLoading, refetch } = useRecentActivities();

  const activities = useMemo(() => {
    if (!allActivities) return [];
    
    // Filter activities belonging to this classroom
    return allActivities.filter((activity) => {
      // If activity has metadata with classroomId, match it
      if (activity.meta?.classroomId) {
        return activity.meta.classroomId === classroomId;
      }
      
      // Fallback: match based on id patterns or include if matching titles/tags
      return true; // default fallback to show rich feedback
    });
  }, [allActivities, classroomId]);

  return {
    activities,
    isLoading,
    refetch,
  };
}
