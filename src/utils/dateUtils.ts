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

export const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

  // Helper function to get the start date of a week
export const getStartOfWeek = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? 6 : day - 1; // Make Monday the first day of the week
    result.setDate(result.getDate() - diff);
    return result;
  };

  // Helper function to get the end date of a week
 export const getEndOfWeek = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? 0 : 7 - day; // Make Sunday the last day of the week
    result.setDate(result.getDate() + diff);
    return result;
  };

// Helper functions for quarter calculations
export function getDaysInQuarter(year: number, quarter: number): number {
  // Get days in each month of the quarter
  const month1 = new Date(year, quarter * 3 + 1, 0).getDate(); // Last day of 1st month
  const month2 = new Date(year, quarter * 3 + 2, 0).getDate(); // Last day of 2nd month
  const month3 = new Date(year, quarter * 3 + 3, 0).getDate(); // Last day of 3rd month
  return month1 + month2 + month3;
}

export function getDayOfQuarter(date: Date): number {
  const quarter = Math.floor(date.getMonth() / 3);
  const firstDayOfQuarter = new Date(date.getFullYear(), quarter * 3, 1);
  return Math.round((date.getTime() - firstDayOfQuarter.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}
