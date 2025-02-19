import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface StatusOption {
  id: string;
  label: string;
  checked: boolean;
}

const StatusCategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [statuses, setStatuses] = useState<StatusOption[]>([
    { id: 'todo', label: 'To Do', checked: false },
    { id: 'inProgress', label: 'In Progress', checked: false },
    { id: 'done', label: 'Done', checked: false },
  ]);

  const handleStatusChange = (statusId: string) => {
    setStatuses(statuses.map(status => 
      status.id === statusId 
        ? { ...status, checked: !status.checked }
        : status
    ));
  };

  return (
    <div className="relative">
      {/* Dropdown button */}
      <button 
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 text-sm rounded-md hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Status category</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {statuses.map(status => (
              <label 
                key={status.id}
                className="flex items-center px-4 py-2 hover:bg-gray-50 hover:border-l-2 border-blue-500 cursor-pointer"
              >
                <div className="flex items-center flex-1">
                  <input
                    type="checkbox"
                    checked={status.checked}
                    onChange={() => handleStatusChange(status.id)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{status.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop for closing dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default StatusCategoryDropdown;