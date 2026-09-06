import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { AttendanceRing } from '../components/ui/AttendanceRing';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatFullHeaderDate, getTodayDateString } from '../lib/dateUtils';
import { calculateAttendancePercentage } from '../lib/attendanceCalculator';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    subjects,
    overallStats,
    subjectStatsList,
    todaySchedule,
    markAttendance,
    globalTarget,
    isLoadingData,
  } = useAttendance();

  const [subjectFilter, setSubjectFilter] = useState<'all' | 'danger' | 'safe'>('all');

  const todayStr = getTodayDateString();
  const completedTodayCount = todaySchedule.filter(s => s.status !== 'not_marked').length;
  const nextClass = todaySchedule.find(s => s.status === 'not_marked');

  const filteredSubjectStats = subjectStatsList.filter(item => {
    if (subjectFilter === 'danger') {
      return item.percentage !== null && item.percentage < item.effectiveTarget;
    }
    if (subjectFilter === 'safe') {
      return item.percentage !== null && item.percentage >= item.effectiveTarget;
    }
    return true;
  });

  // Calculate dynamic what-if skip simulation for the Safe Skip widget
  const skip1Conducted = overallStats.totalConducted + 1;
  const skip1Pct = calculateAttendancePercentage(overallStats.totalAttended, skip1Conducted);
  const skip1Safe = skip1Pct !== null && skip1Pct >= globalTarget;

  const skip2Conducted = overallStats.totalConducted + 2;
  const skip2Pct = calculateAttendancePercentage(overallStats.totalAttended, skip2Conducted);
  const skip2Safe = skip2Pct !== null && skip2Pct >= globalTarget;

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full border-2 border-primary-container border-t-transparent animate-spin" />
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Loading Attendly...
          </span>
        </div>
      </div>
    );
  }

  const hasData = subjectStatsList.length > 0;

  return (
    <div className="flex flex-col w-full gap-space-2xl">
      
      {/* Top Status Telemetry Pill Strip */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-lowest/60 backdrop-blur-2xl p-space-sm rounded-xl border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_24px_-10px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-space-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-tertiary-container/20 text-tertiary shadow-[0_0_12px_rgba(78,230,170,0.3)]">
            <span className="material-symbols-outlined text-[18px]">{hasData ? 'verified' : 'sync'}</span>
          </div>
          <div className="flex items-baseline gap-space-xs">
            <span className="font-title-sm text-title-sm text-on-surface">
              {hasData ? 'Academic Telemetry Active' : 'Welcome to Attendly'}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant hidden sm:inline">
              {hasData && profile?.semester
                ? `• ${profile.semester}${profile.department ? ` (${profile.department})` : ''}`
                : hasData
                ? '• Tracking Active'
                : 'Add subjects to begin tracking'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            System Sync:
          </span>
          <span className="font-label-data-md text-label-data-md text-tertiary">
            Realtime Active
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse ml-space-xs" />
        </div>
      </div>

      {/* Zero State Onboarding Hero */}
      {subjects.length === 0 && (
        <GlassCard variant="elevated" className="p-space-xl text-center flex flex-col items-center justify-center gap-space-md">
          <div className="w-16 h-16 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">school</span>
          </div>
          <div className="max-w-md">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">
              Welcome to Your Attendance Dashboard
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Your attendance statistics, safe skips, and daily schedule will appear here once you add your enrolled subjects.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-space-sm">
            <GlassButton
              variant="primary"
              icon="add"
              onClick={() => navigate('/subjects')}
            >
              Add Your First Subject
            </GlassButton>
            <GlassButton
              variant="ghost"
              icon="calendar_view_week"
              onClick={() => navigate('/timetable')}
            >
              Set Up Timetable
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* SECTION 1: HERO METRIC SUITE (12-Col Bento Grid) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
        
        {/* Main Aggregate Score Glass Chamber (5 cols) */}
        <GlassCard
          variant="base"
          glowColor="tertiary"
          className="lg:col-span-5 p-space-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-space-xs mb-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-widest">
                  Aggregate Rating
                </span>
                <span className="material-symbols-outlined text-outline text-[16px]">info</span>
              </div>
              <StatusBadge
                status={overallStats.status}
                label={
                  overallStats.percentage === null
                    ? 'No Attendance Recorded'
                    : overallStats.percentage >= globalTarget
                    ? 'Healthy & Above Target'
                    : 'Below Target'
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-space-xl my-space-md">
              <AttendanceRing
                percentage={overallStats.percentage}
                target={globalTarget}
                size={140}
                strokeWidth={10}
                showDetails={true}
              />

              <div className="flex flex-col items-start sm:items-center text-center sm:text-left gap-space-xs">
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-headline-xl text-headline-xl text-on-surface font-bold">
                    {overallStats.percentage !== null ? `${overallStats.percentage.toFixed(1)}%` : '—'}
                  </span>
                  <span className="font-label-data-md text-label-data-md text-on-surface-variant">
                    / {globalTarget}%
                  </span>
                </div>
                <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{overallStats.totalAttended} attended</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="material-symbols-outlined text-[16px]">event_note</span>
                  <span>{overallStats.totalConducted} conducted</span>
                </div>
                {overallStats.totalCancelled > 0 && (
                  <div className="flex items-center gap-space-sm text-amber-400 font-body-sm">
                    <span className="material-symbols-outlined text-[16px]">event_busy</span>
                    <span>{overallStats.totalCancelled} cancelled</span>
                  </div>
                )}
              </div>
            </div>

            {overallStats.percentage === null && (
              <div className="p-space-md rounded-xl bg-surface-container-low/60 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-xl mb-space-xs block">add_task</span>
                <span className="font-body-md">No attendance recorded yet.</span>
                <p className="font-body-sm mt-1">Add subjects, set up your timetable, and start marking classes.</p>
              </div>
            )}
          </div>

          {/* Safe Skip Allowance Widget */}
          <div className="pt-space-lg border-t border-white/5">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-caps text-label-caps uppercase text-tertiary tracking-widest font-bold">
                Safe Skip Allowance
              </span>
              <span className="font-label-data-lg text-label-data-lg text-tertiary font-bold">
                {overallStats.totalSafeSkips}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
              Maximum classes you can miss across all subjects while staying ≥ {globalTarget}%
            </p>

            {/* Projection Bar */}
            {overallStats.totalConducted > 0 ? (
              <div className="p-space-sm rounded-xl bg-surface-container-lowest/60 backdrop-blur-md border border-white/5 flex flex-col gap-space-xs">
                <div className="flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant">
                  <span>Skip 1 →</span>
                  <span className={`${skip1Safe ? 'text-tertiary' : 'text-error'} font-bold`}>
                    {skip1Pct !== null ? `${skip1Pct.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className="h-full bg-tertiary transition-all duration-300"
                    style={{ width: skip1Safe ? '100%' : `${Math.max(0, (skip1Pct || 0) / globalTarget * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant">
                  <span>Skip 2 →</span>
                  <span className={`${skip2Safe ? 'text-tertiary' : 'text-error'} font-bold`}>
                    {skip2Pct !== null ? `${skip2Pct.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className="h-full bg-tertiary transition-all duration-300"
                    style={{ width: skip2Safe ? '100%' : `${Math.max(0, (skip2Pct || 0) / globalTarget * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-space-sm rounded-xl bg-surface-container-lowest/40 text-center font-body-xs text-outline">
                Skip projections activate after attendance is marked.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Subject Standing Matrix (7 cols) */}
        <GlassCard variant="base" className="lg:col-span-7 p-space-lg sm:p-space-xl flex flex-col">
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">table_chart</span>
              <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest font-bold">
                Subject Standing
              </span>
            </div>
            <div className="flex items-center p-space-2xs rounded-full bg-surface-container-low border border-white/5 shadow-sm">
              <button
                onClick={() => setSubjectFilter('all')}
                className={`px-space-md py-space-xs rounded-full font-title-sm text-title-sm transition-all cursor-pointer ${
                  subjectFilter === 'all'
                    ? 'bg-primary-container text-on-primary-container shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All <span className="font-label-data-md text-body-sm ml-1">({subjectStatsList.length})</span>
              </button>
              <button
                onClick={() => setSubjectFilter('safe')}
                className={`px-space-md py-space-xs rounded-full font-title-sm text-title-sm transition-all cursor-pointer ${
                  subjectFilter === 'safe'
                    ? 'bg-tertiary-container text-on-tertiary-container shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Safe <span className="font-label-data-md text-body-sm ml-1">({subjectStatsList.filter(s => s.percentage !== null && s.percentage >= s.effectiveTarget).length})</span>
              </button>
              <button
                onClick={() => setSubjectFilter('danger')}
                className={`px-space-md py-space-xs rounded-full font-title-sm text-title-sm transition-all cursor-pointer ${
                  subjectFilter === 'danger'
                    ? 'bg-error-container text-on-error-container shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                At Risk <span className="font-label-data-md text-body-sm ml-1">({subjectStatsList.filter(s => s.percentage !== null && s.percentage < s.effectiveTarget).length})</span>
              </button>
            </div>
          </div>

          {filteredSubjectStats.length === 0 ? (
            <EmptyState
              icon="menu_book"
              title="No subjects yet"
              description="Add your first subject from the Subjects page to start tracking attendance."
              actionLabel="Add Subject"
              onAction={() => navigate('/subjects')}
            />
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm">
                {filteredSubjectStats.map(stats => (
                  <Link
                    key={stats.subject.id}
                    to={`/subjects/${stats.subject.id}`}
                    className="p-space-md rounded-xl bg-surface-container-low/70 border border-white/5 hover:bg-surface-container-high/50 hover:border-primary/20 transition-all group flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-space-xs">
                      <div className="flex items-center gap-space-xs">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: `var(--color-${stats.subject.color || 'primary'})` }}
                        />
                        <span className="font-title-sm text-title-sm text-on-surface font-semibold truncate max-w-[160px]">
                          {stats.subject.name}
                        </span>
                      </div>
                      <StatusBadge status={stats.status} />
                    </div>

                    <div className="flex items-center justify-between mb-space-xs">
                      <AttendanceRing
                        percentage={stats.percentage}
                        target={stats.effectiveTarget}
                        size={56}
                        strokeWidth={6}
                        showDetails={false}
                      />
                      <div className="text-right">
                        <div className="font-headline-md text-headline-md font-bold text-on-surface">
                          {stats.percentage !== null ? `${stats.percentage.toFixed(1)}%` : '—'}
                        </div>
                        <div className="font-label-caps text-label-caps text-on-surface-variant">
                          Target: {stats.effectiveTarget}%
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs border-t border-white/5">
                      <div className="flex items-center gap-space-xs text-tertiary font-label-data-sm">
                        <span className="material-symbols-outlined text-[14px]">skip_next</span>
                        <span>{stats.safeSkips} safe skip(s)</span>
                      </div>
                      {stats.recoveryNeeded > 0 && (
                        <div className="flex items-center gap-space-xs text-amber-400 font-label-data-sm">
                          <span className="material-symbols-outlined text-[14px]">trending_up</span>
                          <span>{stats.recoveryNeeded} to recover</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-space-xs font-body-xs text-body-xs text-outline">
                      <span>{stats.attended} / {stats.conducted} conducted</span>
                      {stats.cancelled > 0 && <span className="text-amber-400">{stats.cancelled} cancelled</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

      </section>

      {/* SECTION 2: TODAY'S CADENCE + QUICK LOG */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Today's Schedule (7 cols) */}
        <GlassCard variant="base" className="lg:col-span-7 p-space-lg sm:p-space-xl flex flex-col">
          <div className="flex items-center justify-between mb-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">today</span>
              <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest font-bold">
                Today's Schedule
              </span>
            </div>
            <span className="font-label-data-md text-label-data-md text-on-surface-variant">
              {formatFullHeaderDate(new Date(todayStr))}
            </span>
          </div>

          {todaySchedule.length === 0 ? (
            <EmptyState
              icon="event_available"
              title="No classes scheduled today"
              description={
                subjects.length === 0
                  ? "Get started by adding your subjects and setting up your timetable."
                  : "Enjoy your free day! Manage your timetable to adjust your class schedule."
              }
              actionLabel={subjects.length === 0 ? "Add Subjects" : "Manage Timetable"}
              onAction={() => navigate(subjects.length === 0 ? '/subjects' : '/timetable')}
            />
          ) : (
            <div className="flex-1 overflow-y-auto space-y-space-xs">
              {todaySchedule.map((item) => (
                <div
                  key={item.entry.id}
                  className={`p-space-md rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-md transition-all ${
                    item.status === 'present'
                      ? 'bg-tertiary-container/15 border-tertiary/30'
                      : item.status === 'absent'
                      ? 'bg-error-container/15 border-error/30'
                      : item.status === 'cancelled'
                      ? 'bg-secondary-container/15 border-secondary/30'
                      : 'bg-surface-container-low/70 border-white/5 group'
                  }`}
                >
                  <div className="flex items-center gap-space-md min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.status === 'present'
                        ? 'bg-tertiary-container/30 text-tertiary'
                        : item.status === 'absent'
                        ? 'bg-error-container/30 text-error'
                        : item.status === 'cancelled'
                        ? 'bg-secondary-container/30 text-secondary'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      <span className="material-symbols-outlined text-xl">
                        {item.status === 'present'
                          ? 'check_circle'
                          : item.status === 'absent'
                          ? 'cancel'
                          : item.status === 'cancelled'
                          ? 'event_busy'
                          : 'schedule'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-title-md text-title-md text-on-surface font-semibold truncate">
                          {item.subject.name}
                        </span>
                        <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded bg-surface-variant text-on-surface-variant">
                          {item.subject.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        <span>{item.entry.start_time} – {item.entry.end_time}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{item.entry.class_type}</span>
                        {item.entry.room && <span className="hidden sm:inline">• Room: {item.entry.room}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex items-center gap-space-xs shrink-0">
                    <button
                      onClick={() => markAttendance(item.subject.id, item.entry.id, todayStr, 'present')}
                      className={`p-space-xs rounded-lg transition-all cursor-pointer ${
                        item.status === 'present'
                          ? 'bg-tertiary text-on-tertiary shadow-[0_0_12px_rgba(78,230,170,0.4)]'
                          : 'bg-surface-container-high/50 hover:bg-tertiary-container/30 text-tertiary'
                      }`}
                      title="Mark Present"
                    >
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </button>
                    <button
                      onClick={() => markAttendance(item.subject.id, item.entry.id, todayStr, 'absent')}
                      className={`p-space-xs rounded-lg transition-all cursor-pointer ${
                        item.status === 'absent'
                          ? 'bg-error text-on-error shadow-[0_0_12px_rgba(255,180,171,0.4)]'
                          : 'bg-surface-container-high/50 hover:bg-error-container/30 text-error'
                      }`}
                      title="Mark Absent"
                    >
                      <span className="material-symbols-outlined text-[20px]">cancel</span>
                    </button>
                    <button
                      onClick={() => markAttendance(item.subject.id, item.entry.id, todayStr, 'cancelled')}
                      className={`p-space-xs rounded-lg transition-all cursor-pointer ${
                        item.status === 'cancelled'
                          ? 'bg-secondary text-on-secondary'
                          : 'bg-surface-container-high/50 hover:bg-secondary-container/30 text-secondary'
                      }`}
                      title="Mark Cancelled"
                    >
                      <span className="material-symbols-outlined text-[20px]">event_busy</span>
                    </button>
                    {item.status !== 'not_marked' && (
                      <button
                        onClick={() => markAttendance(item.subject.id, item.entry.id, todayStr, 'not_marked')}
                        className="p-space-xs rounded-lg bg-surface-container-high/50 hover:bg-surface-container-highest text-outline transition-all cursor-pointer"
                        title="Clear Status"
                      >
                        <span className="material-symbols-outlined text-[20px]">undo</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mark All Present Button */}
          {todaySchedule.some(s => s.status === 'not_marked') && (
            <GlassButton
              variant="primary"
              icon="check_circle"
              className="mt-space-md w-full"
              onClick={() => {
                todaySchedule.filter(s => s.status === 'not_marked').forEach(s => 
                  markAttendance(s.subject.id, s.entry.id, todayStr, 'present')
                );
              }}
            >
              Mark All Remaining Present ({todaySchedule.filter(s => s.status === 'not_marked').length})
            </GlassButton>
          )}
        </GlassCard>

        {/* Quick Stats & Upcoming (5 cols) */}
        <GlassCard variant="base" className="lg:col-span-5 p-space-lg sm:p-space-xl flex flex-col gap-space-lg">
          
          {/* Quick Stats */}
          <div>
            <span className="font-label-caps text-label-caps uppercase text-tertiary tracking-widest font-bold block mb-space-md">
              Quick Stats
            </span>
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="p-space-md rounded-xl bg-surface-container-low/70 border border-white/5">
                <div className="font-headline-md text-headline-md text-tertiary font-bold">{subjectStatsList.length}</div>
                <div className="font-label-caps text-label-caps text-on-surface-variant">Subjects</div>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low/70 border border-white/5">
                <div className="font-headline-md text-headline-md text-primary font-bold">{todaySchedule.length}</div>
                <div className="font-label-caps text-label-caps text-on-surface-variant">Classes Today</div>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low/70 border border-white/5">
                <div className="font-headline-md text-headline-md text-secondary font-bold">{completedTodayCount}</div>
                <div className="font-label-caps text-label-caps text-on-surface-variant">Marked</div>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low/70 border border-white/5">
                <div className="font-headline-md text-headline-md text-amber-400 font-bold">
                  {subjectStatsList.filter(s => s.percentage !== null && s.percentage < s.effectiveTarget).length}
                </div>
                <div className="font-label-caps text-label-caps text-on-surface-variant">At Risk</div>
              </div>
            </div>
          </div>

          {/* Next Class */}
          <div className="p-space-md rounded-xl bg-surface-container-low/60 border border-white/5">
            <div className="flex items-center gap-space-xs mb-space-xs">
              <span className="material-symbols-outlined text-secondary text-[18px]">schedule</span>
              <span className="font-label-caps text-label-caps uppercase text-secondary tracking-wider font-bold">
                Next Class
              </span>
            </div>
            {nextClass ? (
              <div>
                <div className="font-title-md text-title-md text-on-surface font-semibold">{nextClass.subject.name}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  {nextClass.entry.start_time} – {nextClass.entry.end_time} • {nextClass.entry.class_type}
                </div>
              </div>
            ) : (
              <div className="font-body-md text-body-md text-on-surface-variant">
                No more classes today.
              </div>
            )}
          </div>

          {/* Can I Skip Tomorrow? Quick Link */}
          <div className="pt-space-md border-t border-white/5">
            <Link
              to="/what-if"
              className="flex items-center justify-center gap-space-xs p-space-md rounded-xl bg-primary-container/15 hover:bg-primary-container/25 text-primary border border-primary/30 transition-all font-title-sm text-body-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
              <span>Can I Skip Tomorrow?</span>
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};
