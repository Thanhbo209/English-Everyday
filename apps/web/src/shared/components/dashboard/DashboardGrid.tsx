import type { FC, ReactNode } from "react";
import { cn } from "@/shared/utils/utils";

interface DashboardGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export const DashboardGrid: FC<DashboardGridProps> = ({
  children,
  cols = 3,
  className,
}) => {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-5 w-full", colClasses[cols], className)}>
      {children}
    </div>
  );
};
