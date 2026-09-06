import React from 'react';

interface AttendanceRingProps {
  percentage: number | null;
  target?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showDetails?: boolean;
}

export const AttendanceRing: React.FC<AttendanceRingProps> = ({
  percentage,
  target = 80,
  size = 130,
  strokeWidth = 9,
  className = '',
  showDetails = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Determine stroke color & glow
  let strokeColor = 'text-tertiary';
  let glowColor = 'rgba(78, 230, 170, 0.4)';
  
  if (percentage === null) {
    strokeColor = 'text-outline';
    glowColor = 'transparent';
  } else if (percentage < target - 5) {
    strokeColor = 'text-error';
    glowColor = 'rgba(255, 180, 171, 0.4)';
  } else if (percentage < target) {
    strokeColor = 'text-status-warning';
    glowColor = 'rgba(245, 158, 11, 0.4)';
  }

  const validPct = percentage !== null ? Math.min(100, Math.max(0, percentage)) : 0;
  const strokeDashoffset = circumference - (validPct / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Track Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="text-surface-variant/40"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        
        {/* Target Benchmark Notch Dashed Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="text-outline/40"
          stroke="currentColor"
          strokeWidth={strokeWidth * 0.25}
          strokeDasharray="2 6"
        />

        {/* Progress Arc */}
        {percentage !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={`${strokeColor} transition-all duration-700 ease-out`}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
          />
        )}
      </svg>

      {/* Numerical Core */}
      {showDetails && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          {percentage !== null ? (
            <>
              <span className="font-label-data-lg text-2xl lg:text-3xl font-bold text-on-surface leading-none tracking-tight">
                {percentage.toFixed(1)}
              </span>
              <span className="font-label-caps text-[10px] text-tertiary mt-0.5 font-bold uppercase tracking-wider">
                %
              </span>
            </>
          ) : (
            <span className="font-label-caps text-[10px] text-outline text-center px-1">
              No Data
            </span>
          )}
        </div>
      )}
    </div>
  );
};
