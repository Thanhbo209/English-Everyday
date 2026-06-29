import type { FC } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { WarningCircle } from "@phosphor-icons/react";

interface EmptyDashboardProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyDashboard: FC<EmptyDashboardProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed border-2 py-12 max-w-lg mx-auto gap-4">
      <div className="w-12 h-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center shrink-0 border border-border">
        <WarningCircle size={28} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-sm">
          {description}
        </p>
      </div>
      {actionText && onAction && (
        <Button size="sm" onClick={onAction} className="cursor-pointer">
          {actionText}
        </Button>
      )}
    </Card>
  );
};
