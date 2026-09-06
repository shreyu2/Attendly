import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AttendanceRing } from '../components/ui/AttendanceRing';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Subject } from '../types';

export const Subjects: React.FC = () => {
  const {
    subjectStatsList,
    overallStats,
    globalTarget,
    addSubject,
    updateSubject,
    deleteSubject,
  } = useAttendance();

  const [filter, setFilter] = useState<'all' | 'danger' | 'safe'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [customTarget, setCustomTarget] = useState<string>('');
  const [faculty, setFaculty] = useState('');
  const [room, setRoom] = useState('');
  const [credits, setCredits] = useState('3.0');

  const openAddModal = () => {
    setName('');
    setCode('');
    setCustomTarget('');
    setFaculty('');
    setRoom('');
    setCredits('3.0');
    setEditingSubject(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setName(sub.name);
    setCode(sub.code);
    setCustomTarget(sub.target_percentage !== null ? String(sub.target_percentage) : '');
    setFaculty(sub.faculty || '');
    setRoom(sub.room || '');
    setCredits(String(sub.credits || 3.0));
    setEditingSubject(sub);
    setIsAddModalOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const parsedTarget = customTarget.trim() ? parseFloat(customTarget) : null;
    const parsedCredits = parseFloat(credits) || 3.0;

    if (editingSubject) {
      await updateSubject(editingSubject.id, {
        name,
        code: code.toUpperCase(),
        target_percentage: parsedTarget,
        faculty,
        room,
        credits: parsedCredits,
      });
    } else {
      await addSubject({
        name,
        code: code.toUpperCase(),
        target_percentage: parsedTarget,
        faculty,
        room,
        credits: parsedCredits,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this subject and all its attendance records?')) {
      await deleteSubject(id);
    }
  };

  const filteredStats = subjectStatsList.filter(item => {
    if (filter === 'danger') return item.percentage !== null && item.percentage < item.effectiveTarget;
    if (filter === 'safe') return item.percentage !== null && item.percentage >= item.effectiveTarget;
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-space-3xl">
      
      {/* Top Command & Header Deck */}
      <section className="relative w-full mb-space-2xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
          <div className="space-y-space-2xs">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant text-label-caps font-label-caps uppercase tracking-wider border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Course Roster & Attendance Targets
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Enrolled Subjects
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Manage custom target requirements, monitor risk thresholds, and inspect attendance logs.
            </p>
          </div>

          {/* Action & Filter Controls */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="flex items-center p-space-2xs rounded-full bg-surface-container-low border border-white/5 shadow-sm">
              <button
                onClick={() => setFilter('all')}
                className={`px-space-md py-space-xs rounded-full font-title-sm text-title-sm transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-primary-container text-on-primary-container shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Subjects <span className="font-label-data-md text-body-sm ml-1">({subjectStatsList.length})</span>
              </button>
              <button
                onClick={() => setFilter('danger')}
                className={`px-space-md py-space-xs rounded-full font-title-sm text-title-sm transition-all cursor-pointer ${
                  filter === 'danger'
                    ? 'bg-error-container/40 text-error shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Needs Attention{' '}
                <span className="font-label-data-md text-body-sm ml-1 text-error">
                  ({subjectStatsList.filter(s => s.percentage !== null && s.percentage < s.effectiveTarget).length})
                </span>
              </button>
              <button
                onClick={() => setFilter('safe')}
                className={`px-space-md py-space-xs rounded-full font-title-sm text-title-sm transition-all cursor-pointer ${
                  filter === 'safe'
                    ? 'bg-tertiary-container/30 text-tertiary shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Safe Margin{' '}
                <span className="font-label-data-md text-body-sm ml-1 text-tertiary">
                  ({subjectStatsList.filter(s => s.percentage !== null && s.percentage >= s.effectiveTarget).length})
                </span>
              </button>
            </div>

            <GlassButton variant="primary" icon="add" onClick={openAddModal}>
              Add New Subject
            </GlassButton>
          </div>
        </div>
      </section>

      {/* Summary Metric Ribbon */}
      <section className="w-full mb-space-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md p-space-lg rounded-2xl bg-surface-container-low/80 border border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />

          {/* Conducted */}
          <div className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container/70 border border-white/5 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
              <span className="font-label-caps text-label-caps uppercase tracking-wider">Total Conducted</span>
              <span className="material-symbols-outlined text-[18px] text-outline">history_edu</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-label-data-lg text-label-data-lg text-on-surface font-bold">
                {overallStats.totalConducted}
              </span>
              <span className="font-body-sm text-body-sm text-outline">Classes held</span>
            </div>
            <div className="mt-space-sm flex items-center gap-space-xs text-outline font-body-sm text-body-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-outline" />
              Excludes Cancelled / Unmarked
            </div>
          </div>

          {/* Attended */}
          <div className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container/70 border border-white/5 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
              <span className="font-label-caps text-label-caps uppercase tracking-wider">Total Attended</span>
              <span className="material-symbols-outlined text-[18px] text-tertiary">verified</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-label-data-lg text-label-data-lg text-tertiary font-bold">
                  {overallStats.totalAttended}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  / {overallStats.totalConducted}
                </span>
              </div>
              <span className="font-label-data-md text-label-data-md text-tertiary bg-tertiary-container/20 px-space-xs py-0.5 rounded-full">
                {overallStats.percentage !== null ? `${overallStats.percentage.toFixed(1)}%` : '0%'}
              </span>
            </div>
            <div className="mt-space-sm w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-tertiary h-full rounded-full"
                style={{ width: `${Math.min(100, overallStats.percentage || 0)}%` }}
              />
            </div>
          </div>

          {/* Statutory Target */}
          <div className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container/70 border border-white/5 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
              <span className="font-label-caps text-label-caps uppercase tracking-wider">Statutory Target</span>
              <span className="material-symbols-outlined text-[18px] text-primary">flag</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-label-data-lg text-label-data-lg text-primary font-bold">
                {globalTarget.toFixed(1)}%
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Global Default</span>
            </div>
            <div className="mt-space-sm flex items-center gap-space-xs text-primary font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              Safe baseline cutoff
            </div>
          </div>

          {/* Skip Reserves Pool */}
          <div className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container/70 border border-white/5 shadow-sm">
            <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
              <span className="font-label-caps text-label-caps uppercase tracking-wider">Safe Skips Pool</span>
              <span className="material-symbols-outlined text-[18px] text-secondary">beach_access</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-label-data-lg text-label-data-lg text-secondary font-bold">
                  {overallStats.totalSafeSkips}
                </span>
                <span className="font-body-sm text-body-sm text-outline">Classes</span>
              </div>
              <span className="font-label-caps text-label-caps text-secondary bg-secondary-container/40 px-space-xs py-0.5 rounded-full">
                Cumulative
              </span>
            </div>
            <div className="mt-space-sm flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
              Net buffer across active courses
            </div>
          </div>
        </div>
      </section>

      {/* Enrolled Subjects Grid */}
      <section className="w-full space-y-space-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="font-title-sm text-title-sm text-on-surface">Curriculum Stream</span>
            <span className="font-label-caps text-label-caps text-outline">Sorted by Course Standing</span>
          </div>
          <div className="flex items-center gap-space-md text-body-sm font-body-sm text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-error" /> Needs Recovery
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary" /> Safe Buffer
            </div>
          </div>
        </div>

        {filteredStats.length === 0 ? (
          <EmptyState
            icon="menu_book"
            title={filter === 'all' ? 'No subjects enrolled yet' : 'No subjects in this category'}
            description={
              filter === 'all'
                ? 'Get started by creating your first subject with its course code, credits, faculty, and attendance target.'
                : 'Switch filters above to view all enrolled courses.'
            }
            actionLabel={filter === 'all' ? 'Add First Subject' : undefined}
            onAction={filter === 'all' ? openAddModal : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            {filteredStats.map(item => {
              const isDeficit = item.percentage !== null && item.percentage < item.effectiveTarget;

              return (
                <GlassCard
                  key={item.subject.id}
                  variant="base"
                  glowColor={isDeficit ? 'error' : 'tertiary'}
                  className="lg:col-span-12 xl:col-span-6 p-space-xl flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Card Row */}
                    <div className="flex items-start justify-between gap-space-md mb-space-md">
                      <div className="space-y-1">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant">
                            {item.subject.code}
                          </span>
                          <span className="font-label-caps text-label-caps text-outline">
                            {item.subject.credits || 3.0} Credits • {item.subject.target_percentage ? 'Custom Target' : 'Inherited'}
                          </span>
                        </div>
                        <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight group-hover:text-primary transition-colors">
                          {item.subject.name}
                        </h2>
                      </div>

                      <div className="flex items-center gap-space-xs">
                        <StatusBadge
                          status={item.status}
                          label={
                            isDeficit
                              ? `Below Target (-${item.recoveryNeeded} to reach)`
                              : item.safeSkips > 0
                              ? `Safe (+${item.safeSkips} skips)`
                              : 'On Target'
                          }
                        />
                        <button
                          onClick={() => openEditModal(item.subject)}
                          className="p-1.5 rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                          title="Edit Subject"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      </div>
                    </div>

                    {/* Central Stats & Arc Gauge Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-space-md my-space-md items-center bg-surface-container-lowest/50 p-space-md rounded-xl border border-white/5">
                      <div className="sm:col-span-5 flex items-center gap-space-md">
                        <AttendanceRing
                          percentage={item.percentage}
                          target={item.effectiveTarget}
                          size={84}
                          strokeWidth={7}
                        />
                        <div className="space-y-0.5">
                          <div className="font-body-sm text-body-sm text-outline">Attended Ratio</div>
                          <div className="font-label-data-md text-label-data-md text-on-surface font-semibold">
                            {item.attended} <span className="text-outline font-normal">/ {item.conducted} held</span>
                          </div>
                          <div className={`font-label-caps text-label-caps ${isDeficit ? 'text-error' : 'text-tertiary'}`}>
                            {isDeficit ? `Deficit: ${item.recoveryNeeded} classes` : `Safe Buffer: ${item.safeSkips} classes`}
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-7 flex flex-col justify-center space-y-1.5 border-t sm:border-t-0 sm:border-l border-white/5 pt-space-xs sm:pt-0 sm:pl-space-md">
                        <div className="flex justify-between items-center text-body-sm">
                          <span className="text-on-surface-variant">Target Required:</span>
                          <span className="font-label-data-md text-label-data-md font-semibold text-primary">
                            {item.effectiveTarget}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-body-sm">
                          <span className="text-on-surface-variant">Absences Incurred:</span>
                          <span className="font-label-data-md text-label-data-md text-error">
                            {item.absent} classes
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-body-sm">
                          <span className="text-on-surface-variant">Cancelled / Off:</span>
                          <span className="font-label-data-md text-label-data-md text-outline">
                            {item.cancelled} classes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Links */}
                  <div className="pt-space-md mt-space-sm border-t border-white/5 flex items-center justify-between">
                    <Link
                      to={`/subjects/${item.subject.id}`}
                      className="font-title-sm text-title-sm text-primary hover:text-on-surface flex items-center gap-1 transition-colors"
                    >
                      <span>View Analytics & History</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>

                    <div className="flex items-center gap-space-xs">
                      <button
                        onClick={() => handleDelete(item.subject.id)}
                        className="px-space-sm py-1 rounded-full text-error/70 hover:text-error hover:bg-error-container/20 font-label-caps text-[10px] transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                      <Link
                        to="/what-if"
                        className="px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-caps text-[10px] transition-colors"
                      >
                        Simulate Skips
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </section>

      {/* Add / Edit Subject Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingSubject ? 'Edit Subject Details' : 'Add New Subject'}
        subtitle="Configure syllabus name, code, faculty, and custom target cutoff"
      >
        <form onSubmit={handleSaveSubject} className="flex flex-col gap-space-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Computer Networks"
                className="w-full px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 border border-white/10 text-on-surface placeholder:text-outline font-body-md focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. CS-502"
                className="w-full px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 border border-white/10 text-on-surface placeholder:text-outline font-body-md focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">
                Custom Target % (Optional)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={customTarget}
                onChange={e => setCustomTarget(e.target.value)}
                placeholder={`Default (${globalTarget}%)`}
                className="w-full px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 border border-white/10 text-on-surface placeholder:text-outline font-body-md focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">
                Credits
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={credits}
                onChange={e => setCredits(e.target.value)}
                placeholder="3.0"
                className="w-full px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 border border-white/10 text-on-surface placeholder:text-outline font-body-md focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">
                Room / Hall
              </label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. Hall B"
                className="w-full px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 border border-white/10 text-on-surface placeholder:text-outline font-body-md focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">
              Faculty Instructor
            </label>
            <input
              type="text"
              value={faculty}
              onChange={e => setFaculty(e.target.value)}
              placeholder="e.g. Prof. Marcus Vance"
              className="w-full px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 border border-white/10 text-on-surface placeholder:text-outline font-body-md focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-space-md border-t border-white/5 flex items-center justify-end gap-space-sm">
            <GlassButton variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" type="submit">
              {editingSubject ? 'Save Changes' : 'Create Subject'}
            </GlassButton>
          </div>
        </form>
      </Modal>

    </div>
  );
};
