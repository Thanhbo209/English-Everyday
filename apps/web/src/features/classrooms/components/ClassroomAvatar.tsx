import { useWorkspace } from "../hooks/useWorkspace";

interface ClassroomAvatarProps {
  classroomId: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

export function ClassroomAvatar({ classroomId, name, size = "md" }: ClassroomAvatarProps) {
  const { theme } = useWorkspace(classroomId);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg text-xs",
    md: "w-11 h-11 rounded-xl text-sm",
    lg: "w-20 h-20 rounded-2xl text-3xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center font-black text-white shadow-inner shrink-0 ${theme.bg}`}
    >
      {initials}
    </div>
  );
}
