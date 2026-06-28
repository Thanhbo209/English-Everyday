import { cn, getInitials } from "../../lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

const sizes: Record<AvatarSize, string> = {
  xs: "w-6  h-6  text-[10px]",
  sm: "w-7  h-7  text-xs",
  md: "w-9  h-9  text-sm",
  lg: "w-11 h-11 text-base",
  xl: "w-14 h-14 text-lg",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover shrink-0",
          sizes[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary flex items-center justify-center shrink-0",
        "text-primary-foreground font-semibold select-none",
        sizes[size],
        className,
      )}
      aria-label={name}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
