import React from 'react';
import { cn } from './Card';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20',
      destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
      outline: 'border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300',
      secondary: 'bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/[0.12]',
      ghost: 'hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300',
      link: 'text-indigo-600 dark:text-indigo-400 underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-9 px-4 py-2 text-sm',
      sm: 'h-7 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-6 text-sm',
      icon: 'h-9 w-9',
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
