// utils/dateUtils.ts
export const dateFormatOptions = {
  day: { day: '2-digit' } as Intl.DateTimeFormatOptions,
  week: { week: 'numeric', year: 'numeric' } as Intl.DateTimeFormatOptions,
  month: { month: 'short' } as Intl.DateTimeFormatOptions,
  quarter: { month: 'short' } as Intl.DateTimeFormatOptions,
};

export const addToDate = (date: Date, amount: number, unit: 'day' | 'week' | 'month' | 'quarter'): Date => {
  const newDate = new Date(date);
  
  switch (unit) {
    case 'day':
      newDate.setDate(newDate.getDate() + amount);
      break;
    case 'week':
      newDate.setDate(newDate.getDate() + amount * 7);
      break;
    case 'month':
      newDate.setMonth(newDate.getMonth() + amount);
      break;
    case 'quarter':
      newDate.setMonth(newDate.getMonth() + amount * 3);
      break;
  }
  
  return newDate;
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const formatTimeColumn = (date: Date, unit: 'day' | 'week' | 'month' | 'quarter'): string => {
  switch (unit) {
    case 'day':
      return date.toLocaleDateString(undefined, { day: '2-digit' });
    case 'week':
      return `W${getWeekNumber(date)}`;
    case 'month':
      return date.toLocaleDateString(undefined, { month: 'short' });
    case 'quarter':
      return `Q${Math.floor(date.getMonth() / 3) + 1}`;
  }
};

export const getColumnsBetweenDates = (
  startDate: Date, 
  endDate: Date, 
  unit: 'day' | 'week' | 'month' | 'quarter'
): Date[] => {
  const columns: Date[] = [];
  let current = new Date(startDate);
  
  while (current <= endDate) {
    columns.push(new Date(current));
    current = addToDate(current, 1, unit);
  }
  
  return columns;
};

export const getRandomColor = (): string => {
  const colors = [
    '#4f46e5', // indigo
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

const getDayOfQuarter = (date = new Date()) => {
  // Get current quarter (0-3)
  const quarter = Math.floor(date.getMonth() / 3);
  
  // First day of the current quarter
  const firstDayOfQuarter = new Date(date.getFullYear(), quarter * 3, 1);
  
  // Calculate difference in days
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const dayDifference = Math.floor(
    (date.getTime() - firstDayOfQuarter.getTime()) / millisecondsPerDay
  );
  
  // Return the day of quarter (1-based)
  return dayDifference + 1;
};

const getDaysInQuarter = (date = new Date()) => {
  const quarter = Math.floor(date.getMonth() / 3);
  
  // First day of the current quarter
  const firstDayOfQuarter = new Date(date.getFullYear(), quarter * 3, 1);
  
  // First day of the next quarter
  const firstDayOfNextQuarter = new Date(date.getFullYear(), (quarter + 1) * 3, 1);
  
  // Calculate difference in days
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const dayDifference = Math.floor(
    (firstDayOfNextQuarter.getTime() - firstDayOfQuarter.getTime()) / millisecondsPerDay
  );
  
  return dayDifference;
};

export const getQuarterProgress = (date = new Date()) => {
  const day = getDayOfQuarter(date);
  const totalDays = getDaysInQuarter(date);
  
  return (day / totalDays);
};