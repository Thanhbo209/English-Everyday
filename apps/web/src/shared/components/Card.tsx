import { cn } from '@/shared/utils/utils';
import type { HTMLAttributes } from 'react';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  hover?:   boolean;
}

const paddings: Record<CardPadding, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export function Card({
  children,
  className,
  padding = 'md',
  hover   = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground border border-border rounded-xl shadow-sm',
        hover && 'hover:border-primary/30 hover:shadow-md transition-all duration-150 cursor-pointer',
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
