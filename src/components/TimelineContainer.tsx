'use client';

import React from 'react';
import ScrollableTimeline from './ScrollableTimeline';

interface TimelineContainerProps {
  timeOption: string;
}

// Parent container component
const TimelineContainer: React.FC<TimelineContainerProps> = ({ timeOption }) => {
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