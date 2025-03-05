import { ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        buttonVariants({
          variant: 'secondary',
          className: 'pointer-events-none animate-pulse w-24',
        }),
        className
      )}
    ></div>
  );
}

export function SkeletonArray({
  length = 3,
  children,
}: {
  length?: number;
  children: ReactNode;
}) {
  return Array.from({ length }).map(() => children);
}

export function SkeletonText({
  rows = 1,
  size = 'md',
  className,
}: {
  rows?: number;
  size?: 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <SkeletonArray length={rows}>
        <div
          className={cn(
            'bg-secondary animate-pulse w-full rounded-sm',
            rows > 1 && 'last:w-3/4',
            size === 'md' && 'h-3',
            size === 'lg' && 'h-5',
            className
          )}
        ></div>
      </SkeletonArray>
    </div>
  );
}
