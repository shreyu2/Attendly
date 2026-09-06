import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { getTodayDateString } from '../lib/dateUtils';

export const Notifications: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    markAttendance,
  } = useAttendance();

  const [activeFilter, setActiveFilter] = useState<'all' | 'reminder' | 'warning' | 'recovery' | 'info'>('all');

  const filteredNotifs = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const handleQuickLog = async (
    notifId: string,
    subjectId: string | undefined,
    timetableEntryId: string | undefined,
    status: 'present' | 'absent' | 'cancelled'
  ) => {
    if (subjectId) {
      await markAttendance(subjectId, timetableEntryId, getTodayDateString(), status);
    }
    markNotificationRead(notifId);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col w-full pb-space-3xl gap-space-2xl">
      
      {/* Header Section */}
      <section className="relative z-10 w-full">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div className="flex flex-col max-w-2xl">
            <div className="flex items-center gap-space-xs mb-space-2xs">
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider font-bold">
                Telemetry & Feed
              </span>
              <span className="font-label-data-md text-label-data-md text-outline">/</span>
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                Live Dispatch
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Notifications & Alerts
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-2xs">
              Timely alerts on missing attendance, low subject margins, and recovery milestones.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-space-sm shrink-0">
            {unreadCount > 0 && (
              <GlassButton
                variant="secondary"
                icon="done_all"
                onClick={markAllNotificationsRead}
              >
                Mark All as Read
              </GlassButton>
            )}
          </div>
        </div>

        {/* Filter Pills Tab Bar */}
        <div className="mt-space-lg flex items-center gap-space-xs overflow-x-auto pb-space-xs no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-space-md py-space-xs rounded-full font-title-sm text-title-sm transition-all shrink-0 flex items-center gap-space-xs cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-md'
                : 'bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>All</span>
            <span className="px-1.5 py-0.5 rounded-full bg-on-primary-container/20 font-label-caps text-label-caps">
              {notifications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('reminder')}
            className={`px-space-md py-space-xs rounded-full font-title-sm text-title-sm transition-all shrink-0 flex items-center gap-space-xs cursor-pointer ${
              activeFilter === 'reminder'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-md'
                : 'bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Attendance Reminders</span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-variant font-label-caps text-label-caps">
              {notifications.filter(n => n.type === 'reminder').length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('warning')}
            className={`px-space-md py-space-xs rounded-full font-title-sm text-title-sm transition-all shrink-0 flex items-center gap-space-xs cursor-pointer ${
              activeFilter === 'warning'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-md'
                : 'bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Target Warnings</span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-variant font-label-caps text-label-caps">
              {notifications.filter(n => n.type === 'warning').length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('recovery')}
            className={`px-space-md py-space-xs rounded-full font-title-sm text-title-sm transition-all shrink-0 flex items-center gap-space-xs cursor-pointer ${
              activeFilter === 'recovery'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-md'
                : 'bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Recovery Alerts</span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-variant font-label-caps text-label-caps">
              {notifications.filter(n => n.type === 'recovery').length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('info')}
            className={`px-space-md py-space-xs rounded-full font-title-sm text-title-sm transition-all shrink-0 flex items-center gap-space-xs cursor-pointer ${
              activeFilter === 'info'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-md'
                : 'bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>Info & Tips</span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-variant font-label-caps text-label-caps">
              {notifications.filter(n => n.type === 'info').length}
            </span>
          </button>
        </div>
      </section>

      {/* Notification Feed */}
      <section className="flex-1">
        {filteredNotifs.length === 0 ? (
          <GlassCard variant="base" className="p-space-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-low/60 flex items-center justify-center mx-auto mb-space-md">
              <span className="material-symbols-outlined text-outline text-[32px]">notifications_none</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {activeFilter === 'all' ? 'No notifications yet' : `No ${activeFilter} notifications`}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              {activeFilter === 'all'
                ? 'Your notification feed will appear here once you add subjects and mark attendance.'
                : `No ${activeFilter} alerts at this time.`}
            </p>
          </GlassCard>
        ) : (
          <div className="flex flex-col gap-space-sm">
            {filteredNotifs.map(notif => (
              <GlassCard
                key={notif.id}
                variant={notif.read ? 'base' : 'elevated'}
                className="p-space-lg flex flex-col sm:flex-row sm:items-start gap-space-md group"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.type === 'warning'
                      ? 'bg-error-container/30 text-error'
                      : notif.type === 'recovery'
                      ? 'bg-amber-100/20 text-amber-400'
                      : notif.type === 'reminder'
                      ? 'bg-primary-container/30 text-primary'
                      : 'bg-secondary-container/30 text-secondary'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {notif.type === 'warning'
                      ? 'warning'
                      : notif.type === 'recovery'
                      ? 'trending_up'
                      : notif.type === 'reminder'
                      ? 'schedule'
                      : 'info'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-space-sm">
                    <div className="flex-1">
                      <h4 className={`font-title-md text-title-md ${notif.read ? 'text-on-surface-variant' : 'text-on-surface'} font-semibold`}>
                        {notif.title}
                      </h4>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                    <span className="font-label-caps text-label-caps text-outline shrink-0 whitespace-nowrap">
                      {notif.timeAgo}
                    </span>
                  </div>

                  {notif.subjectId && (
                    <span className="mt-space-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-xs">
                      {notifications.find(n => n.id === notif.id)?.subjectId && 'Subject'}
                    </span>
                  )}
                </div>

                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1 sm:mt-0 animate-pulse" />
                )}

                {/* Action buttons for actionable notifications */}
                {notif.actionable && notif.subjectId && (
                  <div className="flex flex-wrap items-center gap-space-xs shrink-0">
                    <button
                      onClick={() => handleQuickLog(notif.id, notif.subjectId, notif.timetableEntryId, 'present')}
                      className="px-space-sm py-space-xs rounded-lg bg-tertiary-container/25 hover:bg-tertiary-container/40 text-tertiary border border-tertiary/30 font-title-sm text-body-sm transition-all cursor-pointer"
                      title="Mark Present"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span className="hidden sm:inline">Present</span>
                    </button>
                    <button
                      onClick={() => handleQuickLog(notif.id, notif.subjectId, notif.timetableEntryId, 'absent')}
                      className="px-space-sm py-space-xs rounded-lg bg-error-container/25 hover:bg-error-container/40 text-error border border-error/30 font-title-sm text-body-sm transition-all cursor-pointer"
                      title="Mark Absent"
                    >
                      <span className="material-symbols-outlined text-[16px]">cancel</span>
                      <span className="hidden sm:inline">Absent</span>
                    </button>
                    <button
                      onClick={() => handleQuickLog(notif.id, notif.subjectId, notif.timetableEntryId, 'cancelled')}
                      className="px-space-sm py-space-xs rounded-lg bg-surface-container-high/60 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-white/5 font-title-sm text-body-sm transition-all cursor-pointer"
                      title="Mark Cancelled"
                    >
                      <span className="material-symbols-outlined text-[16px]">event_busy</span>
                      <span className="hidden sm:inline">Cancelled</span>
                    </button>
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="px-space-sm py-space-xs rounded-lg bg-surface-container-low/60 hover:bg-surface-container text-outline border border-white/5 font-title-sm text-body-sm transition-all cursor-pointer"
                      title="Dismiss"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
