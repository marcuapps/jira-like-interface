// ScrollableTimelineView.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Sprint, Epic } from '@/lib/types';
import { getQuarterProgress } from '@/utils/dateUtils';
import DayTilesRow from './DayTilesRow';
import { ChevronDown, Maximize2, Info, FileQuestion } from 'lucide-react';
import EpicNameTextInput from './EpicNameTextInput';

type TimeUnit = 'Weeks' | 'Months' | 'Quarters';

interface ScrollableTimelineViewProps {
  sprints: Sprint[];
  onCreateEpic?: (sprintId: string) => void;
  onUpdateEpic?: (epicId: string, updates: Partial<Epic>) => void;
  onDeleteEpic?: (epicId: string) => void;
  onCreateNewEpic?: (sprintId: string, name: string) => void;
}

const ScrollableTimeline: React.FC<ScrollableTimelineViewProps> = ({
  sprints,
  onCreateEpic,
  onUpdateEpic,
  onDeleteEpic,
  onCreateNewEpic,
}) => {
  // Get today's date
  const today = new Date();
  
  // Default visible range: 1 year back, 2 years forward
  const defaultStartDate = new Date(today);
  defaultStartDate.setFullYear(today.getFullYear() - 1);
  
  const defaultEndDate = new Date(today);
  defaultEndDate.setFullYear(today.getFullYear() + 2);
  
  const [inputValue, setInputValue] = useState('');
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('Months');
  const [visibleStartDate, setVisibleStartDate] = useState<Date>(new Date(defaultStartDate));
  const [visibleEndDate, setVisibleEndDate] = useState<Date>(new Date(defaultEndDate));
  const [timeColumns, setTimeColumns] = useState<Date[]>([]);
  const [draggingEpic, setDraggingEpic] = useState<string | null>(null);
  const [resizingEpic, setResizingEpic] = useState<{ id: string; edge: 'left' | 'right' } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; date: Date } | null>(null);
  const [currentHoverSprint, setCurrentHoverSprint] = useState<string | null>(null);
  const [draggedItemOriginalDates, setDraggedItemOriginalDates] = useState<{
    id: string;
    startDate: Date;
    endDate: Date;
  } | null>(null);
  const [textInputIsVisible, setTextInputIsVisible] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const allEpics = sprints.flatMap(sprint => sprint.epics || []);

// 1. Set the date range only once, in a separate useEffect that runs only on component mount
useEffect(() => {
  // Set the fixed date range (1 year back, 2 years forward)
  const fixedStartDate = new Date(today);
  fixedStartDate.setFullYear(today.getFullYear() - 1);
  
  const fixedEndDate = new Date(today);
  fixedEndDate.setFullYear(today.getFullYear() + 2);
  
  // Set the visible date range only once
  setVisibleStartDate(fixedStartDate);
  setVisibleEndDate(fixedEndDate);
}, []); // Empty dependency array means this runs only once on mount

// 2. Then, in a separate useEffect, generate the columns based on the date range and time unit
useEffect(() => {
  if (!visibleStartDate || !visibleEndDate) return;
  
  const columns: Date[] = [];
  
  if (timeUnit === 'Quarters') {
    // Start at the beginning of the quarter
    let current = new Date(visibleStartDate);
    const quarterMonth = Math.floor(current.getMonth() / 3) * 3;
    current = new Date(current.getFullYear(), quarterMonth, 1);
    
    // Generate quarter columns
    while (current <= visibleEndDate) {
      columns.push(new Date(current));
      current.setMonth(current.getMonth() + 3);
    }
  } else {
    // For weeks and months, use existing logic
    let current = new Date(visibleStartDate);
    
    while (current <= visibleEndDate) {
      columns.push(new Date(current));
      
      switch (timeUnit) {
        case 'Weeks':
          current.setDate(current.getDate() + 7);
          break;
        case 'Months':
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }
  }
  
  console.log(columns);
  setTimeColumns(columns);
}, [timeUnit, visibleStartDate, visibleEndDate]);// Depend on timeUnit and the date range

// Fixed width for all time units
const columnWidth = 200; // pixels

const getColumnWidth = () => {
  return columnWidth;
};

  // Get total timeline width
  const getTimelineWidth = () => {
    return timeColumns.length * getColumnWidth();
  };

  useEffect(() => {
    if (timeColumns.length > 0) {
      scrollToToday();
    }
  }, [timeColumns, timeUnit]);

  // Scroll to today
// Improved scrollToToday function that actually works

// 1. Update the scrollToToday function to use the new column-based positioning
const scrollToToday = () => {
  // Wait for the timeline to be rendered and columns to be generated
  setTimeout(() => {
    if (!timelineRef.current || timeColumns.length === 0) return;
    
    // Find position of today based on the current time unit
    let todayPosition = 0;
    
    if (timeUnit === 'Months') {
      // Find which month column today belongs to
      const monthIndex = timeColumns.findIndex(col => 
        col.getMonth() === today.getMonth() && 
        col.getFullYear() === today.getFullYear()
      );
      
      if (monthIndex !== -1) {
        todayPosition = monthIndex * columnWidth;
      }
    } else if (timeUnit === 'Weeks') {
      // For week view, find the week that contains today
      const weekIndex = timeColumns.findIndex(col => {
        // Create date range for the week
        const weekStart = new Date(col);
        const weekEnd = new Date(col);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        return today >= weekStart && today <= weekEnd;
      });
      
      if (weekIndex !== -1) {
        todayPosition = weekIndex * columnWidth;
      }
    } else if (timeUnit === 'Quarters') {
      // For quarter view
      const todayQuarter = Math.floor(today.getMonth() / 3);
      const todayYear = today.getFullYear();
      
      const quarterIndex = timeColumns.findIndex(col => {
        const colQuarter = Math.floor(col.getMonth() / 3);
        const colYear = col.getFullYear();
        
        return colQuarter === todayQuarter && colYear === todayYear;
      });
      
      if (quarterIndex !== -1) {
        todayPosition = quarterIndex * columnWidth;
      }
    }
    
    // Scroll to center today's position
    const container = timelineRef.current;
    const containerWidth = container.clientWidth;
    container.scrollLeft = todayPosition - (containerWidth / 2);
    
    console.log("Scrolling to today at position:", todayPosition);
  }, 100); // Small delay to ensure rendering is complete
};


// 1. Improve the pixelToDate function to provide day-level precision
const pixelToDate = (pixel: number): Date => {
  if (!containerRef.current || timeColumns.length === 0) return new Date();
  
  const containerWidth = containerRef.current.clientWidth;
  const totalTimeRange = visibleEndDate.getTime() - visibleStartDate.getTime();
  const scrollOffset = timelineRef.current?.scrollLeft || 0;
  
  // Adjust pixel position for scroll
  const adjustedPixel = pixel + scrollOffset;
  
  // Calculate exact position as percentage of visible timeline
  const percentage = adjustedPixel / getTimelineWidth();
  
  // Convert percentage to milliseconds within the date range
  const millisecondOffset = percentage * totalTimeRange;
  
  // Calculate the exact date
  const exactDate = new Date(visibleStartDate.getTime() + millisecondOffset);
  
  return exactDate;
};

// Add a function to consistently calculate pixel position for any date
const getPositionForDate = (date: Date): number => {
  if (!visibleStartDate || !visibleEndDate) return 0;
  
  // Calculate days from the start date to this date
  const daysDiff = Math.round(
    (date.getTime() - visibleStartDate.getTime()) / (24 * 60 * 60 * 1000)
  );
  
  // Calculate total days in the visible range
  const totalDays = Math.round(
    (visibleEndDate.getTime() - visibleStartDate.getTime()) / (24 * 60 * 60 * 1000)
  );
  
  // Timeline width changes with time unit but the day proportions should remain consistent
  return (daysDiff / totalDays) * getTimelineWidth();
};

// First, add a helper function to normalize dates (removes time part)
const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

// Then implement a pixel-perfect positioning system
// Update the calculateItemStyle function with better quarter handling

// Helper functions for quarter calculations
function getDaysInQuarter(year: number, quarter: number): number {
  // Get days in each month of the quarter
  const month1 = new Date(year, quarter * 3 + 1, 0).getDate(); // Last day of 1st month
  const month2 = new Date(year, quarter * 3 + 2, 0).getDate(); // Last day of 2nd month
  const month3 = new Date(year, quarter * 3 + 3, 0).getDate(); // Last day of 3rd month
  return month1 + month2 + month3;
}

function getDayOfQuarter(date: Date): number {
  const quarter = Math.floor(date.getMonth() / 3);
  const firstDayOfQuarter = new Date(date.getFullYear(), quarter * 3, 1);
  return Math.round((date.getTime() - firstDayOfQuarter.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

const calculateItemStyle = (itemStart: Date, itemEnd: Date) => {
  if (!containerRef.current || timeColumns.length === 0) return {};
  
  // Normalize dates to midnight
  const normalizedStart = normalizeDate(itemStart);
  const normalizedEnd = normalizeDate(itemEnd);
  
  // For quarters view - special handling
  if (timeUnit === 'Quarters') {
    // Find which quarter columns the start and end dates belong to
    let startColumnIndex = -1;
    let endColumnIndex = -1;
    
    for (let i = 0; i < timeColumns.length; i++) {
      const quarterStart = new Date(timeColumns[i]); // First day of quarter
      const quarterEnd = new Date(timeColumns[i]);
      quarterEnd.setMonth(quarterEnd.getMonth() + 3);
      quarterEnd.setDate(quarterEnd.getDate() - 1); // Last day of quarter
      
      // Check if item start falls in this quarter
      if (normalizedStart >= quarterStart && normalizedStart <= quarterEnd) {
        startColumnIndex = i;
      }
      
      // Check if item end falls in this quarter
      if (normalizedEnd >= quarterStart && normalizedEnd <= quarterEnd) {
        endColumnIndex = i;
      }
    }
    
    // If no match found, use closest
    if (startColumnIndex === -1) startColumnIndex = 0;
    if (endColumnIndex === -1) endColumnIndex = timeColumns.length - 1;
    
    // Calculate position within quarter
    let startOffset = 0;
    let endOffset = columnWidth;
    
    if (startColumnIndex >= 0) {
      const quarterStart = timeColumns[startColumnIndex];
      const daysInQuarter = getDaysInQuarter(quarterStart.getFullYear(), Math.floor(quarterStart.getMonth() / 3));
      const dayOfQuarter = getDayOfQuarter(normalizedStart);
      startOffset = (dayOfQuarter / daysInQuarter) * columnWidth;
    }
    
    if (endColumnIndex >= 0) {
      const quarterStart = timeColumns[endColumnIndex];
      const daysInQuarter = getDaysInQuarter(quarterStart.getFullYear(), Math.floor(quarterStart.getMonth() / 3));
      const dayOfQuarter = getDayOfQuarter(normalizedEnd);
      endOffset = (dayOfQuarter / daysInQuarter) * columnWidth;
    }
    
    // Calculate final position
    const left = startColumnIndex * columnWidth + startOffset;
    const right = endColumnIndex * columnWidth + endOffset;
    
    return {
      left: `${left}px`,
      width: `${Math.max(right - left, 50)}px`, // Minimum width
    };
  }
  
  // For other time units - column-based positioning
  let startColumnIndex = -1;
  let endColumnIndex = -1;
  
  // Find which column contains the start and end dates
  for (let i = 0; i < timeColumns.length; i++) {
    const columnDate = normalizeDate(timeColumns[i]);
    
    // For months view
    if (timeUnit === 'Months') {
      if (columnDate.getMonth() === normalizedStart.getMonth() && 
          columnDate.getFullYear() === normalizedStart.getFullYear()) {
        startColumnIndex = i;
      }
      
      if (columnDate.getMonth() === normalizedEnd.getMonth() && 
          columnDate.getFullYear() === normalizedEnd.getFullYear()) {
        endColumnIndex = i;
      }
    } 
    // For weeks view
    else if (timeUnit === 'Weeks') {
      const weekStart = normalizeDate(getStartOfWeek(timeColumns[i]));
      const weekEnd = normalizeDate(getEndOfWeek(timeColumns[i]));
      
      if (normalizedStart >= weekStart && normalizedStart <= weekEnd) {
        startColumnIndex = i;
      }
      
      if (normalizedEnd >= weekStart && normalizedEnd <= weekEnd) {
        endColumnIndex = i;
      }
    }
  }
  
  // If columns weren't found, use closest approximation
  if (startColumnIndex === -1) startColumnIndex = 0;
  if (endColumnIndex === -1) endColumnIndex = timeColumns.length - 1;
  
  // Calculate position within the column
  let startOffset = 0;
  let endOffset = columnWidth;
  
  if (timeUnit === 'Months') {
    // Calculate day position within the month
    const daysInMonth = new Date(normalizedStart.getFullYear(), normalizedStart.getMonth() + 1, 0).getDate();
    startOffset = (normalizedStart.getDate() - 1) / daysInMonth * columnWidth;
    
    const endDaysInMonth = new Date(normalizedEnd.getFullYear(), normalizedEnd.getMonth() + 1, 0).getDate();
    endOffset = normalizedEnd.getDate() / endDaysInMonth * columnWidth;
  } else if (timeUnit === 'Weeks') {
    // Calculate day position within the week (0-6)
    const dayOfWeek = normalizedStart.getDay() === 0 ? 6 : normalizedStart.getDay() - 1; // Convert to 0=Monday
    startOffset = dayOfWeek / 7 * columnWidth;
    
    const endDayOfWeek = normalizedEnd.getDay() === 0 ? 6 : normalizedEnd.getDay() - 1;
    endOffset = (endDayOfWeek + 1) / 7 * columnWidth; // +1 to include the full end day
  }
  
  // Calculate final position and width
  const left = startColumnIndex * columnWidth + startOffset;
  const right = endColumnIndex * columnWidth + endOffset;
  
  return {
    left: `${left}px`,
    width: `${Math.max(right - left, 50)}px`, // Minimum width
  };
};

// Update calculateTodayPosition to use the same function
const calculateTodayPosition = () => {
  if (!visibleStartDate || !visibleEndDate) return null;
  
  // Check if today is within the visible range
  if (today < visibleStartDate || today > visibleEndDate) return null;
  
  // Use the same positioning function for consistency
  return `${getPositionForDate(today)}px`;
};

  // Find which sprint row we're currently hovering over
  const findSprintFromY = (y: number): string | null => {
    const sprintRows = document.querySelectorAll('.sprint-row');
    for (let i = 0; i < sprintRows.length; i++) {
      const row = sprintRows[i];
      const rect = row.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) {
        return row.getAttribute('data-sprint-id');
      }
    }
    return null;
  };
// 3. Update the handleMouseMove function to calculate from original position
const handleMouseMove = (event: React.MouseEvent) => {
  if (!dragStart || !draggedItemOriginalDates) return;
  
  const containerRect = containerRef.current?.getBoundingClientRect();
  if (!containerRect) return;
  
  const scrollOffset = timelineRef.current?.scrollLeft || 0;
  const currentX = event.clientX - containerRect.left + scrollOffset;
  
  // Get exact date at current mouse position
  const currentDate = pixelToDate(currentX - scrollOffset);
  
  // Calculate the date difference from the ORIGINAL drag start point
  const dateDiffMs = currentDate.getTime() - dragStart.date.getTime();
  const daysDiff = Math.round(dateDiffMs / (24 * 60 * 60 * 1000));
  
  // Track which sprint we're hovering over
  const hoveredSprint = findSprintFromY(event.clientY);
  if (hoveredSprint !== currentHoverSprint) {
    setCurrentHoverSprint(hoveredSprint);
  }

  if (draggingEpic) {
    // Original dates from when drag started
    const originalStartDate = draggedItemOriginalDates.startDate;
    const originalEndDate = draggedItemOriginalDates.endDate;
    
    // Create new dates by adding days difference to ORIGINAL dates
    const newStartDate = new Date(originalStartDate);
    newStartDate.setDate(originalStartDate.getDate() + daysDiff);
    
    const newEndDate = new Date(originalEndDate);
    newEndDate.setDate(originalEndDate.getDate() + daysDiff);
    
    // Update the epic
    if (onUpdateEpic) {
      onUpdateEpic(draggingEpic, {
        startDate: newStartDate,
        endDate: newEndDate,
      });
    }
  }
  
  if (resizingEpic) {
    // Original dates
    const originalStartDate = draggedItemOriginalDates.startDate;
    const originalEndDate = draggedItemOriginalDates.endDate;
    
    if (resizingEpic.edge === 'left') {
      // Resize from left edge using ORIGINAL start date
      const newStartDate = new Date(originalStartDate);
      newStartDate.setDate(originalStartDate.getDate() + daysDiff);
      
      // Ensure start date doesn't go past end date
      if (newStartDate < originalEndDate) {
        onUpdateEpic && onUpdateEpic(resizingEpic.id, { startDate: newStartDate });
      }
    } else {
      // Resize from right edge using ORIGINAL end date
      const newEndDate = new Date(originalEndDate);
      newEndDate.setDate(originalEndDate.getDate() + daysDiff);
      
      // Ensure end date doesn't go before start date
      if (newEndDate > originalStartDate) {
        onUpdateEpic && onUpdateEpic(resizingEpic.id, { endDate: newEndDate });
      }
    }
  }
};

  // Handle mouse up (end drag/resize)
  const handleMouseUp = () => {
    if (draggingEpic && currentHoverSprint) {
      // Find which sprint the epic currently belongs to
      let currentSprintId: string | null = null;
      for (const sprint of sprints) {
        if (sprint.epics?.some(epic => epic.id === draggingEpic)) {
          currentSprintId = sprint.id;
          break;
        }
      }
      
      // If hovering over a different sprint, handle this
      if (currentSprintId && currentHoverSprint !== currentSprintId && onUpdateEpic) {
        // In a real implementation, you'd move the epic to the new sprint
        console.log(`Moving epic ${draggingEpic} from ${currentSprintId} to ${currentHoverSprint}`);
      }

      
    }
    
    // Reset state
    // Clean up all drag-related state
    setDraggingEpic(null);
    setResizingEpic(null);
    setDragStart(null);
    setDraggedItemOriginalDates(null);
    setCurrentHoverSprint(null);
  };

  // Helper function to get the start date of a week
  const getStartOfWeek = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? 6 : day - 1; // Make Monday the first day of the week
    result.setDate(result.getDate() - diff);
    return result;
  };

  // Helper function to get the end date of a week
  const getEndOfWeek = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? 0 : 7 - day; // Make Sunday the last day of the week
    result.setDate(result.getDate() + diff);
    return result;
  };

  // Format column date based on time unit
  const formatColumnDate = (date: Date) => {
    switch (timeUnit) {
      case 'Weeks':
        return `${date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}`;
      case 'Months':
        return date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
      case 'Quarters':
        const quarter = Math.floor(date.getMonth() / 3);
        
        // Format as month ranges
        switch (quarter) {
          case 0: return 'JAN - MAR';
          case 1: return 'APR - JUN';
          case 2: return 'JUL - SEP';
          case 3: return 'OCT - DEC';
          default: return '';
        }
    }
  };

// 3. Add a helper function to check if a column represents the current month/day/etc.
const isCurrentTimeUnit = (date: Date) => {
  if (timeUnit === 'Months') {
    return date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  } else if (timeUnit === 'Weeks') {
    // Check if the week contains today
    const weekStart = new Date(date);
    const weekEnd = new Date(date);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return today >= weekStart && today <= weekEnd;
  } else if (timeUnit === 'Quarters') {
    const dateQuarter = Math.floor(date.getMonth() / 3);
    const todayQuarter = Math.floor(today.getMonth() / 3);
    
    return dateQuarter === todayQuarter && 
           date.getFullYear() === today.getFullYear();
  }
  
  return false;
};


// 2. Update the handleEpicMouseDown function to store original positions
const handleEpicMouseDown = (
  event: React.MouseEvent, 
  epicId: string, 
  edge: 'left' | 'right' | 'center'
) => {
  event.preventDefault();
  event.stopPropagation();
  
  // Get click position
  const containerRect = containerRef.current?.getBoundingClientRect();
  if (!containerRect) return;
  
  const scrollOffset = timelineRef.current?.scrollLeft || 0;
  const clickX = event.clientX - containerRect.left + scrollOffset;
  const clickDate = pixelToDate(clickX - scrollOffset);
  
  // Find the epic
  const epic = allEpics.find(e => e.id === epicId);
  if (!epic) return;
  
  // Store original dates
  setDraggedItemOriginalDates({
    id: epicId,
    startDate: new Date(epic.startDate),
    endDate: new Date(epic.endDate)
  });
  
  // Set drag start point
  setDragStart({ x: clickX, date: clickDate });
  
  if (edge === 'left' || edge === 'right') {
    setResizingEpic({ id: epicId, edge });
  } else {
    setDraggingEpic(epicId);
  }
};

const handleEnterPress = (value: string) => {
  console.log('Enter pressed with value:', value);
  // Add your action logic here
  // For example: submit the form, add a todo item, etc.

  onCreateNewEpic && onCreateNewEpic(sprints[0].id, value);

  // Optionally clear the input after action
  setInputValue('');
  setTextInputIsVisible(false)
};

  return (
    <div className="flex flex-col border border-gray-200 rounded">
      {/* Single scrollable container that includes both header and content */}
      <div 
        className="flex-grow overflow-x-auto"
        ref={timelineRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={{ width: `${getTimelineWidth()}px` }}>
          {/* Headers that scroll with content */}
          <div className="flex border-b border-gray-200">
            {/* Fixed left sidebar */}
            <div className="flex-shrink-0 w-96 border-r border-gray-200 bg-white sticky left-0 z-20">
              <div className="h-8"></div>
            </div>
            
            {/* Scrollable time columns */}
            <div className="flex-grow">
              <div className="flex">
                {timeColumns.map((column, index) => (
                  <div 
                    key={index} 
                    className={`flex-shrink-0 text-center border-r border-gray-200 p-2 ${
                      isCurrentTimeUnit(column) ? 'bg-blue-50' : ''
                    }`}
                    style={{ width: `${columnWidth}px` }}
                  >
                    {timeUnit === 'Weeks' ? (
                      <div>
                        <div className="font-medium text-gray-700">{formatColumnDate(column)}</div>
                        <DayTilesRow startDate={getStartOfWeek(column)} endDate={getEndOfWeek(column)} />
                      </div>
                    ) : (
                      <div className="font-medium text-gray-700">
                        {formatColumnDate(column)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Content area */}
          <div className="flex">
            {/* Fixed sprint names sidebar */}
            <div className="flex-shrink-0 w-96 border-r border-gray-200 sticky left-0 bg-white z-10">
              {sprints.map((sprint) => (
                <div key={sprint.id}>
                  {sprint.epics?.map((epic) => (
                    <div 
                      key={epic.id} 
                      className="p-4 border-b border-gray-200 h-12 flex items-center"
                    >
                      <div className="font-medium">{epic.name}</div>
                    </div>
                  ))}
                </div>
              ))}
              <div className='p-2'>
                {textInputIsVisible ? (
                  <EpicNameTextInput
                    icon={<FileQuestion />}
                    placeholder="What needs to be done?"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onEnter={handleEnterPress}
                  />
                ): (
                  <button
                  className='py-1 rounded text-gray-700 hover:bg-gray-50'
                  onClick={() => setTextInputIsVisible(!textInputIsVisible)}
                >+ Add epic
                </button>
                )}


              </div>
            </div>
            
            {/* Scrollable timeline grid */}
            <div 
              className="flex-grow relative"
              ref={containerRef}
            >
              {/* Grid background */}
              <div className="absolute inset-0">
                <div className="flex h-full">
                  {timeColumns.map((_, index) => (
                    <div 
                      key={index} 
                      className="border-r border-gray-200 h-full min-w-[200px]"
                      style={{ width: `${getColumnWidth()}px` }}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Today indicator */}

              {calculateTodayPosition() && (
                <div 
                  className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                  style={{ left: calculateTodayPosition() }}
                >
                  <div className="absolute top-0 left-0 transform -translate-x-1/2 bg-red-500 text-white text-xs rounded px-1 py-0.5">
                    Today
                  </div>
                </div>
              )}
              
              {/* Sprint rows */}
              {sprints[0].epics?.map((epic) => (
                <div 
                  key={epic.id} 
                  data-sprint-id={epic.id}
                  className={`relative border-b border-gray-200 h-12 sprint-row ${
                    currentHoverSprint === epic.id && draggingEpic ? 'bg-blue-50' : ''
                  }`}
                >
                  <button 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm py-1 px-3 rounded flex items-center"
                    onClick={() => onCreateEpic && onCreateEpic(epic.id)}
                  >
                    <span className="mr-1">+</span> Create Epic
                  </button>
                  


                  {/* Render single epic directly */}
                  {epic.startDate && epic.endDate && (
                    (() => {
                      const style = calculateItemStyle(epic.startDate, epic.endDate);
                      const isDragging = draggingEpic === epic.id;
                      const isResizing = resizingEpic?.id === epic.id;
                      
                      return (
                        <div
                          key={epic.id}
                          className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded text-white px-3 flex items-center overflow-hidden 
                                    ${isDragging || isResizing ? 'opacity-70 shadow-lg z-10 cursor-move' : 'cursor-pointer hover:brightness-90'}`}
                          style={{
                            ...style,
                            backgroundColor: epic.color || '#3b82f6'
                          }}
                          onMouseDown={(e) => handleEpicMouseDown(e, epic.id, 'center')}
                        >
                          {/* Left resize handle */}
                          <div 
                            className="absolute left-0 top-0 w-2 h-full cursor-ew-resize"
                            onMouseDown={(e) => handleEpicMouseDown(e, epic.id, 'left')}
                          ></div>
                          
                          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                            {/* {epic.name} */}
                          </span>
                          
                          {/* Right resize handle */}
                          <div 
                            className="absolute right-0 top-0 w-2 h-full cursor-ew-resize"
                            onMouseDown={(e) => handleEpicMouseDown(e, epic.id, 'right')}
                          ></div>
                          
                          {/* Delete button */}
                          {onDeleteEpic && (
                            <button
                              className="absolute right-1 top-1 w-4 h-4 flex items-center justify-center rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEpic(epic.id);
                              }}
                            >
                              <span className="text-xs">×</span>
                            </button>
                          )}
                        </div>
                      );
                    })()
                  )}

                  {/* Epics in this sprint */}

                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    
        <div className="border rounded-lg absolute bottom-0 right-20 z-20 bg-white">
        {/* Timeline Controls */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex items-center space-x-4">
            <button className="p-1 rounded hover:bg-gray-100">
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className='px-3 py-1 rounded text-gray-700 hover:bg-gray-50' onClick={() => scrollToToday()}>Today</button>
            {['Weeks', 'Months', 'Quarters'].map(mode => (
              <button
                key={mode}
                className={`px-3 py-1 rounded ${
                  timeUnit === mode ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setTimeUnit(mode as typeof timeUnit)}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 rounded hover:bg-gray-100">
              <Info className="w-4 h-4" />
            </button>
            <button className="p-1 rounded hover:bg-gray-100">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollableTimeline;