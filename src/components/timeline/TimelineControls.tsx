import { TimeUnit } from "@/lib/types";
import React from "react";
import { ChevronDown, Info, Maximize2 } from "lucide-react";

interface TimelineControlsProps {
  timeUnit: TimeUnit;
  setTimeUnit: (mode: TimeUnit) => void;
  scrollToToday: () => void;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({ timeUnit, setTimeUnit, scrollToToday }) => {
  return (
    <div className="border rounded-lg absolute bottom-0 right-20 z-20 bg-white">
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
  )
}

export default TimelineControls;