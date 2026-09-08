import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  Subject,
  TimetableEntry,
  AttendanceRecord,
  SubjectStats,
  OverallStats,
  DayClassSchedule,
  CanISkipTomorrowResult,
  NotificationItem,
} from '../types';
import {
  computeSubjectStats,
  computeOverallStats,
  evaluateCanSkipTomorrow,
} from '../lib/attendanceCalculator';
import { useAuth } from './AuthContext';
import { getDayOfWeekNumber, getTodayDateString, getTomorrowDate } from '../lib/dateUtils';

interface AttendanceContextType {
  subjects: Subject[];
  timetable: TimetableEntry[];
  records: AttendanceRecord[];
  notifications: NotificationItem[];
  globalTarget: number;
  overallStats: OverallStats;
  subjectStatsList: SubjectStats[];
  todaySchedule: DayClassSchedule[];
  canSkipTomorrowResult: CanISkipTomorrowResult;
  isLoadingData: boolean;
  markAttendance: (subjectId: string, timetableEntryId: string | undefined, date: string, status: 'present' | 'absent' | 'cancelled' | 'not_marked') => Promise<void>;
  markAllTodayPresent: (dateStr?: string) => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSubject: (id: string, updated: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTimetableEntry: (id: string, updated: Partial<TimetableEntry>) => Promise<void>;
  deleteTimetableEntry: (id: string) => Promise<void>;
  importTimetable: (entries: Omit<TimetableEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
  updateGlobalTarget: (newTarget: number) => Promise<void>;
  updateSubjectTarget: (subjectId: string, newTarget: number | null) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  getDaySchedule: (dateString: string) => DayClassSchedule[];
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const generateNotifications = (
  subjectStatsList: SubjectStats[],
  todaySchedule: DayClassSchedule[] = []
): NotificationItem[] => {
  const notifications: NotificationItem[] = [];
  const today = getTodayDateString();

  // Unmarked classes today
  for (const item of todaySchedule) {
    if (item.status === 'not_marked') {
      notifications.push({
        id: `notif-unmarked-${item.entry.id}`,
        type: 'reminder',
        title: 'Unmarked Class Session',
        message: `${item.subject.name} (${item.entry.start_time} - ${item.entry.end_time}) has not been logged yet today.`,
        timeAgo: 'Today',
        date: today,
        read: false,
        subjectId: item.subject.id,
        timetableEntryId: item.entry.id,
        actionable: true,
      });
    }
  }

  for (const stats of subjectStatsList) {
    if (stats.percentage === null) continue;

    // Below target warning
    if (stats.percentage < stats.effectiveTarget) {
      const deficit = stats.effectiveTarget - stats.percentage;
      notifications.push({
        id: `notif-warning-${stats.subject.id}`,
        type: 'warning',
        title: 'Below Target',
        message: `${stats.subject.name} is ${deficit.toFixed(1)}% below target (${stats.percentage.toFixed(1)}% / ${stats.effectiveTarget}%). Need ${stats.recoveryNeeded} consecutive classes to recover.`,
        timeAgo: 'Realtime',
        date: today,
        read: false,
        subjectId: stats.subject.id,
        actionable: false,
      });
    }

    // Near target (within 5%)
    else if (stats.percentage < stats.effectiveTarget + 5 && stats.percentage >= stats.effectiveTarget) {
      const buffer = stats.effectiveTarget + 5 - stats.percentage;
      notifications.push({
        id: `notif-reminder-${stats.subject.id}`,
        type: 'reminder',
        title: 'Near Target Caution',
        message: `${stats.subject.name} at ${stats.percentage.toFixed(1)}%. Only ${buffer.toFixed(1)}% buffer before caution zone. ${stats.safeSkips} safe skip(s) available.`,
        timeAgo: 'Realtime',
        date: today,
        read: false,
        subjectId: stats.subject.id,
        actionable: false,
      });
    }

    // Healthy with safe skips
    if (stats.percentage !== null && stats.percentage >= stats.effectiveTarget && stats.safeSkips > 0) {
      notifications.push({
        id: `notif-info-${stats.subject.id}`,
        type: 'info',
        title: 'Safe Skips Available',
        message: `${stats.subject.name}: ${stats.safeSkips} class(es) can be missed while staying above ${stats.effectiveTarget}%.`,
        timeAgo: 'Realtime',
        date: today,
        read: false,
        subjectId: stats.subject.id,
        actionable: false,
      });
    }
  }

  return notifications;
};

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [globalTarget, setGlobalTarget] = useState<number>(80.0);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Load user data from Supabase
  const loadUserData = useCallback(async () => {
    if (!user) {
      setSubjects([]);
      setTimetable([]);
      setRecords([]);
      setNotifications([]);
      setGlobalTarget(80.0);
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    try {
      // Load profile (for global target)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('target_percentage')
        .eq('id', user.id)
        .single();
      
      if (profileData?.target_percentage) {
        setGlobalTarget(Number(profileData.target_percentage));
      }

      // Load subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

      // Load timetable
      const { data: timetableData, error: timetableError } = await supabase
        .from('timetable_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (timetableError) throw timetableError;
      setTimetable(timetableData || []);

      // Load attendance records
      const { data: recordsData, error: recordsError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (recordsError) throw recordsError;
      setRecords(recordsData || []);

    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [user]);

  // Load data when user changes
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Recompute notifications when stats change
  const subjectStatsList = useMemo(() => {
    return subjects.map(s => computeSubjectStats(s, records, globalTarget));
  }, [subjects, records, globalTarget]);

  const overallStats = useMemo(() => {
    return computeOverallStats(subjects, records, globalTarget);
  }, [subjects, records, globalTarget]);

  const getDaySchedule = useCallback((dateString: string): DayClassSchedule[] => {
    const [year, month, day] = dateString.split('-').map(Number);
    const dayOfWeek = getDayOfWeekNumber(new Date(year, month - 1, day));
    const dayEntries = timetable.filter(t => t.day_of_week === dayOfWeek);

    return dayEntries.map(entry => {
      const subject = subjects.find(s => s.id === entry.subject_id);
      const record = records.find(
        r => r.subject_id === entry.subject_id && r.date === dateString && r.timetable_entry_id === entry.id
      );

      return {
        entry,
        subject: subject || {
          id: entry.subject_id,
          user_id: user?.id || '',
          name: 'Unknown Subject',
          code: 'UNK-000',
          target_percentage: null,
        },
        status: record ? record.status : 'not_marked',
        record,
      };
    });
  }, [timetable, subjects, records, user]);

  const todaySchedule = useMemo(() => {
    return getDaySchedule(getTodayDateString());
  }, [getDaySchedule]);

  const canSkipTomorrowResult = useMemo(() => {
    return evaluateCanSkipTomorrow(getTomorrowDate(), subjects, timetable, records, globalTarget);
  }, [subjects, timetable, records, globalTarget]);

  // Update notifications when subjectStatsList or todaySchedule changes
  useEffect(() => {
    const newNotifications = generateNotifications(subjectStatsList, todaySchedule);
    setNotifications(newNotifications);
  }, [subjectStatsList, todaySchedule]);

  // Attendance marking with Supabase upsert
  const markAttendance = async (
    subjectId: string,
    timetableEntryId: string | undefined,
    date: string,
    status: 'present' | 'absent' | 'cancelled' | 'not_marked'
  ) => {
    if (!user) return;

    if (status === 'not_marked') {
      // Delete the record
      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('user_id', user.id)
        .eq('subject_id', subjectId)
        .eq('timetable_entry_id', timetableEntryId || '')
        .eq('date', date);

      if (error) {
        console.error('Delete attendance error:', error);
        return;
      }

      setRecords(prev => prev.filter(r => 
        !(r.subject_id === subjectId && r.timetable_entry_id === timetableEntryId && r.date === date)
      ));
    } else {
      // Upsert attendance record
      const { data, error } = await supabase
        .from('attendance_records')
        .upsert({
          user_id: user.id,
          subject_id: subjectId,
          timetable_entry_id: timetableEntryId || null,
          date,
          status,
        }, {
          onConflict: 'user_id,subject_id,timetable_entry_id,date'
        })
        .select()
        .single();

      if (error) {
        console.error('Upsert attendance error:', error);
        return;
      }

      setRecords(prev => {
        const existingIdx = prev.findIndex(r => 
          r.subject_id === subjectId && r.timetable_entry_id === timetableEntryId && r.date === date
        );
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = data;
          return updated;
        }
        return [data, ...prev];
      });
    }
  };

  const markAllTodayPresent = async (dateStr?: string) => {
    if (!user) return;
    
    const targetDate = dateStr || getTodayDateString();
    const targetClasses = getDaySchedule(targetDate).filter(s => s.status === 'not_marked');

    for (const cls of targetClasses) {
      await markAttendance(cls.subject.id, cls.entry.id, targetDate, 'present');
    }
  };

  // Subject CRUD
  const addSubject = async (subjectData: Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      const err = new Error('You must be signed in to add a subject. Please log in first.');
      console.error('[AttendanceContext] Add subject error: User session not found');
      throw err;
    }

    const payload = {
      name: subjectData.name.trim(),
      code: subjectData.code.trim().toUpperCase(),
      target_percentage: subjectData.target_percentage ?? null,
      credits: Number(subjectData.credits) || 3.0,
      faculty: subjectData.faculty?.trim() || null,
      room: subjectData.room?.trim() || null,
      color: subjectData.color || 'primary',
      user_id: user.id,
    };

    console.log('[AttendanceContext] Inserting subject for user:', user.id, payload);

    const { data, error } = await supabase
      .from('subjects')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('[AttendanceContext] Add subject Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      if (error.code === 'PGRST205') {
        throw new Error(
          "The 'subjects' table was not found in your Supabase database (PGRST205). Please run the updated 'supabase/schema.sql' in your Supabase SQL Editor."
        );
      }
      if (error.code === '42501') {
        throw new Error(
          'Permission denied by Row-Level Security (RLS). Please verify your user authentication and RLS policies.'
        );
      }
      throw new Error(error.message || 'Failed to save subject to Supabase database.');
    }

    if (!data) {
      throw new Error('Supabase insert succeeded but returned empty data.');
    }

    console.log('[AttendanceContext] Subject inserted successfully:', data);

    setSubjects(prev => {
      const exists = prev.some(s => s.id === data.id);
      return exists ? prev : [...prev, data];
    });

    return data;
  };

  const updateSubject = async (id: string, updated: Partial<Subject>) => {
    if (!user) {
      throw new Error('You must be signed in to update a subject.');
    }

    const sanitized: Partial<Subject> = { ...updated };
    if (sanitized.name) sanitized.name = sanitized.name.trim();
    if (sanitized.code) sanitized.code = sanitized.code.trim().toUpperCase();
    if (sanitized.faculty !== undefined) sanitized.faculty = sanitized.faculty?.trim() || undefined;
    if (sanitized.room !== undefined) sanitized.room = sanitized.room?.trim() || undefined;

    const { error } = await supabase
      .from('subjects')
      .update(sanitized)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[AttendanceContext] Update subject error:', error);
      throw new Error(error.message || 'Failed to update subject in Supabase.');
    }

    setSubjects(prev => prev.map(s => (s.id === id ? { ...s, ...sanitized } : s)));
  };

  const deleteSubject = async (id: string) => {
    if (!user) {
      throw new Error('You must be signed in to delete a subject.');
    }

    // Delete related attendance records first (cascade handled by DB but let's be explicit)
    await supabase.from('attendance_records').delete().eq('subject_id', id).eq('user_id', user.id);
    await supabase.from('timetable_entries').delete().eq('subject_id', id).eq('user_id', user.id);

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[AttendanceContext] Delete subject error:', error);
      throw new Error(error.message || 'Failed to delete subject from Supabase.');
    }

    setSubjects(prev => prev.filter(s => s.id !== id));
    setTimetable(prev => prev.filter(t => t.subject_id !== id));
    setRecords(prev => prev.filter(r => r.subject_id !== id));
  };

  // Timetable CRUD
  const addTimetableEntry = async (entryData: Omit<TimetableEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('timetable_entries')
      .insert({ ...entryData, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Add timetable entry error:', error);
      throw error;
    }

    setTimetable(prev => [...prev, data]);
  };

  const updateTimetableEntry = async (id: string, updated: Partial<TimetableEntry>) => {
    if (!user) return;

    const { error } = await supabase
      .from('timetable_entries')
      .update(updated)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Update timetable entry error:', error);
      throw error;
    }

    setTimetable(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTimetableEntry = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('timetable_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete timetable entry error:', error);
      throw error;
    }

    setTimetable(prev => prev.filter(t => t.id !== id));
  };

  const importTimetable = async (entries: Omit<TimetableEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    if (!user) return;

    const entriesWithUser = entries.map(e => ({ ...e, user_id: user.id }));

    const { data, error } = await supabase
      .from('timetable_entries')
      .insert(entriesWithUser)
      .select();

    if (error) {
      console.error('Import timetable error:', error);
      throw error;
    }

    setTimetable(prev => [...prev, ...(data || [])]);
  };

  // Target updates
  const updateGlobalTarget = async (newTarget: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ target_percentage: newTarget })
      .eq('id', user.id);

    if (error) {
      console.error('Update global target error:', error);
      throw error;
    }

    setGlobalTarget(newTarget);
  };

  const updateSubjectTarget = async (subjectId: string, newTarget: number | null) => {
    if (!user) return;

    const { error } = await supabase
      .from('subjects')
      .update({ target_percentage: newTarget })
      .eq('id', subjectId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Update subject target error:', error);
      throw error;
    }

    setSubjects(prev => prev.map(s => (s.id === subjectId ? { ...s, target_percentage: newTarget } : s)));
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AttendanceContext.Provider
      value={{
        subjects,
        timetable,
        records,
        notifications,
        globalTarget,
        overallStats,
        subjectStatsList,
        todaySchedule,
        canSkipTomorrowResult,
        isLoadingData,
        markAttendance,
        markAllTodayPresent,
        addSubject,
        updateSubject,
        deleteSubject,
        addTimetableEntry,
        updateTimetableEntry,
        deleteTimetableEntry,
        importTimetable,
        updateGlobalTarget,
        updateSubjectTarget,
        markNotificationRead,
        markAllNotificationsRead,
        getDaySchedule,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
