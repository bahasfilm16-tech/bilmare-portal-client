import React from 'react';
import { cn } from './Card';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-900 dark:bg-white/10 text-white dark:text-slate-200 border-transparent',
    secondary: 'bg-slate-100 dark:bg-white/[0.07] text-slate-600 dark:text-slate-300 border-transparent',
    destructive: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200/60 dark:border-red-500/20',
    outline: 'text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1] bg-transparent',
    success: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-transparent',
    warning: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
