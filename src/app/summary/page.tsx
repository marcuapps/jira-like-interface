import React from 'react';
import {
  List,
  Target,
} from 'lucide-react';
import Status from '@/components/Status';

const JiraInterface = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="text-sm text-gray-600 mb-2">Projects / My Scrum Project</div>
          <h1 className="text-2xl font-medium">Summary</h1>
        </div>

        {/* Status Cards */}
        <Status />

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Status overview</h2>
            <div className="text-gray-600 mb-4">
              The status overview for this project will display here after you{' '}
              <a href="#" className="text-blue-600 hover:underline">
                create some issues
              </a>
            </div>
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="text-4xl font-medium mb-4">0</div>
                <div className="text-gray-500">Total issues</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span>To Do: 0</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                <span>In Progress: 0</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                <span>Done: 0</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <List className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium">No activity yet</h3>
                </div>
                <p className="text-gray-600 max-w-sm">
                  Create a few issues and invite some teammates to your project to see your project activity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Priority breakdown</h2>
            <p className="text-gray-600 mb-4">
              Get a holistic view of how work is being prioritized.{' '}
              <a href="#" className="text-blue-600 hover:underline">
                How to manage priorities for projects
              </a>
            </p>
            <div className="h-48 flex items-center justify-center">
              <div className="text-gray-400">No data to display</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Types of work</h2>
            <p className="text-gray-600 mb-4">
              Create some issues to view a breakdown of total work by issue type.{' '}
              <a href="#" className="text-blue-600 hover:underline">
                What are issue types?
              </a>
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center mr-2">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <span className="flex-1">Epic</span>
                <div className="w-48 h-2 bg-gray-100 rounded"></div>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mr-2">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <span className="flex-1">Task</span>
                <div className="w-48 h-2 bg-gray-100 rounded"></div>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center mr-2">
                  <Target className="w-4 h-4 text-red-600" />
                </div>
                <span className="flex-1">Bug</span>
                <div className="w-48 h-2 bg-gray-100 rounded"></div>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center mr-2">
                  <Target className="w-4 h-4 text-green-600" />
                </div>
                <span className="flex-1">Story</span>
                <div className="w-48 h-2 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JiraInterface;