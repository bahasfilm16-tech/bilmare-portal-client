import React from 'react';
import { cn } from './Card';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-[#635BFF] text-white hover:bg-[#5951E5] shadow-sm shadow-[#635BFF]/20 font-medium',
      destructive: 'bg-[#DF1B41] text-white hover:bg-[#C41737] shadow-sm font-medium',
      outline: 'border border-[#E3E8EF] dark:border-white/[0.1] bg-white dark:bg-transparent hover:bg-[#F6F9FC] dark:hover:bg-white/[0.05] text-[#1A1F36] dark:text-slate-300 font-medium',
      secondary: 'bg-[#F6F9FC] dark:bg-white/[0.08] text-[#1A1F36] dark:text-slate-200 hover:bg-[#EEF2F7] dark:hover:bg-white/[0.12] font-medium border border-[#E3E8EF] dark:border-white/[0.08]',
      ghost: 'hover:bg-[#F6F9FC] dark:hover:bg-white/[0.06] text-[#697386] dark:text-slate-300 font-medium',
      link: 'text-[#635BFF] dark:text-[#8B85FF] underline-offset-4 hover:underline font-medium',
    };

    const sizes = {
      default: 'h-9 px-4 py-2 text-[13px]',
      sm: 'h-7 rounded-md px-3 text-[12px]',
      lg: 'h-10 rounded-md px-6 text-[13px]',
      icon: 'h-9 w-9',
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BFF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
