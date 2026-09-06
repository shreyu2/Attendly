import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { AttendanceRing } from '../components/ui/AttendanceRing';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getDayName, formatDateShort } from '../lib/dateUtils';

export const SubjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    subjects,
    records,
    timetable,
    subjectStatsList,
    markAttendance,
  } = useAttendance();

  const stats = subjectStatsList.find(s => s.subject.id === id);
  const subject = stats?.subject || subjects.find(s => s.id === id);

  if (!subject || !stats) {
    return (
      <div className="p-space-2xl text-center">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Subject Not Found</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2 mb-space-lg">
          The requested subject does not exist or has been deleted.
        </p>
        <Link to="/subjects" className="px-space-md py-space-xs rounded-full bg-primary-container text-on-primary-container font-title-sm">
          Return to Subjects
        </Link>
      </div>
    );
  }

  const isDeficit = stats.percentage !== null && stats.percentage < stats.effectiveTarget;
  const subjectRecords = records
    .filter(r => r.subject_id === subject.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const subjectTimetable = timetable.filter(t => t.subject_id === subject.id);

  return (
    <div className="flex flex-col w-full pb-space-3xl">
      
      {/* Sub-Header & Breadcrumb Bar */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm mb-space-lg">
        <div className="flex items-center gap-space-xs">
          <Link
            to="/subjects"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-space-2xs"
          >
            <span className="material-symbols-outlined text-sm">folder_open</span>
            Subjects
          </Link>
          <span className="text-outline font-label-data-md">/</span>
          <span className="font-title-sm text-title-sm text-on-surface flex items-center gap-space-2xs">
            {subject.name}
            <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-secondary font-label-caps text-label-caps tracking-widest">
              {subject.code}
            </span>
          </span>
        </div>

        <button
          onClick={() => navigate('/subjects')}
          className="px-space-md py-space-xs rounded-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest hover:text-primary transition-all duration-200 flex items-center gap-space-xs font-title-sm text-title-sm shadow-sm group cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          Back to Subjects
        </button>
      </section>

      {/* Subject Hero Banner */}
      <GlassCard
        variant="base"
        glowColor={isDeficit ? 'error' : 'tertiary'}
        className="p-space-lg lg:p-space-xl overflow-hidden shadow-xl mb-space-xl"
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
          
          {/* Left 7 cols: Title, Badges, Metrics breakdown */}
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="flex flex-wrap items-center gap-space-xs">
              <StatusBadge
                status={stats.status}
                label={
                  isDeficit
                    ? `Below ${stats.effectiveTarget.toFixed(1)}% Target`
                    : `Safe Margin (+${stats.safeSkips} Skips)`
                }
              />
              <span className="px-space-sm py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps">
                {subject.room || 'Room TBA'}
              </span>
              <span className="px-space-sm py-space-2xs rounded-full bg-surface-container-high text-secondary font-label-caps text-label-caps">
                {subject.credits || 3.0} Credits
              </span>
              <span className="px-space-sm py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps">
                {subject.target_percentage !== null ? 'Custom Target' : 'Global Target Inherited'}
              </span>
            </div>

            <div>
              <h1 className="font-headline-xl text-3xl sm:text-headline-xl text-on-surface tracking-tight">
                {subject.name}
              </h1>
              <div className="flex items-center gap-space-xs mt-space-2xs text-on-surface-variant">
                <span className="material-symbols-outlined text-base text-primary">person</span>
                <span className="font-body-md text-body-md text-on-surface">
                  {subject.faculty || 'Faculty Instructor'}
                </span>
                <span className="text-outline">•</span>
                <span className="font-body-md text-body-md text-on-surface-variant">
                  {profile?.department || 'Academic Department'}
                </span>
              </div>
            </div>

            {/* Metric Tallies (Mini Pill Grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs pt-space-xs">
              <div className="p-space-sm rounded-xl bg-surface-container-low/70 border border-white/5 flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Attended</span>
                <span className="font-label-data-lg text-label-data-lg text-tertiary font-bold">{stats.attended}</span>
                <span className="font-body-sm text-body-sm text-outline">Verified classes</span>
              </div>
              <div className="p-space-sm rounded-xl bg-surface-container-low/70 border border-white/5 flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Conducted</span>
                <span className="font-label-data-lg text-label-data-lg text-on-surface font-bold">{stats.conducted}</span>
                <span className="font-body-sm text-body-sm text-outline">Total held</span>
              </div>
              <div className="p-space-sm rounded-xl bg-surface-container-low/70 border border-white/5 flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Absences</span>
                <span className="font-label-data-lg text-label-data-lg text-error font-bold">{stats.absent}</span>
                <span className="font-body-sm text-body-sm text-outline">Unexcused missed</span>
              </div>
              <div className="p-space-sm rounded-xl bg-surface-container-low/70 border border-white/5 flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Cancelled</span>
                <span className="font-label-data-lg text-label-data-lg text-on-surface-variant font-bold">{stats.cancelled}</span>
                <span className="font-body-sm text-body-sm text-outline">Excluded tally</span>
              </div>
            </div>
          </div>

          {/* Right 5 cols: Radial Optical Gauge & Target Benchmark */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-center justify-center lg:items-end gap-space-md p-space-md rounded-2xl bg-surface-container-lowest/40 backdrop-blur-md border border-white/5">
            <div className="flex items-center gap-space-lg">
              <AttendanceRing
                percentage={stats.percentage}
                target={stats.effectiveTarget}
                size={130}
                strokeWidth={10}
              />
              <div className="flex flex-col gap-space-2xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Target Benchmark:</span>
                  <span className="font-label-data-md text-label-data-md text-on-surface font-semibold">
                    {stats.effectiveTarget.toFixed(1)}%
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-outline max-w-xs">
                  {subject.target_percentage !== null
                    ? 'Configured as custom subject requirement.'
                    : 'Inherited from Global Minimum Policy.'}
                </p>
                <Link
                  to="/settings"
                  className="font-title-sm text-body-sm text-primary hover:underline mt-space-2xs flex items-center gap-1 group"
                >
                  <span>Adjust Target Threshold</span>
                  <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">
                    tune
                  </span>
                </Link>
              </div>
            </div>

            <div className="w-full flex items-center justify-between px-space-md py-space-xs rounded-xl bg-surface-container-high/60 border border-white/5 text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1 font-body-sm">
                <span className={`material-symbols-outlined text-sm ${isDeficit ? 'text-error' : 'text-tertiary'}`}>
                  {isDeficit ? 'trending_down' : 'trending_up'}
                </span>
                {stats.percentage !== null
                  ? `${isDeficit ? 'Deficit' : 'Margin'}: ${Math.abs(stats.percentage - stats.effectiveTarget).toFixed(1)}%`
                  : 'No attendance recorded'}
              </span>
              <span className={`font-label-caps text-label-caps uppercase font-semibold ${isDeficit ? 'text-error' : 'text-tertiary'}`}>
                {isDeficit ? 'Recovery Advised' : 'Safe Standing'}
              </span>
            </div>
          </div>

        </div>
      </GlassCard>

      {/* Section 2: Core Decision Cards (3 Bento Columns) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-xl">
        
        {/* Card 1: Safe Skips */}
        <GlassCard variant="base" className="p-space-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                Safe Skips Available
              </span>
              <span className={`p-1.5 rounded-full flex items-center justify-center ${stats.safeSkips > 0 ? 'bg-tertiary-container/30 text-tertiary' : 'bg-error-container/40 text-error'}`}>
                <span className="material-symbols-outlined text-sm">
                  {stats.safeSkips > 0 ? 'beach_access' : 'block'}
                </span>
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs mb-space-xs">
              <span className={`font-label-data-lg text-4xl font-bold ${stats.safeSkips > 0 ? 'text-tertiary' : 'text-error'}`}>
                {stats.safeSkips}
              </span>
              <span className="font-title-sm text-title-sm text-on-surface-variant">
                {stats.safeSkips === 1 ? 'Class' : 'Classes'}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {stats.safeSkips > 0
                ? `You can safely miss the next ${stats.safeSkips} lectures in this course without breaching your ${stats.effectiveTarget}% mandate.`
                : isDeficit
                ? `You are currently below target. Any additional absence will widen your deficit and require more makeup sessions.`
                : `You are exactly at target. Missing any class will put you into deficit.`}
            </p>
          </div>
        </GlassCard>

        {/* Card 2: Recovery Road */}
        <GlassCard variant="base" className="p-space-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                Recovery Requirement
              </span>
              <span className="p-1.5 rounded-full bg-primary-container/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">trending_up</span>
              </span>
            </div>
            <div className="flex items-baseline gap-space-xs mb-space-xs">
              <span className={`font-label-data-lg text-4xl font-bold ${isDeficit ? 'text-error' : 'text-primary'}`}>
                {stats.recoveryNeeded}
              </span>
              <span className="font-title-sm text-title-sm text-on-surface-variant">
                Consecutive Classes
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {isDeficit
                ? `Attend the next ${stats.recoveryNeeded} consecutive scheduled classes to lift your attendance back up to the required ${stats.effectiveTarget}%.`
                : `Optimal compliance maintained. Zero recovery sessions required.`}
            </p>
          </div>
        </GlassCard>

        {/* Card 3: What-If Link */}
        <GlassCard variant="base" className="p-space-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                Simulation Engine
              </span>
              <span className="p-1.5 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">insights</span>
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-space-2xs">
              Simulate Future Scenarios
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Project exact percentages for upcoming holidays, festivals, sick leaves, or makeup classes.
            </p>
          </div>
          <div className="mt-space-md">
            <Link
              to="/what-if"
              className="inline-flex items-center gap-1 text-primary hover:text-on-surface font-title-sm text-body-sm transition-colors"
            >
              <span>Open in What-If Calculator</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </GlassCard>

      </section>

      {/* Section 3: Scheduled Timetable Slots for this Subject */}
      <section className="mb-space-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-space-sm">
          Weekly Scheduled Slots
        </h2>
        {subjectTimetable.length === 0 ? (
          <div className="p-space-md rounded-xl bg-surface-container-low/60 text-on-surface-variant text-body-sm">
            No recurring weekly slots mapped for this subject in the timetable.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
            {subjectTimetable.map(slot => (
              <div
                key={slot.id}
                className="p-space-md rounded-xl bg-surface-container-low/70 border border-white/5 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between font-label-caps text-label-caps text-primary">
                  <span>{getDayName(slot.day_of_week)}</span>
                  <span className="px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant">
                    {slot.class_type}
                  </span>
                </div>
                <span className="font-label-data-md text-label-data-md text-on-surface font-semibold">
                  {slot.start_time} - {slot.end_time}
                </span>
                <span className="font-body-sm text-body-sm text-outline">
                  Room: {slot.room || 'Campus'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 4: Recent Attendance History */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Recorded History ({subjectRecords.length} sessions)
          </h2>
        </div>

        {subjectRecords.length === 0 ? (
          <div className="p-space-xl rounded-2xl bg-surface-container-low/50 border border-white/5 text-center text-on-surface-variant">
            No attendance records logged for this subject yet.
          </div>
        ) : (
          <div className="rounded-2xl bg-surface-container-low/70 border border-white/5 overflow-hidden shadow-lg">
            <div className="divide-y divide-white/5">
              {subjectRecords.slice(0, 20).map(rec => (
                <div
                  key={rec.id}
                  className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm hover:bg-surface-container-high/40 transition-colors"
                >
                  <div className="flex items-center gap-space-md">
                    <span className="font-label-data-md text-label-data-md text-on-surface font-semibold min-w-[90px]">
                      {formatDateShort(rec.date)}
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                      {rec.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-space-md">
                    <StatusBadge status={rec.status} />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => markAttendance(subject.id, rec.timetable_entry_id || undefined, rec.date, 'present')}
                        className={`p-1 rounded text-xs font-label-caps ${rec.status === 'present' ? 'text-tertiary font-bold' : 'text-outline hover:text-on-surface'}`}
                        title="Mark Present"
                      >
                        P
                      </button>
                      <button
                        onClick={() => markAttendance(subject.id, rec.timetable_entry_id || undefined, rec.date, 'absent')}
                        className={`p-1 rounded text-xs font-label-caps ${rec.status === 'absent' ? 'text-error font-bold' : 'text-outline hover:text-on-surface'}`}
                        title="Mark Absent"
                      >
                        A
                      </button>
                      <button
                        onClick={() => markAttendance(subject.id, rec.timetable_entry_id || undefined, rec.date, 'cancelled')}
                        className={`p-1 rounded text-xs font-label-caps ${rec.status === 'cancelled' ? 'text-secondary font-bold' : 'text-outline hover:text-on-surface'}`}
                        title="Mark Cancelled"
                      >
                        C
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

    </div>
  );
};
