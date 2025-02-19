import StatusCard from "./StatusCard"
import { Calendar, Clock, Plus, CircleCheck } from "lucide-react";

const statusItems = [
  {
    icon: <CircleCheck className="w-4 h-4 text-gray-600" />,
    title: "0 completed",
    description: "in the last 7 days",
  },
  {
    icon: <Clock className="w-4 h-4 text-gray-600" />,
    title: "0 updated",
    description: "in the last 7 days",
  },
  {
    icon: <Plus className="w-4 h-4 text-gray-600" />,
    title: "0 created",
    description: "in the last 7 days",
  },
  {
    icon: <Calendar className="w-4 h-4 text-gray-600" />,
    title: "0 due soon",
    description: "in the last 7 days",
  },
];

const Status = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statusItems.map((item) => {
            return (
              <StatusCard key={item.title} item={item} />
            );
          })}
    </div>
  )
}

export default Status;