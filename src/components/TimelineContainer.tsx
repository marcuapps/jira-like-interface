'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface TimelinePeriod {
  label: string;
  startDate: Date;
  endDate: Date;
}

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

  // const generateTimelinePeriods = () => {
  //   switch (timeOption) {
  //     case 'Months':
  //       generateQuarters()
  //     case 'Quarters':
  //   }
  // }

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
      const startLabel = currentWeekStart.getDate();
      const endLabel = adjustedWeekEnd.getDate();
      const monthLabel = currentWeekStart.toLocaleString('en-us', { month: 'short' });
      
      periods.push({
        // label: `${monthLabel} ${startLabel}–${endLabel}`,
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
    if (timeOption === 'Months') {
      return generateMonths();
    } else if (timeOption === 'Quarters') {
      return generateQuarters();
    } else if (timeOption === 'Weeks') {
      return generateWeeksForCurrentMonth();
    } else {
      return generateWeeksForCurrentMonth();
    }
  }


  interface DayTile {
    date: Date;
    dayNumber: number;
    isToday: boolean;
    isSelected: boolean;
    isWeekend: boolean;
  }

  const generateDayTiles = (startDate: Date, endDate: Date) => {
    const tiles: DayTile[] = [];
    const currentDate = new Date();
    
    // Clone the start date to avoid modifying the original
    let current = new Date(startDate);
    
    // Generate tiles until we reach end date
    while (current <= endDate) {
      tiles.push({
        date: new Date(current),
        dayNumber: current.getDate(),
        isToday: 
          current.getDate() === currentDate.getDate() &&
          current.getMonth() === currentDate.getMonth() &&
          current.getFullYear() === currentDate.getFullYear(),
        isSelected: false, // You can add logic for selection
        isWeekend: current.getDay() === 0 || current.getDay() === 6
      });
      
      // Move to next day
      current.setDate(current.getDate() + 1);
    }
    
    return tiles;
  };

interface DayTilesRowProps {
  startDate: Date;
  endDate: Date;
}

  // Component to render the tiles
const DayTilesRow: React.FC<DayTilesRowProps> = ({ startDate, endDate }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Example: Generate tiles for current week
  // const startDate = new Date('2024-02-10');  // Feb 10
  // const endDate = new Date('2024-02-16');    // Feb 16
  
  const tiles = generateDayTiles(startDate, endDate);

  return (
    <div className="flex border-b border-gray-200">
      {tiles.map((tile, index) => (
        <div
          key={tile.date.toISOString()}
          className={`
            flex-1 h-8 flex items-center justify-center text-sm
            ${tile.isToday ? 'text-blue-600' : 'text-gray-700'}
            ${tile.isSelected ? 'bg-blue-50' : ''}
            ${tile.isWeekend ? 'text-gray-400' : ''}
            ${index !== tiles.length - 1 ? 'border-r border-gray-200' : ''}
            cursor-pointer hover:bg-gray-50
          `}
          onClick={() => setSelectedDate(tile.date)}
        >
          <span className={`
            ${tile.isToday ? 'font-medium' : ''}
            ${tile.isSelected ? 'font-medium' : ''}
          `}>
            {tile.dayNumber}
          </span>
        </div>
      ))}
    </div>
  );
};

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
                className="w-64 h-96 border-r border-gray-200 flex-shrink-0 bg-gray-50"
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

interface TimelineContainerProps {
  timeOption: string;
}

// Parent container component
const TimelineContainer: React.FC<TimelineContainerProps> = ({ timeOption }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Timeline */}
      <div className="flex-1 overflow-hidden border">
        <ScrollableTimeline timeOption={timeOption} />
      </div>
    </div>
  );
};

export default TimelineContainer;