'use client'
import React, { useState } from 'react';
import { Search, Settings2, Share, Download, MoreHorizontal, ChevronDown, Info, Maximize2 } from 'lucide-react';
import TimelineContainer from '@/components/timeline/TimelineContainer';
import StatusCategoryDropdown from '@/components/StatusCategoryDropdown';

interface TimelineProps {
  projectId: string;
}

const Timeline: React.FC<TimelineProps> = ({ projectId }) => {
  const [viewMode, setViewMode] = useState<'Today' | 'Weeks' | 'Months' | 'Quarters'>('Months');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    showCompleted: true,
    displayRange: '12 months',
    dependencies: true,
    progress: true,
    warnings: true
  });

  // Settings panel component
  const SettingsPanel = () => (
    <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-lg p-4 w-[450px] z-20">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-gray-500 mb-3">Display range</h3>
          <label className="flex items-center justify-between">
            <span>Show completed</span>
            <div className={`relative inline-block w-10 h-6 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer ${settings.showCompleted ? 'bg-green-500' : 'bg-gray-200'}`}
                 onClick={() => setSettings({...settings, showCompleted: !settings.showCompleted})}>
              <div className={`inline-block w-4 h-4 transition duration-200 ease-in-out transform bg-white rounded-full ${settings.showCompleted ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </label>
        </div>

        <div>
          <select 
            className="w-full border rounded p-1"
            value={settings.displayRange}
            onChange={(e) => setSettings({...settings, displayRange: e.target.value})}
          >
            <option value="12 months">12 months</option>
            <option value="6 months">6 months</option>
            <option value="3 months">3 months</option>
          </select>
          <span className='text-xs text-gray-500'>Completed Epic issues with due dates outside of this range won't show on your timeline.</span>
        </div>
    
        <hr />

        <p className='mt-2'>Expand all Epic issues</p>
        <p>Collapse all Epic issues</p>

        <hr />

        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-gray-500">Visual details</h3>
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
          <h1 className="text-2xl font-medium">Timeline</h1>
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
          {/* <StatusFilter /> */}
          <StatusCategoryDropdown />
        </div>
        <div className="relative">
          <button
            className="flex items-center space-x-2 px-2 py-1 text-blue-600 hover:bg-blue-100 rounded"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 className="w-5 h-5" />
            <span>View settings</span>
          </button>
          {showSettings && <SettingsPanel />}
        </div>
      </div>

      {/* Timeline */}
      <TimelineContainer />
      </div>
    </div>
  );
};

export default Timeline;