export type AttendanceStatus = 'present' | 'absent' | 'cancelled' | 'not_marked';

export type ClassType = 'Lecture' | 'Lab' | 'Tutorial' | 'Activity' | 'Other';

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  target_percentage: number;
  semester?: string;
  department?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  code: string;
  target_percentage: number | null; // NULL means inherits global target
  credits?: number;
  faculty?: string;
  room?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimetableEntry {
  id: string;
  user_id: string;
  subject_id: string;
  day_of_week: number; // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  class_type: ClassType;
  room?: string;
  created_at?: string;
  updated_at?: string;
  subject?: Subject;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  subject_id: string;
  timetable_entry_id?: string | null;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubjectStats {
  subject: Subject;
  effectiveTarget: number;
  attended: number;
  conducted: number;
  absent: number;
  cancelled: number;
  percentage: number | null; // null if conducted === 0
  status: 'Healthy' | 'Near Target' | 'Below Target' | 'No Data';
  safeSkips: number;
  recoveryNeeded: number;
  margin: number | null; // percentage - effectiveTarget
}

export interface OverallStats {
  totalAttended: number;
  totalConducted: number;
  totalAbsent: number;
  totalCancelled: number;
  percentage: number | null;
  globalTarget: number;
  totalSafeSkips: number;
  subjectsAtRiskCount: number;
  status: 'Healthy' | 'Near Target' | 'Below Target' | 'No Data';
}

export interface SimulationResult {
  currentAttended: number;
  currentConducted: number;
  currentPercentage: number | null;
  projectedAttended: number;
  projectedConducted: number;
  projectedPercentage: number | null;
  percentageDelta: number | null;
  target: number;
  isSafe: boolean;
  projectedSafeSkips: number;
  projectedRecoveryNeeded: number;
}

export interface DayClassSchedule {
  entry: TimetableEntry;
  subject: Subject;
  status: AttendanceStatus;
  record?: AttendanceRecord;
}

export interface CanISkipTomorrowSubjectImpact {
  subject: Subject;
  classCountTomorrow: number;
  currentAttended: number;
  currentConducted: number;
  currentPercentage: number | null;
  target: number;
  projectedPercentageIfSkipped: number | null;
  isSafeToSkipAll: boolean;
  safeSkipsAvailable: number;
}

export interface CanISkipTomorrowResult {
  date: string;
  dayName: string;
  totalClassesScheduled: number;
  subjectsImpacted: CanISkipTomorrowSubjectImpact[];
  overallSafe: boolean;
  summaryMessage: string;
}

export interface NotificationItem {
  id: string;
  type: 'reminder' | 'warning' | 'recovery' | 'info';
  title: string;
  message: string;
  timeAgo: string;
  date: string;
  read: boolean;
  subjectId?: string;
  timetableEntryId?: string;
  actionable?: boolean;
}
