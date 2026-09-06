import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { simulateAttendance } from '../lib/attendanceCalculator';

export const WhatIfCalculator: React.FC = () => {
  const {
    subjects,
    subjectStatsList,
    overallStats,
    globalTarget,
  } = useAttendance();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [futureAttendCount, setFutureAttendCount] = useState<number>(5);
  const [futureSkipCount, setFutureSkipCount] = useState<number>(2);

  // Determine base counts based on selection
  const selectedStats = useMemo(() => {
    if (selectedSubjectId === 'all') {
      return {
        name: 'All Subjects Combined',
        code: 'AGGREGATE',
        attended: overallStats.totalAttended,
        conducted: overallStats.totalConducted,
        percentage: overallStats.percentage,
        target: globalTarget,
      };
    }
    const found = subjectStatsList.find(s => s.subject.id === selectedSubjectId);
    if (!found) {
      return {
        name: 'All Subjects Combined',
        code: 'AGGREGATE',
        attended: overallStats.totalAttended,
        conducted: overallStats.totalConducted,
        percentage: overallStats.percentage,
        target: globalTarget,
      };
    }
    return {
      name: found.subject.name,
      code: found.subject.code,
      attended: found.attended,
      conducted: found.conducted,
      percentage: found.percentage,
      target: found.effectiveTarget,
    };
  }, [selectedSubjectId, subjectStatsList, overallStats, globalTarget]);

  // Run Real Mathematical Simulation
  const attendSimulation = useMemo(() => {
    return simulateAttendance(
      selectedStats.attended,
      selectedStats.conducted,
      selectedStats.target,
      futureAttendCount,
      0
    );
  }, [selectedStats, futureAttendCount]);

  const skipSimulation = useMemo(() => {
    return simulateAttendance(
      selectedStats.attended,
      selectedStats.conducted,
      selectedStats.target,
      0,
      futureSkipCount
    );
  }, [selectedStats, futureSkipCount]);

  return (
    <div className="flex flex-col w-full pb-space-3xl gap-space-2xl">
      
      {/* Top Cinematic Header Section */}
      <section className="relative w-full rounded-2xl bg-surface-container-low/70 backdrop-blur-2xl border border-white/10 p-space-xl md:p-space-2xl shadow-2xl overflow-hidden">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-primary-container/20 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-tertiary-container/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
          <div className="flex flex-col max-w-2xl gap-space-xs">
            <div className="flex items-center gap-space-xs text-primary">
              <span className="material-symbols-outlined text-title-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                insights
              </span>
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">
                Dynamic Trajectory Projection Engine
              </span>
            </div>
            <h1 className="font-display-hero text-3xl sm:text-5xl lg:text-display-hero text-on-surface tracking-tight leading-tight">
              What happens if...?
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Simulate skips, plan holidays, and calculate exact recovery targets with real-time probabilistic projection.
            </p>
          </div>

          <div className="flex items-center gap-space-md p-space-sm bg-surface-container-highest/60 backdrop-blur-xl rounded-full self-start md:self-auto border border-white/5 shadow-sm">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined">precision_manufacturing</span>
            </div>
            <div className="flex flex-col pr-space-md">
              <span className="font-label-caps text-label-caps uppercase text-outline">Target Policy</span>
              <span className="font-headline-md text-headline-md text-on-surface leading-tight font-bold">
                {selectedStats.target.toFixed(1)}% Minimum
              </span>
            </div>
          </div>
        </div>

        {/* Subject Selector Ribbon */}
        <div className="mt-space-xl pt-space-lg border-t border-white/5 flex flex-col xl:flex-row gap-space-md items-start xl:items-center justify-between">
          <div className="flex flex-wrap items-center gap-space-xs p-space-2xs bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl border border-white/5 shadow-inner">
            <div className="flex items-center gap-space-sm px-space-md py-space-xs bg-primary-container text-on-primary-container rounded-xl shadow-sm font-semibold">
              <span className="material-symbols-outlined text-title-sm">lan</span>
              <span>{selectedStats.name}</span>
              <span className="font-label-caps text-label-caps bg-on-primary-container/15 px-space-2xs py-0.5 rounded">
                {selectedStats.code}
              </span>
            </div>

            <div className="flex items-center gap-space-md px-space-md py-space-xs text-on-surface">
              <div className="flex items-center gap-space-xs font-label-data-md text-label-data-md">
                <span className="text-on-surface-variant">Attended:</span>
                <span className="font-bold text-primary">{selectedStats.attended}</span>
                <span className="text-outline">/</span>
                <span className="font-bold text-on-surface">{selectedStats.conducted}</span>
              </div>
              <div className="h-3 w-px bg-surface-variant" />
              <div className="flex items-center gap-space-xs font-label-data-md text-label-data-md">
                <span className="text-on-surface-variant">Status:</span>
                <span className={`font-bold ${selectedStats.percentage !== null && selectedStats.percentage >= selectedStats.target ? 'text-tertiary' : 'text-error'}`}>
                  {selectedStats.percentage !== null ? `${selectedStats.percentage.toFixed(1)}%` : 'No Data'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Course Selector Pills */}
          <div className="flex items-center gap-space-xs overflow-x-auto w-full xl:w-auto py-space-2xs no-scrollbar">
            <button
              onClick={() => setSelectedSubjectId('all')}
              className={`px-space-md py-space-xs rounded-full transition-all text-body-sm font-title-sm whitespace-nowrap cursor-pointer ${
                selectedSubjectId === 'all'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-md'
                  : 'bg-surface-container-high/90 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Combined
            </button>

            {subjects.map(s => {
              const st = subjectStatsList.find(item => item.subject.id === s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`px-space-md py-space-xs rounded-full transition-all text-body-sm font-title-sm whitespace-nowrap cursor-pointer ${
                    selectedSubjectId === s.id
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-md'
                      : 'bg-surface-variant/40 text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {s.name} ({st?.percentage !== null && st?.percentage !== undefined ? `${st.percentage.toFixed(1)}%` : 'No Data'})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dual Simulation Engines: Attend vs Skip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl w-full">
        
        {/* Panel A: Attend Future Classes (Positive Trajectory) */}
        <GlassCard
          variant="base"
          glowColor="tertiary"
          className="p-space-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-space-md border-b border-white/5">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    add_task
                  </span>
                </div>
                <div>
                  <span className="font-label-caps text-label-caps uppercase text-tertiary font-bold">
                    Trajectory Boost
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    Attend Future Classes
                  </h2>
                </div>
              </div>
              <StatusBadge status="Healthy" label="Recovery Model" />
            </div>

            {/* Stepper Interactive Control */}
            <div className="my-space-lg p-space-lg rounded-2xl bg-surface-container-lowest/60 backdrop-blur-md border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-inner">
              <span className="font-body-lg text-body-lg text-on-surface font-medium text-center sm:text-left">
                If I attend the next:
              </span>
              <div className="flex items-center gap-space-sm bg-surface-container-high/90 p-space-2xs rounded-full shadow-md">
                <button
                  onClick={() => setFutureAttendCount(Math.max(1, futureAttendCount - 1))}
                  className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-bright active:scale-90 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <div className="w-12 text-center">
                  <span className="font-label-data-lg text-label-data-lg text-on-surface font-bold">
                    {futureAttendCount}
                  </span>
                </div>
                <button
                  onClick={() => setFutureAttendCount(futureAttendCount + 1)}
                  className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:opacity-90 active:scale-90 transition-all shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
                <span className="font-body-md text-on-surface-variant pr-space-md">lectures</span>
              </div>
            </div>

            {/* Metric Comparison */}
            <div className="grid grid-cols-2 gap-space-md p-space-lg rounded-2xl bg-surface-container/60 backdrop-blur-md border border-white/5 shadow-sm">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Baseline State
                </span>
                <div className="flex items-baseline gap-space-2xs mt-space-2xs">
                  <span className="font-label-data-lg text-label-data-lg text-on-surface-variant font-bold">
                    {selectedStats.percentage !== null ? `${selectedStats.percentage.toFixed(1)}%` : 'No Data'}
                  </span>
                  <span className="font-body-sm text-outline">
                    ({selectedStats.attended}/{selectedStats.conducted})
                  </span>
                </div>
              </div>

              <div className="flex flex-col pl-space-md border-l border-white/5">
                <span className="font-label-caps text-label-caps uppercase text-tertiary font-bold">
                  Forecasted Standing
                </span>
                <div className="flex items-baseline gap-space-2xs mt-space-2xs">
                  <span className="font-label-data-lg text-headline-xl text-tertiary font-bold tracking-tight">
                    {attendSimulation.projectedPercentage !== null ? `${attendSimulation.projectedPercentage.toFixed(1)}%` : 'N/A'}
                  </span>
                  <span className="font-body-sm text-tertiary">
                    ({attendSimulation.projectedAttended}/{attendSimulation.projectedConducted})
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-tertiary mt-1 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-body-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  {attendSimulation.percentageDelta !== null ? `+${attendSimulation.percentageDelta.toFixed(1)}% Net Boost` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Statement */}
          <div className="mt-space-lg p-space-md rounded-2xl bg-tertiary-container/10 border border-tertiary/20 text-on-surface flex items-center gap-space-sm shadow-sm">
            <span className="material-symbols-outlined text-tertiary text-2xl">event_available</span>
            <p className="font-body-md text-body-md leading-relaxed">
              Attending the next <strong className="text-tertiary font-semibold">{futureAttendCount} classes</strong> will result in a projected standing of <strong className="text-tertiary font-semibold">{attendSimulation.projectedPercentage?.toFixed(1)}%</strong>, unlocking <strong className="text-on-surface">{attendSimulation.projectedSafeSkips} safe skips</strong>.
            </p>
          </div>
        </GlassCard>

        {/* Panel B: Skip Future Classes (Risk Trajectory) */}
        <GlassCard
          variant="base"
          glowColor="error"
          className="p-space-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-space-md border-b border-white/5">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    do_not_disturb_on
                  </span>
                </div>
                <div>
                  <span className="font-label-caps text-label-caps uppercase text-error font-bold">
                    Deficit Stress Test
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    Skip Future Classes
                  </h2>
                </div>
              </div>
              <StatusBadge status={skipSimulation.isSafe ? 'Healthy' : 'Below Target'} label={skipSimulation.isSafe ? 'Safe Margin' : 'High Hazard'} />
            </div>

            {/* Stepper Interactive Control */}
            <div className="my-space-lg p-space-lg rounded-2xl bg-surface-container-lowest/60 backdrop-blur-md border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-inner">
              <span className="font-body-lg text-body-lg text-on-surface font-medium text-center sm:text-left">
                If I skip the next:
              </span>
              <div className="flex items-center gap-space-sm bg-surface-container-high/90 p-space-2xs rounded-full shadow-md">
                <button
                  onClick={() => setFutureSkipCount(Math.max(1, futureSkipCount - 1))}
                  className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-bright active:scale-90 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <div className="w-12 text-center">
                  <span className="font-label-data-lg text-label-data-lg text-on-surface font-bold">
                    {futureSkipCount}
                  </span>
                </div>
                <button
                  onClick={() => setFutureSkipCount(futureSkipCount + 1)}
                  className="w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center hover:opacity-90 active:scale-90 transition-all shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
                <span className="font-body-md text-on-surface-variant pr-space-md">lectures</span>
              </div>
            </div>

            {/* Metric Comparison */}
            <div className="grid grid-cols-2 gap-space-md p-space-lg rounded-2xl bg-surface-container/60 backdrop-blur-md border border-white/5 shadow-sm">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Baseline State
                </span>
                <div className="flex items-baseline gap-space-2xs mt-space-2xs">
                  <span className="font-label-data-lg text-label-data-lg text-on-surface-variant font-bold">
                    {selectedStats.percentage !== null ? `${selectedStats.percentage.toFixed(1)}%` : 'No Data'}
                  </span>
                  <span className="font-body-sm text-outline">
                    ({selectedStats.attended}/{selectedStats.conducted})
                  </span>
                </div>
              </div>

              <div className="flex flex-col pl-space-md border-l border-white/5">
                <span className="font-label-caps text-label-caps uppercase text-error font-bold">
                  Forecasted Standing
                </span>
                <div className="flex items-baseline gap-space-2xs mt-space-2xs">
                  <span className={`font-label-data-lg text-headline-xl font-bold tracking-tight ${skipSimulation.isSafe ? 'text-amber-400' : 'text-error'}`}>
                    {skipSimulation.projectedPercentage !== null ? `${skipSimulation.projectedPercentage.toFixed(1)}%` : 'N/A'}
                  </span>
                  <span className="font-body-sm text-outline">
                    ({skipSimulation.projectedAttended}/{skipSimulation.projectedConducted})
                  </span>
                </div>
                <span className={`font-body-sm text-body-sm mt-1 flex items-center gap-1 font-medium ${skipSimulation.isSafe ? 'text-amber-400' : 'text-error'}`}>
                  <span className="material-symbols-outlined text-body-sm">
                    {skipSimulation.isSafe ? 'warning' : 'dangerous'}
                  </span>
                  {skipSimulation.percentageDelta !== null ? `${skipSimulation.percentageDelta.toFixed(1)}% Net Drop` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Statement */}
          <div className={`mt-space-lg p-space-md rounded-2xl border text-on-surface flex items-center gap-space-sm shadow-sm ${
            skipSimulation.isSafe ? 'bg-amber-500/10 border-amber-500/20' : 'bg-error-container/20 border-error/30'
          }`}>
            <span className={`material-symbols-outlined text-2xl ${skipSimulation.isSafe ? 'text-amber-400' : 'text-error'}`}>
              {skipSimulation.isSafe ? 'shield' : 'report'}
            </span>
            <p className="font-body-md text-body-md leading-relaxed">
              {skipSimulation.isSafe
                ? `Skipping ${futureSkipCount} classes keeps your attendance at ${skipSimulation.projectedPercentage?.toFixed(1)}%, which is still above your ${selectedStats.target}% target.`
                : `Skipping ${futureSkipCount} classes will drop your attendance to ${skipSimulation.projectedPercentage?.toFixed(1)}%, breaching your target by ${Math.abs((skipSimulation.projectedPercentage || 0) - selectedStats.target).toFixed(1)}%. You will need ${skipSimulation.projectedRecoveryNeeded} recovery classes to fix this.`}
            </p>
          </div>
        </GlassCard>

      </div>

    </div>
  );
};
