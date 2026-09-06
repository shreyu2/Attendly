import React from 'react';
import { GlassButton } from './GlassButton';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl bg-surface-container-low/50 backdrop-blur-xl border border-white/5 p-space-xl text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-surface-container-high/60 flex items-center justify-center text-primary mb-space-md shadow-inner">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-space-2xs">
        {title}
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-space-lg leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <GlassButton variant="primary" onClick={onAction} icon="add">
          {actionLabel}
        </GlassButton>
      )}
    </div>
  );
};
