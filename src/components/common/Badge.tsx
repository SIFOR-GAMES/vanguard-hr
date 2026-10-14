import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'cash' | 'bank';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const variantClasses = {
    primary: 'bg-[#FBF8F0] text-[#846429] border border-[#ECDDBA] dark:bg-[#2A2318] dark:text-[#E2C687] dark:border-[#5A451F]',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    info: 'bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    neutral: 'bg-[#F5F1E8] text-stone-700 border border-[#E7DEC8] dark:bg-[#26221D] dark:text-stone-300 dark:border-[#3D372F]',
    cash: 'bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700 font-semibold',
    bank: 'bg-[#FBF8F0] text-[#7A5B1E] border border-[#ECDDBA] dark:bg-[#2A2318] dark:text-[#DFC792] dark:border-[#5A451F] font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full tracking-wide ${sizeClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
