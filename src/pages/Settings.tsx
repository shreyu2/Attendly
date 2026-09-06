import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';

export const Settings: React.FC = () => {
  const { profile, signOut, updateProfile, user } = useAuth();
  const { subjects, globalTarget, updateGlobalTarget, updateSubjectTarget } = useAttendance();

  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [localTarget, setLocalTarget] = useState(globalTarget);

  const handleGlobalTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(50, Math.min(100, parseInt(e.target.value) || 80));
    setLocalTarget(val);
  };

  const saveGlobalTarget = async () => {
    setIsSavingTarget(true);
    try {
      await updateGlobalTarget(localTarget);
    } catch (err) {
      console.error('Failed to save target:', err);
    } finally {
      setIsSavingTarget(false);
    }
  };

  const handleSubjectTargetChange = async (subjectId: string, value: string) => {
    const parsed = value.trim() ? Math.max(50, Math.min(100, parseInt(value))) : null;
    try {
      await updateSubjectTarget(subjectId, parsed);
    } catch (err) {
      console.error('Failed to save subject target:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProfileUpdate = async (field: string, value: string) => {
    if (!profile || !user) return;
    try {
      await updateProfile({ [field]: value } as Partial<typeof profile>);
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  return (
    <div className="flex flex-col w-full pb-space-3xl gap-space-2xl">
      
      {/* Header */}
      <section className="relative z-10 w-full">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div>
            <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-container-high text-on-surface-variant text-label-caps font-label-caps uppercase tracking-wider border border-white/5 mb-space-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Configuration
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Settings
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-2xs">
              Manage your profile, attendance targets, and account.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 1: Google Profile Information (Span 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <GlassCard variant="base" className="lg:col-span-7 p-space-lg sm:p-space-xl flex flex-col gap-space-lg">
          <div>
            <div className="flex items-center gap-space-xs mb-space-sm">
              <div className="p-space-2xs rounded-xl bg-primary-container/30 text-primary">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Google Profile
              </h3>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Information synced from your Google account. Changes to name and photo must be made in your Google Account settings.
            </p>
          </div>

          <div className="space-y-space-md">
            <div className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-low/60 border border-white/5">
              {profile?.avatar_url ? (
                <img
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10 shrink-0"
                  src={profile.avatar_url}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-container/30 border border-primary/40 text-primary flex items-center justify-center font-bold text-2xl ring-2 ring-white/10 shrink-0">
                  {((profile?.name || user?.email || 'U')[0]).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-space-sm">
                  <span className="font-title-md text-title-md text-on-surface font-semibold truncate">
                    {profile?.name || user?.user_metadata?.full_name || 'Student'}
                  </span>
                </div>
                <div className="font-body-sm text-body-sm text-outline mt-1 flex flex-wrap gap-space-sm">
                  <span>{profile?.email || user?.email || 'No email'}</span>
                  {user && <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-label-caps text-xs">Google Account</span>}
                </div>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-low/60 border border-white/5">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold block mb-space-sm">
                Academic Info
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div>
                  <label className="font-label-caps text-label-caps text-outline block mb-1">Semester</label>
                  <input
                    type="text"
                    value={profile?.semester || ''}
                    onChange={e => handleProfileUpdate('semester', e.target.value)}
                    className="w-full px-space-sm py-space-xs rounded-lg bg-surface-container-highest border border-white/10 text-on-surface focus:outline-none focus:border-primary font-body-md"
                    placeholder="e.g., Semester 5"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-label-caps text-outline block mb-1">Department</label>
                  <input
                    type="text"
                    value={profile?.department || ''}
                    onChange={e => handleProfileUpdate('department', e.target.value)}
                    className="w-full px-space-sm py-space-xs rounded-lg bg-surface-container-highest border border-white/10 text-on-surface focus:outline-none focus:border-primary font-body-md"
                    placeholder="e.g., Computer Science & Engineering"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <div className="pt-space-md border-t border-white/5">
            <GlassButton variant="danger" icon="logout" onClick={handleSignOut}>
              Sign Out
            </GlassButton>
          </div>
        </GlassCard>

        {/* SECTION 2: Attendance Targets (Span 5) */}
        <GlassCard variant="base" className="lg:col-span-5 p-space-lg sm:p-space-xl flex flex-col justify-between gap-space-lg">
          <div>
            <div className="flex items-center gap-space-xs mb-space-sm">
              <div className="p-space-2xs rounded-xl bg-tertiary-container/30 text-tertiary">
                <span className="material-symbols-outlined text-[20px]">flag</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Attendance Targets
              </h3>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Configure the minimum attendance percentage required. Subject-level overrides take priority over the global setting.
            </p>

            {/* Global Target */}
            <div className="my-space-lg p-space-md rounded-2xl bg-surface-container-lowest/60 border border-white/5 space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-title-md text-title-md text-on-surface font-semibold">Global Minimum Target</span>
                <span className="font-label-data-lg text-label-data-lg text-tertiary font-bold">{localTarget}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="1"
                value={localTarget}
                onChange={handleGlobalTargetChange}
                className="w-full accent-tertiary"
              />
              <div className="flex justify-between font-label-caps text-label-caps text-outline">
                <span>50% Minimum</span>
                <span>100% Strict</span>
              </div>
              <GlassButton
                variant="primary"
                size="sm"
                icon="save"
                onClick={saveGlobalTarget}
                disabled={isSavingTarget || localTarget === globalTarget}
                className="mt-space-xs w-full"
              >
                {isSavingTarget ? 'Saving...' : 'Save Target'}
              </GlassButton>
            </div>

            {/* Visual Policy Range Bar */}
            <div className="p-space-md rounded-2xl bg-surface-container-lowest/40 border border-white/5">
              <span className="font-label-caps text-label-caps uppercase text-tertiary block mb-space-xs font-bold">
                Target Policy Visualization
              </span>
              <div className="w-full h-2 rounded-full overflow-hidden flex">
                <div className="bg-error h-full" style={{ width: `${Math.max(0, localTarget - 5)}%` }} />
                <div className="bg-amber-400 h-full" style={{ width: '5%' }} />
                <div className="bg-tertiary h-full" style={{ width: `${Math.max(0, 100 - localTarget)}%` }} />
              </div>
              <div className="flex justify-between font-label-caps text-label-caps text-outline mt-1">
                <span>0% (Debarred)</span>
                <span className="text-amber-400">{localTarget}% Minimum Cutoff</span>
                <span className="text-tertiary">100% Exemplary</span>
              </div>
            </div>

            {/* Subject Target Overrides Matrix */}
            <div className="space-y-space-xs">
              <span className="font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase font-bold block">
                Subject-Specific Target Overrides
              </span>
              <div className="flex flex-col gap-space-2xs">
                {subjects.map(sub => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low/50 border border-white/5 hover:bg-surface-container-high/40 transition-colors"
                  >
                    <div className="flex items-center gap-space-sm min-w-0">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <div className="min-w-0">
                        <span className="font-title-sm text-title-sm text-on-surface font-semibold block truncate">
                          {sub.name}
                        </span>
                        <span className="font-body-sm text-body-sm text-outline">
                          {sub.code} • {sub.faculty || 'Faculty'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-space-xs shrink-0">
                      <input
                        type="number"
                        min="50"
                        max="100"
                        step="1"
                        placeholder={`Default (${globalTarget}%)`}
                        value={sub.target_percentage !== null ? String(sub.target_percentage) : ''}
                        onChange={e => handleSubjectTargetChange(sub.id, e.target.value)}
                        className="w-24 px-space-xs py-1 text-center font-label-data-md text-label-data-md rounded-lg bg-surface-container-highest border border-white/10 text-on-surface focus:outline-none focus:border-primary"
                      />
                      <span className="font-label-data-md text-label-data-md text-outline">%</span>
                    </div>
                  </div>
                ))}
              </div>
              {subjects.length === 0 && (
                <p className="font-body-sm text-body-sm text-outline text-center py-space-lg">
                  No subjects yet. Add your first subject from the Subjects page.
                </p>
              )}
            </div>
          </div>

          <div className="p-space-md rounded-2xl bg-surface-container-lowest/40 border border-white/5 text-on-surface-variant text-body-sm">
            <span className="font-label-caps text-label-caps uppercase text-tertiary block mb-1 font-bold">
              Data Isolation
            </span>
            All database operations are scoped to your user authentication key. No cross-tenant access is permitted.
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
