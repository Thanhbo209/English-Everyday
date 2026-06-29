import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { getClassroomById } from "../api/classroom.api";

export function useWorkspace(classroomId?: string) {
  const { user } = useAuth();
  
  const query = useQuery({
    queryKey: ["classroom", classroomId],
    queryFn: () => getClassroomById(classroomId ?? ""),
    enabled: !!classroomId,
  });

  const isTeacher = user?.role === "TEACHER";
  const isStudent = user?.role === "STUDENT";
  
  // Custom mock configuration details (theme colors, avatars) derived deterministically from name/id
  const getTheme = (name: string) => {
    const colors = [
      { name: "indigo", bg: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-500/20", lightBg: "bg-indigo-500/5", ring: "ring-indigo-500" },
      { name: "emerald", bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/20", lightBg: "bg-emerald-500/5", ring: "ring-emerald-500" },
      { name: "violet", bg: "bg-violet-500", text: "text-violet-500", border: "border-violet-500/20", lightBg: "bg-violet-500/5", ring: "ring-violet-500" },
      { name: "rose", bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500/20", lightBg: "bg-rose-500/5", ring: "ring-rose-500" },
      { name: "amber", bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/20", lightBg: "bg-amber-500/5", ring: "ring-amber-500" },
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  const theme = query.data ? getTheme(query.data.name) : getTheme(classroomId ?? "");

  return {
    classroom: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isTeacher,
    isStudent,
    theme,
    refetch: query.refetch,
  };
}
