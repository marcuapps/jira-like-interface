import React from 'react';
import Status from '@/components/Status';
import StatusOverview from '@/components/StatusOverview';
import PriorityBreakdown from '@/components/PriorityBreakdown';
import TypesOfWork from '@/components/TypesOfWork';

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
        <StatusOverview />

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PriorityBreakdown />
          <TypesOfWork />
        </div>
      </div>
    </div>
  );
};

export default JiraInterface;