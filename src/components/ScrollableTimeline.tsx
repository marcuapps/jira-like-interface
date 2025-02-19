'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { TimelinePeriod } from '@/lib/types';
import DayTilesRow from './DayTilesRow';

interface ScrollableTimelineProps {
  timeOption: string;
}

const ScrollableTimeline: React.FC<ScrollableTimelineProps> = ({ timeOption }) => {
  const [isClient, setIsClient] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate timeline periods (quarters)
  const generateQuarters = () => {
    const currentDate = new Date();
    const periods: TimelinePeriod[] = [];
    
    for (let i = 0; i < 8; i++) {
      const startDate = new Date(currentDate);
      startDate.setMonth(i * 3);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 2);
      
      const label = `${startDate.toLocaleString('en-us', { month: 'short' })} – ${endDate.toLocaleString('en-us', { month: 'short' })}`;
      periods.push({ label, startDate, endDate });
    }
    
    return periods;
  };

  const generateMonths = () => {
    const currentDate = new Date();
    const periods: TimelinePeriod[] = [];

    for (let i = 0; i < 12; i++) {
      const startDate = new Date(currentDate);
      startDate.setMonth(i);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth());
      
      const label = `${startDate.toLocaleString('en-us', { month: 'short' })}`;
      periods.push({ label, startDate, endDate });
    }
    
    return periods;
  };

  const generateWeeksForCurrentMonth = () => {
    const periods: TimelinePeriod[] = [];
    const currentDate = new Date();
    
    // Set to first day of current month
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    
    // Get last day of current month
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    
    // Start from first day and generate weeks
    const currentWeekStart = new Date(firstDayOfMonth);
    
    while (currentWeekStart <= lastDayOfMonth) {
      // Calculate end of week (6 days after start)
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      
      // Adjust if week end is in next month
      const adjustedWeekEnd = new Date(
        Math.min(weekEnd.getTime(), lastDayOfMonth.getTime())
      );
      
      // Format dates for label
      const monthLabel = currentWeekStart.toLocaleString('en-us', { month: 'short' });
      
      periods.push({
        label: `${monthLabel}`,
        startDate: new Date(currentWeekStart),
        endDate: new Date(adjustedWeekEnd)
      });
      
      // Move to next week
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    return periods;
  };


  const generateTimelinePeriods = () => {
    switch (timeOption) {
      case 'Months':
        return generateMonths();
      case 'Quarters':
        return generateQuarters();
      case 'Weeks':
        return generateWeeksForCurrentMonth();
      default:
        return generateWeeksForCurrentMonth();
    }
  }

  // Only generate periods on the client side
  const periods = isClient ? generateTimelinePeriods() : [];

  if (!isClient) {
    return (
      <div className="h-full flex">
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
          <div className="p-4">
            <h2 className="font-medium mb-2">Sprints</h2>
            <div className="flex items-center space-x-2 text-gray-700">
              <Plus className="w-4 h-4" />
              <span>Create Epic</span>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-gray-50"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex">
        {/* Fixed left panel */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
          <div className="p-4">
            <h2 className="font-medium mb-2">Sprints</h2>
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
              <Plus className="w-4 h-4" />
              <span>Create Epic</span>
            </button>
          </div>
        </div>

        {/* Scrollable timeline content */}
        <div 
          ref={scrollContainerRef}
          className="w-[1300px] overflow-x-auto bg-gray-50"
          style={{ overflowY: 'hidden' }}
        >
          {/* Timeline header */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {periods.map((period, index) => (
              <div 
                key={index}
                className="w-64 p-4 text-sm text-gray-600 border-r border-gray-200 flex-shrink-0"
              >
                <p>{period.label}</p>
                {timeOption === 'Weeks' && <div><DayTilesRow startDate={period.startDate} endDate={period.endDate} /></div>}
              </div>
            ))}
          </div>

          {/* Timeline content */}
          <div className="flex">
            {periods.map((period, index) => (
              <div 
                key={index}
                className="w-64 h-96 border-r border-gray-200 flex-shrink-0 bg-white "
              >
                <div className="relative h-full">
                  {index === 1 && (
                    <div className="absolute left-1/2 top-0 w-px h-full bg-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollableTimeline;