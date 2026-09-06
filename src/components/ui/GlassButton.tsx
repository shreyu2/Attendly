import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'emerald' | 'danger' | 'ghost' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  children?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  let sizeClasses = 'px-space-md py-space-xs text-title-sm';
  if (size === 'sm') {
    sizeClasses = 'px-space-sm py-1 text-body-sm';
  } else if (size === 'lg') {
    sizeClasses = 'px-space-lg py-space-sm text-title-sm';
  }

  let variantClasses = 'bg-gradient-to-r from-primary-container/30 to-secondary-container/40 hover:from-primary-container/45 hover:to-secondary-container/55 text-on-surface border border-primary/40 shadow-[0_0_20px_rgba(56,189,248,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)]';

  if (variant === 'secondary') {
    variantClasses = 'bg-surface-container-high/70 hover:bg-surface-container-highest text-on-surface border border-white/10 shadow-sm';
  } else if (variant === 'emerald') {
    variantClasses = 'bg-gradient-to-r from-tertiary-container/30 to-tertiary/20 hover:from-tertiary-container/50 hover:to-tertiary/35 text-tertiary border border-tertiary/40 shadow-[0_0_16px_rgba(34,201,144,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)]';
  } else if (variant === 'danger') {
    variantClasses = 'bg-error-container/30 hover:bg-error-container/50 text-error border border-error/40 shadow-[0_0_16px_rgba(255,180,171,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)]';
  } else if (variant === 'ghost') {
    variantClasses = 'bg-transparent hover:bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface border border-transparent';
  } else if (variant === 'pill') {
    variantClasses = 'bg-surface-container-lowest/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-white/5 rounded-full';
  }

  return (
    <button
      className={`group relative inline-flex items-center justify-center gap-space-xs rounded-full font-title-sm transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && (
        <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};
