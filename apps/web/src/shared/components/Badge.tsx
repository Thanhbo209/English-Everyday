import { cn } from "@/shared/utils/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "accent";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-secondary text-secondary-foreground border-border",
  success: "bg-chart-4/20 text-chart-4 border-chart-4",
  accent: "bg-accent text-accent-foreground border-border",
  info: "bg-muted text-muted-foreground border-border",
  warning: "bg-muted text-accent-foreground border-border",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full",
        "text-[11px] font-semibold tracking-wide border",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
