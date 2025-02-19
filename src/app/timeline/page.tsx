'use client'
import React, { useState, useEffect } from 'react';
import { Search, Settings, Share, Download, MoreHorizontal, Plus, ChevronDown, Info, Maximize2 } from 'lucide-react';
import { format, addMonths, addWeeks, addQuarters, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import TimelineContainer from '@/components/TimelineContainer';

// Types
interface Epic {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: 'todo' | 'in_progress' | 'done';
}

interface TimelineProps {
  projectId: string;
}

const Timeline: React.FC<TimelineProps> = ({ projectId }) => {
  // States
  const [viewMode, setViewMode] = useState<'Today' | 'Weeks' | 'Months' | 'Quarters'>('Months');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: addMonths(new Date(), 3)
  });
  const [epics, setEpics] = useState<Epic[]>([]);

  // Settings state
  const [settings, setSettings] = useState({
    showCompleted: true,
    displayRange: '12 months',
    dependencies: true,
    progress: true,
    warnings: true
  });

  // Effect to update date range based on view mode
  useEffect(() => {
    const today = new Date();
    let end;
    
    switch (viewMode) {
      case 'Today':
        end = addWeeks(today, 1);
        break;
      case 'Weeks':
        end = addWeeks(today, 4);
        break;
      case 'Months':
        end = addMonths(today, 3);
        break;
      case 'Quarters':
        end = addQuarters(today, 1);
        break;
      default:
        end = addMonths(today, 3);
    }
    
    setDateRange({ start: today, end });
  }, [viewMode]);

  // Generate timeline dates
  const timelineDates = eachDayOfInterval({
    start: startOfMonth(dateRange.start),
    end: endOfMonth(dateRange.end)
  });

  // Status filter component
  const StatusFilter = () => (
    <div className="relative inline-block">
      <button className="flex items-center px-3 py-1 text-gray-700 border rounded hover:bg-gray-50">
        Status category
        <ChevronDown className="w-4 h-4 ml-1" />
      </button>
      <div className="absolute mt-1 bg-white border rounded shadow-lg z-10 w-48 hidden">
        <div className="p-2">
          <label className="flex items-center space-x-2">
            <input type="checkbox" /> <span>To Do</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" /> <span>In Progress</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" /> <span>Done</span>
          </label>
        </div>
      </div>
    </div>
  );

  // Settings panel component
  const SettingsPanel = () => (
    <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-lg p-4 w-80 z-20">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Display range</h3>
          <select 
            className="w-full border rounded p-1"
            value={settings.displayRange}
            onChange={(e) => setSettings({...settings, displayRange: e.target.value})}
          >
            <option value="12 months">12 months</option>
            <option value="6 months">6 months</option>
            <option value="3 months">3 months</option>
          </select>
        </div>

        <div>
          <label className="flex items-center justify-between">
            <span>Show completed</span>
            <div className="relative inline-block w-10 h-6 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer bg-gray-200"
                 onClick={() => setSettings({...settings, showCompleted: !settings.showCompleted})}>
              <div className={`inline-block w-4 h-4 transition duration-200 ease-in-out transform bg-white rounded-full ${settings.showCompleted ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </label>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Visual details</h3>
          <label className="flex items-center justify-between">
            <span>Dependencies</span>
            <div className="relative inline-block w-10 h-6 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer bg-gray-200">
              <div className={`inline-block w-4 h-4 transition duration-200 ease-in-out transform bg-white rounded-full ${settings.dependencies ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </label>
          <label className="flex items-center justify-between">
            <span>Progress</span>
            <div className="relative inline-block w-10 h-6 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer bg-gray-200">
              <div className={`inline-block w-4 h-4 transition duration-200 ease-in-out transform bg-white rounded-full ${settings.progress ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </label>
          <label className="flex items-center justify-between">
            <span>Warnings</span>
            <div className="relative inline-block w-10 h-6 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer bg-gray-200">
              <div className={`inline-block w-4 h-4 transition duration-200 ease-in-out transform bg-white rounded-full ${settings.warnings ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </label>
        </div>

        <a href="#" className="text-blue-600 text-sm hover:underline block mt-4">
          Learn more about timeline view settings
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white w-full">
      <div className='flex-1 p-8'>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-sm text-gray-600 mb-2">Projects / My Scrum Project</div>
          <h1 className="text-2xl font-medium">Summary</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-700 hover:text-gray-900">
            <Info className="w-5 h-5" />
          </button>
          <button className="text-gray-700 hover:text-gray-900">
            <Share className="w-5 h-5" />
          </button>
          <button className="text-gray-700 hover:text-gray-900">
            <Download className="w-5 h-5" />
          </button>
          <button className="text-gray-700 hover:text-gray-900">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search timeline"
              className="pl-10 pr-4 py-2 border rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <StatusFilter />
        </div>
        <div className="relative">
          <button
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-5 h-5" />
            <span>View settings</span>
          </button>
          {showSettings && <SettingsPanel />}
        </div>
      </div>

      {/* Timeline */}
      <TimelineContainer timeOption={viewMode} />
      <div className="border rounded-lg absolute bottom-10 right-20">
        {/* Timeline Controls */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex items-center space-x-4">
            <button className="p-1 rounded hover:bg-gray-100">
              <ChevronDown className="w-4 h-4" />
            </button>
            {['Today', 'Weeks', 'Months', 'Quarters'].map(mode => (
              <button
                key={mode}
                className={`px-3 py-1 rounded ${
                  viewMode === mode ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode(mode as typeof viewMode)}
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
    </div>
  );
};

export default Timeline;