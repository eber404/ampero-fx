import * as React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'outline';

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-zinc-100 text-zinc-950 hover:bg-zinc-100/90',
  secondary: 'border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
  outline: 'border-zinc-700 text-zinc-200',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
