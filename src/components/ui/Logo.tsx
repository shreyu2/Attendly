import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-8 w-auto', size = 32 }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]"
      >
        <defs>
          <linearGradient id="glassGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.75" />
          </linearGradient>
          <radialGradient id="specular" cx="60" cy="50" r="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="25" y="25" width="150" height="150" rx="42" fill="url(#glassGrad)" />
        <rect x="25" y="25" width="150" height="150" rx="42" fill="url(#specular)" />
        <rect x="25" y="25" width="150" height="150" rx="42" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
        
        {/* Checkmark + Arc Path */}
        <path
          d="M62 104L88 130L142 74"
          stroke="#ffffff"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="140" cy="62" r="7.5" fill="#34d399" />
      </svg>
    </div>
  );
};
