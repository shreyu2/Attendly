import React from 'react';
import { Modal } from '../ui/Modal';
import { useAttendance } from '../../context/AttendanceContext';
import { StatusBadge } from '../ui/StatusBadge';
import { GlassButton } from '../ui/GlassButton';
import { Link } from 'react-router-dom';

interface CanISkipTomorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CanISkipTomorrowModal: React.FC<CanISkipTomorrowModalProps> = ({ isOpen, onClose }) => {
  const { canSkipTomorrowResult } = useAttendance();

  const {
    dayName,
    date,
    totalClassesScheduled,
    subjectsImpacted,
    overallSafe,
    summaryMessage,
  } = canSkipTomorrowResult;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Can I Skip Tomorrow?"
      subtitle={`Predictive analysis for ${dayName}, ${date}`}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-space-md">
        
        {/* Top Summary Decision Capsule */}
        <div
          className={`p-space-lg rounded-xl border backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center gap-space-md shadow-lg ${
            overallSafe
              ? 'bg-tertiary-container/15 border-tertiary/40 text-tertiary shadow-[0_0_20px_rgba(78,230,170,0.15)]'
              : totalClassesScheduled === 0
              ? 'bg-surface-container-high/60 border-white/10 text-on-surface'
              : 'bg-error-container/20 border-error/40 text-error shadow-[0_0_20px_rgba(255,180,171,0.15)]'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              overallSafe
                ? 'bg-tertiary-container/30 text-tertiary'
                : totalClassesScheduled === 0
                ? 'bg-surface-variant text-on-surface-variant'
                : 'bg-error-container/40 text-error'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">
              {overallSafe ? 'verified' : totalClassesScheduled === 0 ? 'weekend' : 'warning'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md font-bold leading-tight">
              {overallSafe
                ? 'Safe to Skip Tomorrow'
                : totalClassesScheduled === 0
                ? 'No Scheduled Classes'
                : 'Caution: Skipping Will Cause Deficit'}
            </span>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-normal">
              {summaryMessage}
            </p>
          </div>
        </div>

        {/* Breakdown by Tomorrow's Scheduled Subjects */}
        {subjectsImpacted.length > 0 && (
          <div className="flex flex-col gap-space-xs mt-space-xs">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Subject Impact Matrix ({totalClassesScheduled} classes scheduled)
            </span>

            <div className="flex flex-col gap-space-xs">
              {subjectsImpacted.map(item => (
                <div
                  key={item.subject.id}
                  className="p-space-md rounded-xl bg-surface-container-low/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-title-sm text-title-sm text-on-surface font-semibold">
                        {item.subject.name}
                      </span>
                      <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded bg-surface-variant text-secondary">
                        {item.subject.code}
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      {item.classCountTomorrow} {item.classCountTomorrow === 1 ? 'class' : 'classes'} scheduled • Target: {item.target}%
                    </span>
                  </div>

                  <div className="flex items-center gap-space-md justify-between sm:justify-end">
                    <div className="flex flex-col text-right">
                      <div className="flex items-baseline gap-1 font-label-data-md text-label-data-md">
                        <span className="text-on-surface-variant">Current:</span>
                        <span className="text-on-surface font-semibold">
                          {item.currentPercentage !== null ? `${item.currentPercentage.toFixed(1)}%` : 'No Data'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 font-label-data-md text-label-data-md">
                        <span className="text-on-surface-variant">If missed:</span>
                        <span
                          className={`font-semibold ${
                            item.isSafeToSkipAll ? 'text-tertiary' : 'text-error'
                          }`}
                        >
                          {item.projectedPercentageIfSkipped !== null
                            ? `${item.projectedPercentageIfSkipped.toFixed(1)}%`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <StatusBadge
                      status={item.isSafeToSkipAll ? 'Healthy' : 'Below Target'}
                      label={item.isSafeToSkipAll ? 'Safe to Skip' : 'Attendance Advised'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-space-md pt-space-sm border-t border-white/5 flex items-center justify-between">
          <Link
            to="/what-if"
            onClick={onClose}
            className="font-title-sm text-body-sm text-primary hover:text-on-surface flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            <span>Open Custom What-If Simulator</span>
          </Link>
          <GlassButton variant="secondary" size="sm" onClick={onClose}>
            Got it
          </GlassButton>
        </div>
      </div>
    </Modal>
  );
};
