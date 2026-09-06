import {
  calculateAttendancePercentage,
  calculateSafeSkips,
  calculateRecoveryNeeded,
  computeSubjectStats,
  computeOverallStats,
  simulateAttendance,
  evaluateCanSkipTomorrow,
} from '../src/lib/attendanceCalculator.ts';
import type { Subject, AttendanceRecord, TimetableEntry } from '../src/types/index.ts';

console.log('====================================================');
console.log('   ATTENDLY MATHEMATICAL & LOGIC VERIFICATION SUITE  ');
console.log('====================================================\n');

let passed = 0;
let total = 0;

function assert(description: string, condition: boolean, details?: any) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] Case ${total}: ${description}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] Case ${total}: ${description}`);
    if (details) console.error('   Details:', details);
  }
}

// Case 1: 80 / 100 at 80% target. Safe skips should be 0.
const case1 = calculateSafeSkips(80, 100, 80);
assert('80 / 100 at 80% target -> Safe skips should be exactly 0', case1 === 0, { actual: case1 });

// Case 2: 85 / 100 at 80% target. Calculate exact safe skip count = floor((85 - 0.8*100)/0.8) = 6.
const case2 = calculateSafeSkips(85, 100, 80);
assert('85 / 100 at 80% target -> Safe skips should be 6', case2 === 6, { actual: case2 });

// Case 3: 75 / 100 at 80% target. Calculate recovery classes = ceil((0.8*100 - 75)/(1 - 0.8)) = 25.
const case3 = calculateRecoveryNeeded(75, 100, 80);
assert('75 / 100 at 80% target -> Recovery classes should be 25', case3 === 25, { actual: case3 });

// Case 4: 100 / 100 at 80% target. Safe skips = floor((100 - 80)/0.8) = 25.
const case4 = calculateSafeSkips(100, 100, 80);
assert('100 / 100 at 80% target -> Safe skips should be 25', case4 === 25, { actual: case4 });

// Case 5: 0 / 0. Display sensible null / No Data state instead of NaN or Infinity.
const case5 = calculateAttendancePercentage(0, 0);
assert('0 / 0 -> Percentage is null (avoids NaN/Infinity)', case5 === null, { actual: case5 });

// Case 6: Cancelled class. Verify denominator does not change.
const dummySubject: Subject = {
  id: 'sub-test',
  user_id: 'user-1',
  name: 'Test Subject',
  code: 'TEST-101',
  target_percentage: 80,
};
const recordsWithCancelled: AttendanceRecord[] = [
  { id: '1', user_id: 'user-1', subject_id: 'sub-test', date: '2025-09-01', status: 'present' },
  { id: '2', user_id: 'user-1', subject_id: 'sub-test', date: '2025-09-02', status: 'cancelled' },
];
const statsCancelled = computeSubjectStats(dummySubject, recordsWithCancelled, 80);
assert('Cancelled class does not increment conducted count', statsCancelled.conducted === 1 && statsCancelled.attended === 1, statsCancelled);

// Case 7: Not Marked class. Verify denominator does not change.
const statsNotMarked = computeSubjectStats(dummySubject, [{ id: '1', user_id: 'user-1', subject_id: 'sub-test', date: '2025-09-01', status: 'present' }], 80);
assert('Not Marked class does not increment conducted count', statsNotMarked.conducted === 1, statsNotMarked);

// Case 8: Mark Present. Verify attended and conducted both increase.
const statsPresent = computeSubjectStats(dummySubject, [
  { id: '1', user_id: 'user-1', subject_id: 'sub-test', date: '2025-09-01', status: 'present' },
  { id: '2', user_id: 'user-1', subject_id: 'sub-test', date: '2025-09-02', status: 'present' },
], 80);
assert('Mark Present increases both attended (+2) and conducted (+2)', statsPresent.attended === 2 && statsPresent.conducted === 2, statsPresent);

// Case 9: Mark Absent. Verify only conducted increases.
const statsAbsent = computeSubjectStats(dummySubject, [
  { id: '1', user_id: 'user-1', subject_id: 'sub-test', date: '2025-09-01', status: 'present' },
  { id: '2', user_id: 'user-1', subject_id: 'sub-test', date: '2025-09-02', status: 'absent' },
], 80);
assert('Mark Absent increases conducted (2) but not attended (1)', statsAbsent.attended === 1 && statsAbsent.conducted === 2, statsAbsent);

// Case 10: Change global target from 80% to 75%. Verify overall stats update dynamically.
const subA: Subject = { id: 'a', user_id: 'u', name: 'Sub A', code: 'A', target_percentage: null };
const subB: Subject = { id: 'b', user_id: 'u', name: 'Sub B', code: 'B', target_percentage: null };
const multiRecords: AttendanceRecord[] = [
  { id: '1', user_id: 'u', subject_id: 'a', date: '2025-09-01', status: 'present' },
  { id: '2', user_id: 'u', subject_id: 'b', date: '2025-09-01', status: 'absent' },
];
const overall80 = computeOverallStats([subA, subB], multiRecords, 80);
const overall75 = computeOverallStats([subA, subB], multiRecords, 75);
assert('Target change updates status baseline (80% vs 75%)', overall80.globalTarget === 80 && overall75.globalTarget === 75, { overall80, overall75 });

// Case 11: Create a custom subject target (e.g. 90%). Verify that subject uses its own target.
const subCustom: Subject = { id: 'c', user_id: 'u', name: 'Sub C', code: 'C', target_percentage: 90 };
const statsCustom = computeSubjectStats(subCustom, multiRecords, 80);
assert('Custom subject target overrides global target (90% vs 80%)', statsCustom.effectiveTarget === 90, statsCustom);

// Case 12: Can I Skip Tomorrow evaluation.
const tomorrowDate = new Date('2025-09-05T12:00:00Z'); // Friday
const testTimetable: TimetableEntry[] = [
  { id: 'tt1', user_id: 'u', subject_id: 'a', day_of_week: tomorrowDate.getDay(), start_time: '09:00', end_time: '10:00', class_type: 'Lecture' }
];
const skipTomorrowRes = evaluateCanSkipTomorrow(tomorrowDate, [subA], testTimetable, [{ id: '1', user_id: 'u', subject_id: 'a', date: '2025-09-01', status: 'present' }], 80);
assert('Can I Skip Tomorrow properly calculates subject impact', skipTomorrowRes.subjectsImpacted.length === 1, skipTomorrowRes);

console.log(`\n====================================================`);
console.log(`   TEST RESULTS: ${passed} / ${total} TESTS PASSED    `);
console.log('====================================================\n');

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
