import * as React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'sm';

const buttonVariants: Record<ButtonVariant, string> = {
  default: 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200 shadow-sm shadow-black/10',
  secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
  outline: 'border border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900',
  ghost: 'bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100',
};

const buttonSizes: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-sm',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}
