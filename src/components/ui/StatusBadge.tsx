import React from 'react';

interface StatusBadgeProps {
  status: 'Healthy' | 'Near Target' | 'Below Target' | 'No Data' | 'present' | 'absent' | 'cancelled' | 'not_marked';
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  let badgeStyles = 'bg-surface-container-high text-on-surface-variant border border-white/10';
  let displayText = label || status;
  let dotColor = 'bg-outline';

  if (status === 'Healthy' || status === 'present') {
    badgeStyles = 'bg-tertiary-container/20 text-tertiary border border-tertiary/40 shadow-[0_0_10px_rgba(78,230,170,0.2)]';
    dotColor = 'bg-tertiary';
    displayText = label || (status === 'present' ? 'Present' : 'Healthy & Safe');
  } else if (status === 'Near Target') {
    badgeStyles = 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    dotColor = 'bg-amber-400';
    displayText = label || 'Near Target';
  } else if (status === 'Below Target' || status === 'absent') {
    badgeStyles = 'bg-error-container/35 text-error border border-error/40 shadow-[0_0_10px_rgba(255,180,171,0.2)]';
    dotColor = 'bg-error';
    displayText = label || (status === 'absent' ? 'Absent' : 'Below Target');
  } else if (status === 'cancelled') {
    badgeStyles = 'bg-secondary-container/20 text-secondary border border-secondary/30';
    dotColor = 'bg-secondary';
    displayText = label || 'Cancelled / Off';
  } else if (status === 'not_marked') {
    badgeStyles = 'bg-surface-container-highest/60 text-outline border border-white/5';
    dotColor = 'bg-outline';
    displayText = label || 'Not Marked';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full font-label-caps text-label-caps uppercase tracking-wider ${badgeStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{displayText}</span>
    </span>
  );
};
