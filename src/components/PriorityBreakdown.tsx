import React from 'react';
import { ArrowUpCircle, ArrowUp, ArrowRight, ArrowDown, ArrowDownCircle } from 'lucide-react';

const PriorityBreakdown = () => {
  const priorities = [
    { level: 'Highest', icon: ArrowUpCircle, color: 'text-red-500' },
    { level: 'High', icon: ArrowUp, color: 'text-orange-500' },
    { level: 'Medium', icon: ArrowRight, color: 'text-yellow-500' },
    { level: 'Low', icon: ArrowDown, color: 'text-blue-500' },
    { level: 'Lowest', icon: ArrowDownCircle, color: 'text-gray-500' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold">Priority breakdown</h2>
      <p className="text-gray-600 mb-4">
        Get a holistic view of how work is being prioritized.{' '}
        <a href="#" className="text-blue-600 hover:underline">
          How to manage priorities for projects
        </a>
      </p>
      <div className="relative h-64 border-l-2 border-b-2 border-black ml-6 mb-4">
        {/* Y-axis labels */}
        <div className="absolute -left-6 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>1</span>
          <span>0.5</span>
          <span>0</span>
        </div>
        {/* X-axis priorities */}
        <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-xs text-gray-500">
          {priorities.map(({ level, icon: Icon, color }) => (
            <div key={level} className="flex items-center">
              <div className='flex flex-col'>
                <span className='text-center text-gray-400 mb-1'>|</span>
                <div className='flex flex-row'>
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="ml-1">{level}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriorityBreakdown;