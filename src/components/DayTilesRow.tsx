import { useState } from "react";
import { DayTile } from "@/lib/types";

interface DayTilesRowProps {
  startDate: Date;
  endDate: Date;
}

const generateDayTiles = (startDate: Date, endDate: Date) => {
  const tiles: DayTile[] = [];
  const currentDate = new Date();
  
  // Clone the start date to avoid modifying the original
  const current = new Date(startDate);
  
  // Generate tiles until we reach end date
  while (current <= endDate) {
    tiles.push({
      date: new Date(current),
      dayNumber: current.getDate(),
      isToday: 
        current.getDate() === currentDate.getDate() &&
        current.getMonth() === currentDate.getMonth() &&
        current.getFullYear() === currentDate.getFullYear(),
      isSelected: false, // You can add logic for selection
      isWeekend: current.getDay() === 0 || current.getDay() === 6
    });
    
    // Move to next day
    current.setDate(current.getDate() + 1);
  }
  
  return tiles;
};

// Component to render the tiles
const DayTilesRow: React.FC<DayTilesRowProps> = ({ startDate, endDate }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const tiles = generateDayTiles(startDate, endDate);

  return (
    <div className="flex border-b border-gray-200">
      {tiles.map((tile, index) => (
        <div
          key={tile.date.toISOString()}
          className={`
            flex-1 h-8 flex items-center justify-center text-sm
            ${tile.isToday ? 'text-blue-600' : 'text-gray-700'}
            ${tile.isSelected ? 'bg-blue-50' : ''}
            ${tile.isWeekend ? 'text-gray-400' : ''}
            ${index !== tiles.length - 1 ? 'border-r border-gray-200' : ''}
            cursor-pointer hover:bg-gray-50
          `}
          onClick={() => setSelectedDate(tile.date)}
        >
          <span className={`
            ${tile.isToday ? 'font-medium' : ''}
            ${tile.isSelected ? 'font-medium' : ''}
          `}>
            {tile.dayNumber}
          </span>
        </div>
      ))}
    </div>
  );
};

export default DayTilesRow;