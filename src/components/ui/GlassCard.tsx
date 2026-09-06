import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'base' | 'elevated' | 'low' | 'highlight';
  glowColor?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'none';
  specular?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'base',
  glowColor = 'none',
  specular = true,
  ...props
}) => {
  let variantClasses = 'bg-surface-container/70 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(255,255,255,0.15)]';
  
  if (variant === 'elevated') {
    variantClasses = 'bg-surface-container-high/80 backdrop-blur-3xl border border-white/15 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.7),inset_0_1px_2px_0_rgba(255,255,255,0.22)]';
  } else if (variant === 'low') {
    variantClasses = 'bg-surface-container-low/60 backdrop-blur-xl border border-white/5 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.08)]';
  } else if (variant === 'highlight') {
    variantClasses = 'bg-surface-container/80 backdrop-blur-3xl border border-primary/30 shadow-[0_20px_45px_-10px_rgba(56,189,248,0.25),inset_0_1px_2px_0_rgba(255,255,255,0.25)]';
  }

  let glowElement = null;
  if (glowColor === 'primary') {
    glowElement = <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-container/15 blur-3xl pointer-events-none -z-10" />;
  } else if (glowColor === 'tertiary') {
    glowElement = <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-tertiary-container/15 blur-3xl pointer-events-none -z-10" />;
  } else if (glowColor === 'error') {
    glowElement = <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-error-container/25 blur-3xl pointer-events-none -z-10" />;
  } else if (glowColor === 'secondary') {
    glowElement = <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none -z-10" />;
  }

  return (
    <div
      className={`relative rounded-xl overflow-hidden ${variantClasses} ${className}`}
      {...props}
    >
      {/* Top specular rim light bevel */}
      {specular && (
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-10" />
      )}
      {glowElement}
      {children}
    </div>
  );
};
