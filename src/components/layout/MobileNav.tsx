import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAttendance } from '../../context/AttendanceContext';

interface MobileNavProps {
  onOpenCanSkipTomorrow: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenCanSkipTomorrow }) => {
  const { notifications } = useAttendance();
  const unreadCount = notifications.filter(n => !n.read).length;

  const mobileItems = [
    { path: '/dashboard', label: 'Home', icon: 'dashboard' },
    { path: '/today', label: 'Today', icon: 'check_circle' },
    { path: '/subjects', label: 'Subjects', icon: 'subject' },
    { path: '/timetable', label: 'Timetable', icon: 'calendar_view_week' },
    { path: '/what-if', label: 'What-If', icon: 'calculate' },
    { path: '/notifications', label: 'Alerts', icon: 'notifications', badge: unreadCount },
  ];

  return (
    <div className="xl:hidden fixed bottom-4 inset-x-0 z-50 px-4 pointer-events-none flex justify-center">
      <nav className="pointer-events-auto max-w-md w-full h-16 rounded-full bg-surface-container/85 backdrop-blur-2xl border border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] px-3 flex items-center justify-around">
        {mobileItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 rounded-full transition-all relative ${
                isActive
                  ? 'text-primary-container scale-110 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="text-[10px] font-label-caps mt-0.5">{item.label}</span>
            {Boolean(item.badge && item.badge > 0) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error" />
            )}
          </NavLink>
        ))}

        {/* Quick Skip Tomorrow Trigger in Mobile Nav */}
        <button
          onClick={onOpenCanSkipTomorrow}
          className="flex flex-col items-center justify-center p-2 rounded-full text-tertiary hover:scale-105 active:scale-95 transition-all"
          title="Can I skip tomorrow?"
        >
          <span className="material-symbols-outlined text-[22px]">psychology_alt</span>
          <span className="text-[10px] font-label-caps mt-0.5">Skip?</span>
        </button>
      </nav>
    </div>
  );
};
