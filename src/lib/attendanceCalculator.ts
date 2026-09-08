import type {
  Subject,
  AttendanceRecord,
  SubjectStats,
  OverallStats,
  SimulationResult,
  CanISkipTomorrowResult,
  CanISkipTomorrowSubjectImpact,
  TimetableEntry,
} from '../types/index.ts';

/**
 * Calculates attendance percentage from attended and conducted counts.
 * Returns null if conducted is 0 to avoid NaN/Infinity.
 */
export function calculateAttendancePercentage(attended: number, conducted: number): number | null {
  if (conducted <= 0) return null;
  return (attended / conducted) * 100;
}

/**
 * Calculates maximum number of consecutive future classes that can be safely skipped
 * without falling below target percentage.
 * Formula: floor((100 * A - T * C) / T) where T is target percentage (e.g. 80)
 */
export function calculateSafeSkips(attended: number, conducted: number, targetPercentage: number): number {
  if (conducted <= 0 || targetPercentage <= 0 || targetPercentage >= 100) return 0;
  
  const currentRatio = (attended / conducted) * 100;
  
  // If already below target, no safe skips
  if (currentRatio < targetPercentage) return 0;
  
  // Exact integer-safe arithmetic
  const safeSkips = Math.floor((100 * attended - targetPercentage * conducted) / targetPercentage);
  return Math.max(0, safeSkips);
}

/**
 * Calculates minimum number of consecutive future classes a student must attend
 * to reach or exceed target percentage.
 * Formula: ceil((T * C - 100 * A) / (100 - T)) where T is target percentage (e.g. 80)
 */
export function calculateRecoveryNeeded(attended: number, conducted: number, targetPercentage: number): number {
  if (conducted <= 0 || targetPercentage <= 0) return 0;
  if (targetPercentage >= 100) return 0; // If 100% target and missed any, mathematically impossible
  
  const currentRatio = (attended / conducted) * 100;
  
  // If already at or above target, no recovery needed
  if (currentRatio >= targetPercentage) return 0;
  
  // Exact integer-safe arithmetic
  const needed = Math.ceil((targetPercentage * conducted - 100 * attended) / (100 - targetPercentage));
  return Math.max(0, needed);
}

/**
 * Computes complete statistics for a single subject.
 */
export function computeSubjectStats(
  subject: Subject,
  records: AttendanceRecord[],
  globalTarget: number
): SubjectStats {
  const effectiveTarget = subject.target_percentage !== null && subject.target_percentage !== undefined
    ? Number(subject.target_percentage)
    : globalTarget;

  const subjectRecords = records.filter(r => r.subject_id === subject.id);
  
  let attended = 0;
  let absent = 0;
  let cancelled = 0;

  for (const r of subjectRecords) {
    if (r.status === 'present') {
      attended += 1;
    } else if (r.status === 'absent') {
      absent += 1;
    } else if (r.status === 'cancelled') {
      cancelled += 1;
    }
  }

  const conducted = attended + absent;
  const percentage = calculateAttendancePercentage(attended, conducted);
  
  let status: SubjectStats['status'] = 'No Data';
  let margin: number | null = null;

  if (percentage !== null) {
    margin = percentage - effectiveTarget;
    if (percentage >= effectiveTarget) {
      status = 'Healthy';
    } else if (percentage >= effectiveTarget - 5) {
      status = 'Near Target';
    } else {
      status = 'Below Target';
    }
  }

  const safeSkips = calculateSafeSkips(attended, conducted, effectiveTarget);
  const recoveryNeeded = calculateRecoveryNeeded(attended, conducted, effectiveTarget);

  return {
    subject,
    effectiveTarget,
    attended,
    conducted,
    absent,
    cancelled,
    percentage,
    status,
    safeSkips,
    recoveryNeeded,
    margin,
  };
}

/**
 * Computes overall aggregate attendance statistics across all subjects.
 * Strictly uses total attended / total conducted (never averages subject percentages).
 */
export function computeOverallStats(
  subjects: Subject[],
  records: AttendanceRecord[],
  globalTarget: number
): OverallStats {
  let totalAttended = 0;
  let totalAbsent = 0;
  let totalCancelled = 0;
  let subjectsAtRiskCount = 0;

  for (const subject of subjects) {
    const stats = computeSubjectStats(subject, records, globalTarget);
    totalAttended += stats.attended;
    totalAbsent += stats.absent;
    totalCancelled += stats.cancelled;
    if (stats.percentage !== null && stats.percentage < stats.effectiveTarget) {
      subjectsAtRiskCount += 1;
    }
  }

  const totalConducted = totalAttended + totalAbsent;
  const percentage = calculateAttendancePercentage(totalAttended, totalConducted);
  const totalSafeSkips = calculateSafeSkips(totalAttended, totalConducted, globalTarget);

  let status: OverallStats['status'] = 'No Data';
  if (percentage !== null) {
    if (percentage >= globalTarget) {
      status = 'Healthy';
    } else if (percentage >= globalTarget - 5) {
      status = 'Near Target';
    } else {
      status = 'Below Target';
    }
  }

  return {
    totalAttended,
    totalConducted,
    totalAbsent,
    totalCancelled,
    percentage,
    globalTarget,
    totalSafeSkips,
    subjectsAtRiskCount,
    status,
  };
}

/**
 * Simulates future attendance scenarios (What-If engine).
 */
export function simulateAttendance(
  currentAttended: number,
  currentConducted: number,
  targetPercentage: number,
  futureAttended: number,
  futureSkipped: number
): SimulationResult {
  const currentPercentage = calculateAttendancePercentage(currentAttended, currentConducted);
  
  const projectedAttended = currentAttended + futureAttended;
  const projectedConducted = currentConducted + futureAttended + futureSkipped;
  const projectedPercentage = calculateAttendancePercentage(projectedAttended, projectedConducted);

  const percentageDelta = projectedPercentage !== null && currentPercentage !== null
    ? projectedPercentage - currentPercentage
    : null;

  const isSafe = projectedPercentage !== null ? projectedPercentage >= targetPercentage : true;

  const projectedSafeSkips = calculateSafeSkips(projectedAttended, projectedConducted, targetPercentage);
  const projectedRecoveryNeeded = calculateRecoveryNeeded(projectedAttended, projectedConducted, targetPercentage);

  return {
    currentAttended,
    currentConducted,
    currentPercentage,
    projectedAttended,
    projectedConducted,
    projectedPercentage,
    percentageDelta,
    target: targetPercentage,
    isSafe,
    projectedSafeSkips,
    projectedRecoveryNeeded,
  };
}

/**
 * Evaluates "Can I Skip Tomorrow?" based on tomorrow's scheduled timetable classes.
 */
export function evaluateCanSkipTomorrow(
  tomorrowDate: Date,
  subjects: Subject[],
  timetable: TimetableEntry[],
  records: AttendanceRecord[],
  globalTarget: number
): CanISkipTomorrowResult {
  const jsDay = tomorrowDate.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[jsDay];
  
  const dateString = tomorrowDate.toISOString().split('T')[0];

  if (jsDay === 0) {
    return {
      date: dateString,
      dayName,
      totalClassesScheduled: 0,
      subjectsImpacted: [],
      overallSafe: true,
      summaryMessage: 'Tomorrow is Sunday — no scheduled classes. Enjoy your weekend!',
    };
  }

  const tomorrowClasses = timetable.filter(t => t.day_of_week === jsDay);

  if (tomorrowClasses.length === 0) {
    return {
      date: dateString,
      dayName,
      totalClassesScheduled: 0,
      subjectsImpacted: [],
      overallSafe: true,
      summaryMessage: `No classes scheduled on ${dayName}. You are totally free!`,
    };
  }

  const classesPerSubject: Record<string, number> = {};
  for (const entry of tomorrowClasses) {
    classesPerSubject[entry.subject_id] = (classesPerSubject[entry.subject_id] || 0) + 1;
  }

  const subjectsImpacted: CanISkipTomorrowSubjectImpact[] = [];
  let allSubjectsSafe = true;
  let totalSkipsPossible = 0;

  for (const subjectId of Object.keys(classesPerSubject)) {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) continue;

    const countTomorrow = classesPerSubject[subjectId];
    const stats = computeSubjectStats(subject, records, globalTarget);

    const projectedConductedIfSkipped = stats.conducted + countTomorrow;
    const projectedPercentageIfSkipped = calculateAttendancePercentage(stats.attended, projectedConductedIfSkipped);
    
    const isSafeToSkipAll = projectedPercentageIfSkipped !== null
      ? projectedPercentageIfSkipped >= stats.effectiveTarget
      : true;

    if (!isSafeToSkipAll) {
      allSubjectsSafe = false;
    }

    if (stats.safeSkips >= countTomorrow) {
      totalSkipsPossible += countTomorrow;
    } else {
      totalSkipsPossible += Math.max(0, stats.safeSkips);
    }

    subjectsImpacted.push({
      subject,
      classCountTomorrow: countTomorrow,
      currentAttended: stats.attended,
      currentConducted: stats.conducted,
      currentPercentage: stats.percentage,
      target: stats.effectiveTarget,
      projectedPercentageIfSkipped,
      isSafeToSkipAll,
      safeSkipsAvailable: stats.safeSkips,
    });
  }

  let summaryMessage = '';
  if (allSubjectsSafe) {
    summaryMessage = `Safe to skip all ${tomorrowClasses.length} classes scheduled for tomorrow (${dayName}) while staying above all subject targets.`;
  } else if (totalSkipsPossible > 0) {
    summaryMessage = `You can safely skip up to ${totalSkipsPossible} of ${tomorrowClasses.length} classes tomorrow, but some subjects will drop below target if skipped.`;
  } else {
    summaryMessage = `Not safe to skip tomorrow. Attending all ${tomorrowClasses.length} scheduled classes is necessary to protect your target standing.`;
  }

  return {
    date: dateString,
    dayName,
    totalClassesScheduled: tomorrowClasses.length,
    subjectsImpacted,
    overallSafe: allSubjectsSafe,
    summaryMessage,
  };
}
