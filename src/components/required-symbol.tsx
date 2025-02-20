import { ComponentPropsWithoutRef } from 'react';
import { AsteriskIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RequiredSymbol({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof AsteriskIcon>) {
  return (
    <AsteriskIcon
      className={cn('text-destructive inline size-4 align-top', className)}
      {...props}
    />
  );
}
