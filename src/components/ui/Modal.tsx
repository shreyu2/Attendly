import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Darkened Backdrop with blur */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xl transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Floating Glass Dialog */}
      <div
        className={`relative w-full ${widthClasses} rounded-2xl bg-surface-container/90 backdrop-blur-3xl border border-white/15 p-space-lg sm:p-space-xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8),inset_0_1px_2px_0_rgba(255,255,255,0.25)] z-10 my-8 overflow-hidden`}
      >
        {/* Specular Top Rim */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-space-md mb-space-lg pb-space-xs border-b border-white/5">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};
