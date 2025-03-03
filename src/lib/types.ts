// export interface TimelinePeriod {
//   label: string;
//   startDate: Date;
//   endDate: Date;
// }

// export interface DayTile {
//   date: Date;
//   dayNumber: number;
//   isToday: boolean;
//   isSelected: boolean;
//   isWeekend: boolean;
// }

// export interface Epic {
//   id: string;
//   title: string;
//   startDate: Date;
//   endDate: Date;
//   status: 'todo' | 'in_progress' | 'done';
// }

export type TimeUnit = 'Weeks' | 'Months' | 'Quarters';

export interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  epics?: Epic[];
}

export interface Epic {
  id: string;
  name: string;
  startDate?: Date;
  endDate?: Date;
  color?: string;
}

export interface DayTile {
  date: Date;
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
}