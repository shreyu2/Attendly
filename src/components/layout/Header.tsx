import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';

interface HeaderProps {
  onOpenCanSkipTomorrow: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCanSkipTomorrow }) => {
  const { profile, user } = useAuth();
  const { overallStats, notifications } = useAttendance();

  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/today', label: "Today's Attendance" },
    { path: '/subjects', label: 'Subjects' },
    { path: '/what-if', label: 'What-If Calculator' },
    { path: '/timetable', label: 'Timetable' },
    { path: '/calendar', label: 'Calendar' },
    { path: '/notifications', label: 'Notifications', badge: unreadCount },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-margin-mobile lg:px-margin-desktop pt-space-xs">
      <div className="max-w-[1440px] mx-auto h-20 px-space-lg rounded-xl bg-surface-container/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(255,255,255,0.15)] flex items-center justify-between gap-space-md">
        
        {/* Logo and Brand */}
        <Link to="/dashboard" className="flex items-center gap-space-sm shrink-0 group">
          <Logo size={32} className="group-hover:scale-105 transition-transform" />
          <span className="font-headline-md text-headline-md tracking-tight text-on-surface">
            Attendly
          </span>
        </Link>

        {/* Desktop Nav Pills */}
        <nav className="hidden xl:flex items-center gap-space-2xs p-space-2xs rounded-full bg-surface-container-lowest/50 border border-white/5 backdrop-blur-md">
          {navLinks.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-space-md py-space-xs rounded-full font-title-sm text-title-sm transition-all relative ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(56,189,248,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`
              }
            >
              {item.label}
              {Boolean(item.badge && item.badge > 0) && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-error text-on-error font-label-caps text-[9px]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Constellation: Can I Skip Tomorrow? + Overall Status + User Profile */}
        <div className="flex items-center gap-space-sm sm:gap-space-md shrink-0">
          
          {/* Quick "Can I Skip Tomorrow?" Trigger */}
          <button
            onClick={onOpenCanSkipTomorrow}
            className="hidden sm:inline-flex items-center gap-1.5 px-space-sm py-space-2xs rounded-full bg-primary-container/15 hover:bg-primary-container/25 text-primary border border-primary/30 transition-all font-title-sm text-body-sm active:scale-95 cursor-pointer shadow-sm"
            title="Evaluate tomorrow's schedule"
          >
            <span className="material-symbols-outlined text-[16px]">psychology_alt</span>
            <span>Skip Tomorrow?</span>
          </button>

          {/* Overall Status Metric Pill */}
          <div className="hidden md:flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-tertiary-container/15 border border-tertiary/40 shadow-[0_0_12px_rgba(34,201,144,0.2)]">
            <span
              className={`w-2 h-2 rounded-full ${
                overallStats.percentage === null
                  ? 'bg-outline'
                  : overallStats.percentage >= overallStats.globalTarget
                  ? 'bg-tertiary animate-pulse'
                  : overallStats.percentage >= overallStats.globalTarget - 5
                  ? 'bg-amber-400'
                  : 'bg-error'
              }`}
            />
            <span className="font-label-caps text-label-caps uppercase text-tertiary font-semibold">
              Overall:{' '}
              {overallStats.percentage !== null
                ? `${overallStats.percentage.toFixed(1)}% ${overallStats.status}`
                : 'No Data'}
            </span>
          </div>

          {/* User Profile Mini Badge */}
          <Link
            to="/settings"
            className="flex items-center gap-space-sm pl-space-xs border-l border-outline-variant/30 group"
          >
            <div className="hidden lg:flex flex-col text-right">
              <span className="font-title-sm text-title-sm text-on-surface leading-tight group-hover:text-primary transition-colors">
                {profile?.name || 'My Account'}
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                {profile?.semester ? `${profile.semester}` : 'Student'}
                {profile?.department ? ` • ${profile.department}` : ''}
              </span>
            </div>
            {profile?.avatar_url ? (
              <img
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20 group-hover:ring-primary transition-all shadow-md"
                src={profile.avatar_url}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-container/30 border border-primary/40 text-primary flex items-center justify-center font-bold font-title-sm ring-1 ring-white/20 group-hover:ring-primary transition-all shadow-md">
                {((profile?.name || user?.email || 'U')[0]).toUpperCase()}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
