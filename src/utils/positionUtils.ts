import { TimeUnit } from "@/lib/types";
import { getStartOfWeek } from "./dateUtils";

export const isCurrentTimeUnit = (date: Date, today: Date, timeUnit: TimeUnit) => {
  // Normalize dates to remove time components
  const normalizedToday = new Date(today);
  normalizedToday.setHours(0, 0, 0, 0);
  
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  if (timeUnit === 'Months') {
    // For months, check if month and year match
    return normalizedDate.getMonth() === normalizedToday.getMonth() && 
           normalizedDate.getFullYear() === normalizedToday.getFullYear();
  } else if (timeUnit === 'Weeks') {
    // For weeks, check if today falls within the week
    const weekStart = getStartOfWeek(normalizedDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // Make sure we normalize these dates too
    weekStart.setHours(0, 0, 0, 0);
    weekEnd.setHours(23, 59, 59, 999); // End of day
    
    return normalizedToday >= weekStart && normalizedToday <= weekEnd;
  } else if (timeUnit === 'Quarters') {
    // For quarters, check if quarter and year match
    const dateQuarter = Math.floor(normalizedDate.getMonth() / 3);
    const todayQuarter = Math.floor(normalizedToday.getMonth() / 3);
    
    return dateQuarter === todayQuarter && 
           normalizedDate.getFullYear() === normalizedToday.getFullYear();
  }
  
  return false;
};