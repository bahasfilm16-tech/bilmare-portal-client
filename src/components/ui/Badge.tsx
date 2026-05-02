import React from 'react';
import { cn } from './Card';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#1A1F36] dark:bg-white/10 text-white dark:text-slate-200 border-transparent',
    secondary: 'bg-[#F6F9FC] dark:bg-white/[0.07] text-[#697386] dark:text-slate-300 border-[#E3E8EF] dark:border-white/[0.08]',
    destructive: 'bg-[#FFF0F3] dark:bg-[#DF1B41]/10 text-[#DF1B41] dark:text-red-400 border-[#FFC0C9] dark:border-[#DF1B41]/20',
    outline: 'text-[#697386] dark:text-slate-300 border border-[#E3E8EF] dark:border-white/[0.1] bg-transparent',
    success: 'bg-[#EDFAF4] dark:bg-[#09825D]/10 text-[#09825D] dark:text-emerald-400 border-[#B3EFDA] dark:border-[#09825D]/20',
    warning: 'bg-[#FFF5EB] dark:bg-amber-500/10 text-[#C44C08] dark:text-amber-400 border-[#FECB9D] dark:border-amber-500/20',
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
