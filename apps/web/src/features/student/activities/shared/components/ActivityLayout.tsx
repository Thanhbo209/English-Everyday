import type { FC, ReactNode } from "react";
import { cn } from "@/shared/utils/utils";

interface ActivityLayoutProps {
  children: ReactNode;
  className?: string;
}

export const ActivityLayout: FC<ActivityLayoutProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 md:p-6 bg-card border border-border rounded-2xl shadow-sm min-h-[500px]",
        className
      )}
    >
      {children}
    </div>
  );
};
