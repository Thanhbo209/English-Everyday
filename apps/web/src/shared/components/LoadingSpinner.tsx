import { cn } from '@/shared/utils/utils';

interface LoadingSpinnerProps {
  size?:      'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-3.5 h-3.5 border-[1.5px]',
  md: 'w-5   h-5   border-2',
  lg: 'w-8   h-8   border-[2.5px]',
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <span
      className={cn(
        'block rounded-full border-primary/25 border-t-primary animate-spin',
        sizes[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

/** Full-viewport centered loading screen for route guards. */
export function PageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
