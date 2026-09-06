import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getTodayDateString, formatFullHeaderDate } from '../lib/dateUtils';

export const Calendar: React.FC = () => {
  const { profile } = useAuth();
  const { records, getDaySchedule, markAttendance } = useAttendance();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayDateString());

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, monthIndex - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, monthIndex + 1, 1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(getTodayDateString());
  };

  // Generate 35 or 42 grid cells (including padding for previous and next month)
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  // Mon = 1, Sun = 0. In European/Academic layout, Monday is column 0
  const startingDayOffset = (firstDayOfMonth.getDay() + 6) % 7;

  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const calendarCells = [];

  // Previous month filler days
  for (let i = startingDayOffset - 1; i >= 0; i--) {
    const d = totalDaysInPrevMonth - i;
    const prevMonthIdx = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      day: d,
      dateStr,
      isCurrentMonth: false,
      isWeekend: false,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const jsDay = new Date(year, monthIndex, d).getDay();
    calendarCells.push({
      day: d,
      dateStr,
      isCurrentMonth: true,
      isWeekend: jsDay === 0 || jsDay === 6,
    });
  }

  // Next month filler days to complete 35 or 42 cells
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthIdx = monthIndex === 11 ? 0 : monthIndex + 1;
    const nextYear = monthIndex === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      day: d,
      dateStr,
      isCurrentMonth: false,
      isWeekend: false,
    });
  }

  const selectedSchedule = getDaySchedule(selectedDateStr);
  const [selYear, selMonth, selDay] = selectedDateStr.split('-').map(Number);
  const selectedDateObj = new Date(selYear, selMonth - 1, selDay);

  return (
    <div className="flex flex-col w-full pb-space-3xl">
      
      {/* Page Header & Control Hub */}
      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg mb-space-xl">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-container/20 text-primary">
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            </span>
            <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider font-semibold">
              {profile?.semester ? `Temporal Matrix • ${profile.semester}` : 'Temporal Attendance Matrix'}
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Attendance Calendar
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {monthNames[monthIndex]} {year} • Track logged lecture sessions, absences, and cancelled classes.
          </p>
        </div>

        {/* Month Navigation Capsule */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center p-space-2xs rounded-full bg-surface-container/70 border border-white/10 backdrop-blur-2xl shadow-xl">
            <button
              onClick={prevMonth}
              aria-label="Previous Month"
              className="flex items-center justify-center w-9 h-9 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <div className="flex items-center px-space-md gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">event</span>
              <span className="font-title-sm text-title-sm text-on-surface select-none font-semibold">
                {monthNames[monthIndex]} {year}
              </span>
            </div>
            <button
              onClick={nextMonth}
              aria-label="Next Month"
              className="flex items-center justify-center w-9 h-9 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

          <button
            onClick={jumpToToday}
            className="px-space-md py-space-xs rounded-full bg-surface-container-high text-on-surface font-title-sm text-title-sm hover:bg-surface-bright transition-all shadow-md flex items-center gap-space-xs border border-white/5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">today</span>
            <span>Jump to Today</span>
          </button>
        </div>
      </section>

      {/* Legend Ribbon Strip */}
      <div className="mb-space-xl p-space-sm rounded-2xl bg-surface-container-low/60 border border-white/5 backdrop-blur-xl shadow-lg flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-y-space-xs gap-x-space-lg px-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(78,230,170,0.6)]" />
            <span className="font-label-caps text-label-caps uppercase text-on-surface">Fully Present</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="font-label-caps text-label-caps uppercase text-on-surface">Partially Logged</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)]" />
            <span className="font-label-caps text-label-caps uppercase text-on-surface">Absence Incurred</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-bright border border-outline" />
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Not Marked</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="w-3 h-1 rounded-full bg-secondary" />
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Class Off</span>
          </div>
        </div>
      </div>

      {/* Main Workspace: Split Grid (8 Cols Calendar + 4 Cols Day Inspector) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        
        {/* Calendar Matrix (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-space-md">
          <GlassCard variant="base" className="p-space-lg flex flex-col">
            
            {/* Days Header Row */}
            <div className="grid grid-cols-7 gap-space-xs mb-space-sm text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayName => (
                <div key={dayName} className="py-space-2xs font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Days 7-Col Grid */}
            <div className="grid grid-cols-7 gap-space-xs">
              {calendarCells.map(cell => {
                const dayRecords = records.filter(r => r.date === cell.dateStr);
                const hasPresent = dayRecords.some(r => r.status === 'present');
                const hasAbsent = dayRecords.some(r => r.status === 'absent');
                const isSelected = cell.dateStr === selectedDateStr;
                const isToday = cell.dateStr === getTodayDateString();

                let dotBg = 'bg-transparent';
                if (hasAbsent) {
                  dotBg = 'bg-error shadow-[0_0_6px_rgba(255,180,171,0.8)]';
                } else if (hasPresent) {
                  dotBg = 'bg-tertiary shadow-[0_0_6px_rgba(78,230,170,0.8)]';
                }

                return (
                  <button
                    key={cell.dateStr}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`text-left p-space-sm rounded-xl transition-all flex flex-col justify-between min-h-[90px] border cursor-pointer group ${
                      isSelected
                        ? 'bg-surface-container-highest/90 border-primary shadow-[0_0_20px_rgba(56,189,248,0.35)] scale-[1.02]'
                        : isToday
                        ? 'bg-surface-container/90 border-primary/40'
                        : cell.isCurrentMonth
                        ? 'bg-surface-container-low/60 hover:bg-surface-container-high/60 border-white/5'
                        : 'bg-surface-container-lowest/30 opacity-40 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`font-label-data-md text-label-data-md ${isSelected || isToday ? 'text-primary font-bold' : 'text-on-surface'}`}>
                        {String(cell.day).padStart(2, '0')}
                      </span>
                      {isToday ? (
                        <span className="font-label-caps text-[9px] px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-bold">
                          TODAY
                        </span>
                      ) : (
                        <span className={`w-2 h-2 rounded-full ${dotBg}`} />
                      )}
                    </div>

                    <div className="mt-space-xs flex flex-col gap-0.5">
                      {dayRecords.length > 0 ? (
                        <span className="font-label-caps text-[10px] text-tertiary">
                          {dayRecords.filter(r => r.status === 'present').length} / {dayRecords.length} Present
                        </span>
                      ) : cell.isWeekend ? (
                        <span className="font-label-caps text-[10px] text-outline">Weekend</span>
                      ) : (
                        <span className="font-label-caps text-[10px] text-outline">No logs</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Selected Date Inspector Sidebar (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          <GlassCard variant="elevated" className="p-space-lg flex flex-col gap-space-md">
            <div>
              <div className="flex items-center justify-between pb-space-xs border-b border-white/5 mb-space-sm">
                <span className="font-label-caps text-label-caps uppercase text-primary font-semibold tracking-wider">
                  Day Inspector
                </span>
                <span className="font-label-data-md text-label-data-md text-on-surface-variant">
                  {selectedDateStr}
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                {formatFullHeaderDate(selectedDateObj)}
              </h2>
            </div>

            {/* List of classes on this date */}
            {selectedSchedule.length === 0 ? (
              <div className="p-space-lg rounded-xl bg-surface-container-low/60 text-center text-outline font-body-sm">
                No classes scheduled in timetable for this day.
              </div>
            ) : (
              <div className="flex flex-col gap-space-xs">
                {selectedSchedule.map(({ entry, subject, status }) => (
                  <div
                    key={entry.id}
                    className="p-space-sm rounded-xl bg-surface-container-low/80 border border-white/5 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-data-md text-label-data-md text-primary font-semibold">
                        {entry.start_time} - {entry.end_time}
                      </span>
                      <StatusBadge status={status} />
                    </div>

                    <span className="font-title-sm text-title-sm text-on-surface font-medium truncate">
                      {subject.name}
                    </span>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="font-body-sm text-[11px] text-outline">
                        {subject.code} • {entry.room || 'Campus'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => markAttendance(subject.id, entry.id, selectedDateStr, 'present')}
                          className={`px-2 py-0.5 rounded text-[10px] font-label-caps cursor-pointer ${
                            status === 'present' ? 'bg-tertiary text-on-tertiary font-bold' : 'bg-surface-variant hover:text-tertiary text-on-surface-variant'
                          }`}
                        >
                          P
                        </button>
                        <button
                          onClick={() => markAttendance(subject.id, entry.id, selectedDateStr, 'absent')}
                          className={`px-2 py-0.5 rounded text-[10px] font-label-caps cursor-pointer ${
                            status === 'absent' ? 'bg-error text-on-error font-bold' : 'bg-surface-variant hover:text-error text-on-surface-variant'
                          }`}
                        >
                          A
                        </button>
                        <button
                          onClick={() => markAttendance(subject.id, entry.id, selectedDateStr, 'cancelled')}
                          className={`px-2 py-0.5 rounded text-[10px] font-label-caps cursor-pointer ${
                            status === 'cancelled' ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface-variant hover:text-secondary text-on-surface-variant'
                          }`}
                        >
                          C
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
