'use client';

import React, { useState } from 'react';
import ScrollableTimeline from './ScrollableTimeline';
import { Sprint, Epic } from '@/lib/types';

const TimelineContainer: React.FC = () => {
  // Sample data 
  const today = new Date();

  const [sprints, setSprints] = useState<Sprint[]>([
    {
      id: 'sprint-current',
      name: 'Current Sprint',
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: new Date(today.getFullYear(), today.getMonth(), 14),
      epics: [
        {
          id: 'epic-2',
          name: 'Current Feature',
          startDate: new Date(today.getFullYear(), today.getMonth() - 1, 15),
          endDate: new Date(today.getFullYear(), today.getMonth() + 1, 15),
          color: '#10b981',
          isPlaced: true,
        },
        {
          id: 'epic-3',
          name: 'Current Feature 2',
          startDate: new Date(today.getFullYear(), today.getMonth(), 15),
          endDate: new Date(today.getFullYear(), today.getMonth() + 2, 15),
          color: '#10b981',
          isPlaced: true,
        },
      ]
    },
  ]);

  // Update an epic
  const handleUpdateEpic = (epicId: string, updates: Partial<Epic>) => {
    setSprints(
      sprints.map(sprint => {
        const epicIndex = sprint.epics?.findIndex(e => e.id === epicId) ?? -1;
        
        if (epicIndex === -1 || !sprint.epics) return sprint;
        
        const updatedEpics = [...sprint.epics];
        updatedEpics[epicIndex] = { ...updatedEpics[epicIndex], ...updates };
        
        return { ...sprint, epics: updatedEpics };
      })
    );
  };

  // Delete an epic
  const handleDeleteEpic = (epicId: string) => {
    setSprints(
      sprints.map(sprint => ({
        ...sprint,
        epics: sprint.epics?.filter(epic => epic.id !== epicId) || []
      }))
    );
  };
  

  // Create new epic
  const handleCreateEpic = (sprintId: string, name: string) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return;
    
    const newEpic: Epic = {
      id: `epic-${Date.now()}`,
      name: name,
      // startDate: new Date(today.getFullYear(), today.getMonth() - 2, 1),
      // endDate: new Date(today.getFullYear(), today.getMonth() + 1, 12),
      color: getRandomColor(),
      isPlaced: false,
    };
    
    setSprints(
      sprints.map(s => 
        s.id === sprintId 
          ? { ...s, epics: [...(s.epics || []), newEpic] }
          : s
      )
    );
  };

  // Helper function to generate random colors
  function getRandomColor(): string {
    const colors = [
      '#4f46e5', // indigo
      '#10b981', // emerald
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#f59e0b', // amber
      '#ef4444', // red
      '#06b6d4', // cyan
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }

  return (
    <div className="relative">
      <div className="absolute left-0 right-0 overflow-x-hidden overflow-y-hidden">
        {/* Timeline */}
        <div className="flex-1 overflow-hidden border h-[500px]">
          <ScrollableTimeline
            sprints={sprints}
            onCreateEpic={handleCreateEpic}
            onUpdateEpic={handleUpdateEpic}
            onDeleteEpic={handleDeleteEpic}
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineContainer;