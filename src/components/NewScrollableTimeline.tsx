// ScrollableTimelineView.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Sprint, Epic } from '@/lib/types';
import { getQuarterProgress } from '@/utils/dateUtils';
import DayTilesRow from './DayTilesRow';
import { ChevronDown, Maximize2, Info } from 'lucide-react';

type TimeUnit = 'Weeks' | 'Months' | 'Quarters';

interface ScrollableTimelineViewProps {
  sprints: Sprint[];
  onCreateEpic?: (sprintId: string) => void;
  onUpdateEpic?: (epicId: string, updates: Partial<Epic>) => void;
  onDeleteEpic?: (epicId: string) => void;
  onCreateSprint?: (sprintId: string) => void;
}

const ScrollableTimeline: React.FC<ScrollableTimelineViewProps> = ({
  sprints,
  onCreateEpic,
  onUpdateEpic,
  onDeleteEpic,
  onCreateSprint,
}) => {
  // Get today's date
  const today = new Date();
  
  // Default visible range: 1 year back, 2 years forward
  const defaultStartDate = new Date(today);
  defaultStartDate.setFullYear(today.getFullYear() - 1);
  
  const defaultEndDate = new Date(today);
  defaultEndDate.setFullYear(today.getFullYear() + 2);
  
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
  const current = new Date(visibleStartDate);
  
  // Generate appropriate number of columns based on time unit
  while (current <= visibleEndDate) {
    columns.push(new Date(current));
    
    switch (timeUnit) {
      case 'Weeks':
        current.setDate(current.getDate() + 7);
        break;
      case 'Months':
        current.setMonth(current.getMonth() + 1);
        break;
      case 'Quarters':
        current.setMonth(current.getMonth() + 3);
        break;
    }
  }

  console.log(columns)
  
  setTimeColumns(columns);
}, [timeUnit, visibleStartDate, visibleEndDate]); // Depend on timeUnit and the date range

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

  // Calculate position and width for an epic
  const calculateItemStyle = (itemStart: Date, itemEnd: Date) => {
    if (!containerRef.current) return {};
    
    const timelineWidth = getTimelineWidth();
    const totalDuration = visibleEndDate.getTime() - visibleStartDate.getTime();
    
    // Calculate position and width, ensuring dates are within visible range
    const itemStartTime = Math.max(itemStart.getTime(), visibleStartDate.getTime());
    const itemEndTime = Math.min(itemEnd.getTime(), visibleEndDate.getTime());
    
    // Calculate position as percentage of total width
    const startOffset = (itemStartTime - visibleStartDate.getTime()) / totalDuration;
    const duration = itemEndTime - itemStartTime;
    const widthPercentage = duration / totalDuration;
    
    return {
      left: `${startOffset * timelineWidth}px`,
      width: `${Math.max(widthPercentage * timelineWidth, 50)}px`, // Minimum width of 50px
    };
  };

// 1. Update the calculateTodayPosition function to be more precise
const calculateTodayPosition = () => {
  if (!visibleStartDate || !visibleEndDate) return null;
  
  // Check if today is within the visible range
  if (today < visibleStartDate || today > visibleEndDate) return null;
  
  // For more precise positioning in different time units
  if (timeUnit === 'Months') {
    // Find which month column today belongs to
    const monthIndex = timeColumns.findIndex(col => 
      col.getMonth() === today.getMonth() && 
      col.getFullYear() === today.getFullYear()
    );

    const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    if (monthIndex !== -1) {
      // Position at the start of the month (plus a small offset if it's not the 1st)
      // return `${monthIndex * columnWidth}px`;
      return `${monthIndex * columnWidth + today.getDate() / totalDays * columnWidth}px`;
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
      return `${(weekIndex + 1) * columnWidth + today.getDay() / 7 * columnWidth - 10}px`;
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
      return `${quarterIndex * columnWidth + getQuarterProgress(today) * columnWidth}px`;
    }
  }
  
  // Fallback to the original calculation if the above methods fail
  const totalDuration = visibleEndDate.getTime() - visibleStartDate.getTime();
  const offset = (today.getTime() - visibleStartDate.getTime()) / totalDuration;
  const timelineWidth = getTimelineWidth();
  
  return `${Math.floor(offset * timelineWidth)}px`;
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

const handleAddSprint = (sprintId: string) => {
  onCreateSprint && onCreateSprint(sprintId);
}

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
            <div className="flex-shrink-0 w-48 border-r border-gray-200 bg-white sticky left-0 z-20">
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
            <div className="flex-shrink-0 w-48 border-r border-gray-200 sticky left-0 bg-white z-10">
              {sprints.map((sprint) => (
                <div 
                  key={sprint.id} 
                  className="p-4 border-b border-gray-200 h-12 flex items-center"
                >
                  <div className="font-medium">{sprint.name}</div>
                </div>
              ))}
              <div className="p-4 border-b border-gray-200 h-12 flex items-center">
                <button
                  className='py-1 rounded text-gray-700 hover:bg-gray-50'
                  onClick={() => handleAddSprint(sprints[0].id)}
                >+ Add epic</button>
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
              {sprints.map((sprint) => (
                <div 
                  key={sprint.id} 
                  data-sprint-id={sprint.id}
                  className={`relative border-b border-gray-200 h-12 sprint-row ${
                    currentHoverSprint === sprint.id && draggingEpic ? 'bg-blue-50' : ''
                  }`}
                >
                  <button 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm py-1 px-3 rounded flex items-center"
                    onClick={() => onCreateEpic && onCreateEpic(sprint.id)}
                  >
                    <span className="mr-1">+</span> Create Epic
                  </button>
                  
                  {/* Epics in this sprint */}
                  {sprint.epics?.map((epic) => {
                    if (epic.startDate && epic.endDate) {
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
                  }
                  })}
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