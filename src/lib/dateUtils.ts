/**
 * Formats a Date object or YYYY-MM-DD string into user-friendly localized strings.
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
}

export function formatFullHeaderDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getDayOfWeekNumber(date: Date = new Date()): number {
  // Returns 1 for Monday, ..., 6 for Saturday, 0 for Sunday
  return date.getDay();
}

export function getDayName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Unknown';
}

export function getDaysInMonth(year: number, monthIndex: number): Date[] {
  const dates: Date[] = [];
  const date = new Date(year, monthIndex, 1);
  while (date.getMonth() === monthIndex) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

export function formatTime24to12(time24: string): string {
  if (!time24) return '';
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${minutes} ${ampm}`;
}
