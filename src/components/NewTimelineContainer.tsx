'use client';

import React, { useState } from 'react';
import NewScrollableTimeline from '@/components/NewScrollableTimeline';
import { Sprint, Epic } from '@/lib/types';

const NewTimelineContainer: React.FC = () => {
  // Sample data 
  const today = new Date();

  const [sprints, setSprints] = useState<Sprint[]>([
    // Generate multiple sprints spanning past and future
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
          color: '#10b981'
        },
        {
          id: 'epic-3',
          name: 'Current Feature 2',
          startDate: new Date(today.getFullYear(), today.getMonth(), 15),
          endDate: new Date(today.getFullYear(), today.getMonth() + 2, 15),
          color: '#10b981'
        },
      ]
    },
  ]);

  // const [sprints, setSprints] = useState<Sprint[]>([
  //   // Generate multiple sprints spanning past and future
  //   {
  //     id: 'sprint-past-3',
  //     name: 'Past Sprint 3',
  //     startDate: new Date(today.getFullYear(), today.getMonth() - 6, 1),
  //     endDate: new Date(today.getFullYear(), today.getMonth() - 5, 14),
  //     epics: [
  //       {
  //         id: 'epic-1',
  //         name: 'Foundation Setup',
  //         startDate: new Date(today.getFullYear(), today.getMonth() - 6, 1),
  //         endDate: new Date(today.getFullYear(), today.getMonth() - 4, 15),
  //         color: '#4f46e5'
  //       }
  //     ]
  //   },
  //   {
  //     id: 'sprint-past-2',
  //     name: 'Past Sprint 2',
  //     startDate: new Date(today.getFullYear(), today.getMonth() - 4, 1),
  //     endDate: new Date(today.getFullYear(), today.getMonth() - 3, 14),
  //     epics: []
  //   },
  //   {
  //     id: 'sprint-past-1',
  //     name: 'Past Sprint 1',
  //     startDate: new Date(today.getFullYear(), today.getMonth() - 2, 1),
  //     endDate: new Date(today.getFullYear(), today.getMonth() - 1, 14),
  //     epics: []
  //   },
  //   {
  //     id: 'sprint-current',
  //     name: 'Current Sprint',
  //     startDate: new Date(today.getFullYear(), today.getMonth(), 1),
  //     endDate: new Date(today.getFullYear(), today.getMonth(), 14),
  //     epics: [
  //       {
  //         id: 'epic-2',
  //         name: 'Current Feature',
  //         startDate: new Date(today.getFullYear(), today.getMonth() - 1, 15),
  //         endDate: new Date(today.getFullYear(), today.getMonth() + 1, 15),
  //         color: '#10b981'
  //       }
  //     ]
  //   },
  //   {
  //     id: 'sprint-next-1',
  //     name: 'Next Sprint 1',
  //     startDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
  //     endDate: new Date(today.getFullYear(), today.getMonth() + 1, 14),
  //     epics: []
  //   },
  //   {
  //     id: 'sprint-next-2',
  //     name: 'Next Sprint 2',
  //     startDate: new Date(today.getFullYear(), today.getMonth() + 2, 1),
  //     endDate: new Date(today.getFullYear(), today.getMonth() + 2, 14),
  //     epics: [
  //       {
  //         id: 'epic-3',
  //         name: 'Future Feature',
  //         startDate: new Date(today.getFullYear(), today.getMonth() + 2, 1),
  //         endDate: new Date(today.getFullYear(), today.getMonth() + 4, 15),
  //         color: '#f59e0b'
  //       }
  //     ]
  //   },
  //   {
  //     id: 'sprint-next-3',
  //     name: 'Next Sprint 3',
  //     startDate: new Date(today.getFullYear(), today.getMonth() + 3, 1),
  //     endDate: new Date(today.getFullYear(), today.getMonth() + 3, 14),
  //     epics: []
  //   },
  //   {
  //     id: 'sprint-next-4',
  //     name: 'Next Sprint 4',
  //     startDate: new Date(today.getFullYear(), today.getMonth() + 4, 1),
  //     endDate: new Date(today.getFullYear(), today.getMonth() + 4, 14),
  //     epics: []
  //   }
  // ]);

  // Create a new epic
  const handleCreateEpic = (sprintId: string) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return;
    
    // Create epic with default 2 week duration
    const newEpic: Epic = {
      id: `epic-${Date.now()}`,
      name: `New Epic ${Math.floor(Math.random() * 1000)}`,
      startDate: new Date(sprint.startDate),
      endDate: new Date(sprint.startDate.getTime() + 14 * 24 * 60 * 60 * 1000),
      color: getRandomColor()
    };
    
    setSprints(
      sprints.map(s => 
        s.id === sprintId 
          ? { ...s, epics: [...(s.epics || []), newEpic] }
          : s
      )
    );
  };

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
  

  // Create new sprint
  const handleCreateNewEpic = (sprintId: string, name: string) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return;
    
    // Create sprint with default 2 week duration
    const newEpic: Epic = {
      id: `epic-${Date.now()}`,
      name: name,
      startDate: new Date(today.getFullYear(), today.getMonth() - 2, 1),
      endDate: new Date(today.getFullYear(), today.getMonth() + 1, 12),
      color: getRandomColor()
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
          <NewScrollableTimeline
            sprints={sprints}
            onCreateEpic={handleCreateEpic}
            onUpdateEpic={handleUpdateEpic}
            onDeleteEpic={handleDeleteEpic}
            onCreateNewEpic={handleCreateNewEpic}
          />
        </div>
      </div>
    </div>
  );
};

export default NewTimelineContainer;