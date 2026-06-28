import { cn } from "../../lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
  outline:
    "bg-transparent text-foreground border border-border hover:bg-secondary",
  ghost:
    "bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground border-transparent",
  destructive:
    "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8  px-3   text-xs  gap-1.5 rounded-lg",
  md: "h-9  px-4   text-sm  gap-2   rounded-lg",
  lg: "h-11 px-5   text-sm  gap-2.5 rounded-xl",
  icon: "h-9  w-9    text-sm  rounded-lg",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  leftIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium",
        "transition-all duration-150 cursor-pointer whitespace-nowrap",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "active:scale-[0.97]",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : leftIcon ? (
        <span className="flex items-center shrink-0">{leftIcon}</span>
      ) : null}
      {children}
    </button>
  );
}
