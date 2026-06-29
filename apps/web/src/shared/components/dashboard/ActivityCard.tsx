import type { FC } from "react";
import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import { ClipboardText } from "@phosphor-icons/react";

interface ActivityCardProps {
  title: string;
  subtitle: string;
  timeAgo: string;
  badgeText?: string;
  badgeVariant?: "info" | "success" | "warning" | "destructive" | "default";
  onClick?: () => void;
}

export const ActivityCard: FC<ActivityCardProps> = ({
  title,
  subtitle,
  timeAgo,
  badgeText,
  badgeVariant = "info",
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      className={onClick ? "cursor-pointer hover:bg-secondary/15 transition-all duration-300" : ""}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
          <ClipboardText size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="text-sm font-semibold text-foreground truncate">{title}</h5>
            {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          <span className="text-[10px] text-muted-foreground font-semibold mt-1 block">
            {timeAgo}
          </span>
        </div>
      </div>
    </Card>
  );
};
