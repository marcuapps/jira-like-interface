
import React, { JSX } from "react";

interface StatusType {
  icon: JSX.Element;
  title: string;
  description: string;
}

interface StatusCardProps {
  item: StatusType;
}

const StatusCard: React.FC<StatusCardProps> = ({ item }) => {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200">
    <div className="flex flex-row items-center space-x-2">
      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
        {item.icon}
      </div>
      <div>
        <span className="font-semibold">{item.title}</span>
        <div className="text-sm text-gray-500">{item.description}</div>
      </div>
    </div>
  </div>
  )
}

export default StatusCard