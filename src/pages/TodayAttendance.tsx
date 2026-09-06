import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getTodayDateString, formatFullHeaderDate } from '../lib/dateUtils';
import { calculateAttendancePercentage } from '../lib/attendanceCalculator';

export const TodayAttendance: React.FC = () => {
  const {
    subjects,
    timetable,
    subjectStatsList,
    markAttendance,
    markAllTodayPresent,
    getDaySchedule,
  } = useAttendance();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const schedule = getDaySchedule(selectedDate);

  const loggedCount = schedule.filter(s => s.status !== 'not_marked').length;
  const totalCount = schedule.length;
  const progressPercent = totalCount > 0 ? Math.round((loggedCount / totalCount) * 100) : 100;

  const [year, month, day] = selectedDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDate = formatFullHeaderDate(dateObj);
  const isToday = selectedDate === getTodayDateString();

  return (
    <div className="flex flex-col w-full pb-space-2xl">
      
      {/* Top Dynamic Progress & Hero Header Module */}
      <section className="relative w-full rounded-2xl bg-surface-container/70 backdrop-blur-2xl border border-white/10 p-space-lg lg:p-space-xl shadow-2xl overflow-hidden mb-space-xl">
        <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-primary-container/20 blur-[100px] pointer-events-none" />
        <div className="absolute left-1/3 -bottom-24 w-72 h-72 rounded-full bg-tertiary/15 blur-[110px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
          <div className="space-y-space-xs max-w-xl">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-container-highest/60 backdrop-blur-md border border-white/5">
              <span className="material-symbols-outlined text-primary text-body-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                calendar_today
              </span>
              <span className="font-label-caps text-label-caps text-primary tracking-wider uppercase font-semibold">
                Live Academic Registry
              </span>
            </div>

            <h1 className="font-headline-xl text-3xl sm:text-headline-xl text-on-surface tracking-tight">
              {isToday ? 'Today — ' : ''}{formattedDate}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Rapid 1-tap touch logging for scheduled class lectures, tutorials, and practical labs.
            </p>
          </div>

          {/* Quick Date Switcher & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-space-md py-space-xs rounded-full bg-surface-container-high/80 text-on-surface border border-white/10 font-label-data-md text-body-sm backdrop-blur-md shadow-inner focus:outline-none focus:border-primary cursor-pointer"
            />

            {/* Queue Pulse Count Metric */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-xl px-space-md py-space-sm rounded-xl border border-white/5 flex items-center gap-space-md shadow-inner">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Queue Pulse
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-label-data-lg text-label-data-lg text-on-surface font-bold">
                    {loggedCount}
                  </span>
                  <span className="font-label-data-md text-label-data-md text-outline">
                    / {totalCount} logged
                  </span>
                </div>
              </div>

              {/* Sparkline Circular Progress Indicator */}
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-variant/40"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-tertiary transition-all duration-700 ease-out"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
            </div>

            {/* Mark All Present Master Action */}
            <GlassButton
              variant="primary"
              icon="done_all"
              onClick={() => markAllTodayPresent(selectedDate)}
              disabled={loggedCount === totalCount && totalCount > 0}
            >
              Mark All Remaining Present
            </GlassButton>
          </div>
        </div>

        {/* Glowing Linear Progress Meter */}
        <div className="relative mt-space-lg w-full">
          <div className="h-2 w-full bg-surface-container-lowest/80 rounded-full overflow-hidden p-[1px] border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-tertiary to-tertiary-fixed shadow-[0_0_16px_rgba(78,230,170,0.6)] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-space-2xs">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
              {totalCount > 0 ? `${totalCount} Scheduled Classes` : 'Free Day'}
            </span>
            <span className="font-label-caps text-label-caps text-tertiary uppercase tracking-wider font-semibold">
              {progressPercent}% Complete
            </span>
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
              {loggedCount === totalCount ? 'All Logged' : `${totalCount - loggedCount} Pending`}
            </span>
          </div>
        </div>
      </section>

      {/* Main Stream Cards Grid */}
      {subjects.length === 0 ? (
        <div className="p-space-2xl rounded-2xl bg-surface-container-low/50 border border-white/5 text-center flex flex-col items-center justify-center gap-space-md">
          <div className="w-16 h-16 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">menu_book</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">No Subjects Added Yet</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-1">
              Add your courses first to set up attendance tracking and your class schedule.
            </p>
          </div>
          <Link
            to="/subjects"
            className="px-space-md py-space-xs rounded-full bg-primary-container text-on-primary-container font-title-sm text-title-sm hover:opacity-90 transition-all shadow-md"
          >
            Add Your First Subject
          </Link>
        </div>
      ) : timetable.length === 0 ? (
        <div className="p-space-2xl rounded-2xl bg-surface-container-low/50 border border-white/5 text-center flex flex-col items-center justify-center gap-space-md">
          <div className="w-16 h-16 rounded-2xl bg-secondary-container/20 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">calendar_view_week</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">No Timetable Set Up</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-1">
              Configure your weekly timetable so today's classes appear here automatically.
            </p>
          </div>
          <Link
            to="/timetable"
            className="px-space-md py-space-xs rounded-full bg-secondary text-on-secondary font-title-sm text-title-sm hover:opacity-90 transition-all shadow-md"
          >
            Configure Timetable
          </Link>
        </div>
      ) : schedule.length === 0 ? (
        <div className="p-space-2xl rounded-2xl bg-surface-container-low/50 border border-white/5 text-center flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-space-sm">weekend</span>
          <h2 className="font-headline-md text-headline-md text-on-surface">No Classes on this Date</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-1">
            No scheduled classes found in your timetable for this day. Switch dates above or check the Timetable page.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-space-lg">
          {schedule.map(({ entry, subject, status }) => {
            const subStats = subjectStatsList.find(s => s.subject.id === subject.id);
            const attended = subStats ? subStats.attended : 0;
            const conducted = subStats ? subStats.conducted : 0;
            const currentPct = subStats ? subStats.percentage : null;

            // Live Exact Delta Forecast
            let ifPresentPct: number | null;
            let ifAbsentPct: number | null;

            if (status === 'present') {
              ifPresentPct = currentPct;
              ifAbsentPct = calculateAttendancePercentage(Math.max(0, attended - 1), conducted);
            } else if (status === 'absent') {
              ifPresentPct = calculateAttendancePercentage(attended + 1, conducted);
              ifAbsentPct = currentPct;
            } else {
              // 'not_marked' or 'cancelled' (not in conducted tally yet)
              ifPresentPct = calculateAttendancePercentage(attended + 1, conducted + 1);
              ifAbsentPct = calculateAttendancePercentage(attended, conducted + 1);
            }

            const deltaPresent = ifPresentPct !== null && currentPct !== null
              ? (ifPresentPct - currentPct >= 0 ? `+${(ifPresentPct - currentPct).toFixed(1)}` : (ifPresentPct - currentPct).toFixed(1))
              : '+0.0';
            const deltaAbsent = ifAbsentPct !== null && currentPct !== null
              ? (ifAbsentPct - currentPct >= 0 ? `+${(ifAbsentPct - currentPct).toFixed(1)}` : (ifAbsentPct - currentPct).toFixed(1))
              : '-0.0';

            return (
              <GlassCard
                key={entry.id}
                variant={status === 'not_marked' ? 'highlight' : 'base'}
                className="p-space-lg lg:p-space-xl flex flex-col gap-space-md"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  <div className="space-y-space-2xs min-w-0">
                    <div className="flex flex-wrap items-center gap-space-xs">
                      <span className="font-label-data-md text-label-data-md text-primary bg-primary/10 px-space-xs py-[2px] rounded-md border border-primary/20">
                        {entry.start_time} - {entry.end_time}
                      </span>
                      <span className="font-label-caps text-label-caps uppercase text-outline">
                        {entry.room || 'Campus'} • {subject.faculty || 'Faculty'}
                      </span>
                      <span className="font-label-caps text-label-caps px-space-xs py-[2px] rounded-full bg-surface-variant text-on-surface-variant uppercase">
                        {entry.class_type}
                      </span>
                    </div>

                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold truncate">
                      {subject.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-space-sm pt-space-2xs">
                      <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded bg-surface-container-highest text-secondary">
                        {subject.code}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Standing: <strong className="text-on-surface font-label-data-md">{currentPct !== null ? `${currentPct.toFixed(1)}%` : 'No Data'}</strong> (Target: {subStats?.effectiveTarget || 80}%)
                      </span>
                      {subStats && (
                        <span className="font-body-sm text-body-sm text-outline">
                          • {subStats.safeSkips > 0 ? `${subStats.safeSkips} safe skips available` : `Deficit: ${subStats.recoveryNeeded} classes`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Pill Badge */}
                  <div className="flex items-center gap-space-sm self-start md:self-center shrink-0">
                    <StatusBadge status={status} />
                  </div>
                </div>

                {/* Predictive Projection Chamber */}
                <div className="p-space-sm md:p-space-md rounded-xl bg-surface-container-lowest/60 backdrop-blur-md border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-space-sm shadow-inner">
                  <div className="flex items-center gap-space-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-body-lg">insights</span>
                    <span className="font-label-caps text-label-caps uppercase tracking-wider">
                      Delta Simulation:
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-space-md font-label-data-md text-label-data-md">
                    <span className="text-tertiary">
                      Mark Present → <strong className="underline underline-offset-4">{ifPresentPct?.toFixed(1)}%</strong> (+{deltaPresent}%)
                    </span>
                    <span className="text-outline">•</span>
                    <span className="text-error">
                      Mark Absent → <strong className="underline underline-offset-4">{ifAbsentPct?.toFixed(1)}%</strong> ({deltaAbsent}%)
                    </span>
                  </div>
                </div>

                {/* High-Tactile Rapid Choice Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-xs pt-space-xs">
                  <button
                    onClick={() => markAttendance(subject.id, entry.id, selectedDate, 'present')}
                    className={`px-space-md py-space-sm rounded-xl font-title-sm text-title-sm flex items-center justify-center gap-space-xs transition-all active:scale-95 cursor-pointer ${
                      status === 'present'
                        ? 'bg-tertiary text-on-tertiary shadow-[0_0_20px_rgba(78,230,170,0.5)] font-bold'
                        : 'bg-tertiary-container/25 hover:bg-tertiary-container/40 text-tertiary border border-tertiary/30'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    <span>Present</span>
                  </button>

                  <button
                    onClick={() => markAttendance(subject.id, entry.id, selectedDate, 'absent')}
                    className={`px-space-md py-space-sm rounded-xl font-title-sm text-title-sm flex items-center justify-center gap-space-xs transition-all active:scale-95 cursor-pointer ${
                      status === 'absent'
                        ? 'bg-error text-on-error shadow-[0_0_20px_rgba(255,180,171,0.5)] font-bold'
                        : 'bg-error-container/25 hover:bg-error-container/40 text-error border border-error/30'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">cancel</span>
                    <span>Absent</span>
                  </button>

                  <button
                    onClick={() => markAttendance(subject.id, entry.id, selectedDate, 'cancelled')}
                    className={`px-space-md py-space-sm rounded-xl font-title-sm text-title-sm flex items-center justify-center gap-space-xs transition-all active:scale-95 cursor-pointer ${
                      status === 'cancelled'
                        ? 'bg-secondary text-on-secondary font-bold'
                        : 'bg-surface-container-high/60 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">event_busy</span>
                    <span>Cancelled / Off</span>
                  </button>

                  <button
                    onClick={() => markAttendance(subject.id, entry.id, selectedDate, 'not_marked')}
                    className={`px-space-md py-space-sm rounded-xl font-title-sm text-body-sm flex items-center justify-center gap-space-xs transition-all active:scale-95 cursor-pointer ${
                      status === 'not_marked'
                        ? 'bg-surface-container-highest text-outline font-semibold border border-white/10'
                        : 'bg-surface-container-lowest/40 hover:bg-surface-container-low text-outline border border-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">undo</span>
                    <span>Clear Status</span>
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

    </div>
  );
};
