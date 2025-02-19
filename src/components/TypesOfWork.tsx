import { Plus, ExternalLink } from "lucide-react";

interface WorkItem {
  type: 'epic' | 'task' | 'bug' | 'story' | 'subtask';
  count: number;
  color: string;
}

const TypesOfWork = () => {
  const workTypes: WorkItem[] = [
    { type: 'epic', count: 0, color: 'bg-purple-100' },
    { type: 'task', count: 0, color: 'bg-blue-100' },
    { type: 'bug', count: 0, color: 'bg-red-100' },
    { type: 'story', count: 0, color: 'bg-green-100' },
    { type: 'subtask', count: 0, color: 'bg-gray-100' },
  ];

  const getIconColor = (type: string) => {
    const colors = {
      epic: 'text-purple-600',
      task: 'text-blue-600',
      bug: 'text-red-600',
      story: 'text-green-600',
      subtask: 'text-gray-600',
    };
    return colors[type as keyof typeof colors];
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold">Types of work</h2>
      <p className="text-gray-600 mb-4">
        Create some issues to view a breakdown of total work by issue type.{' '}
        <a href="#" className="text-blue-600 hover:underline">
          What are issue types?
        </a>
      </p>
      <div className="space-y-4">
        <div className="flex flex-row">
          <span className="text-sm text-gray-500 font-semibold w-[35%]">Type</span>
          <span className="text-sm text-gray-500 font-semibold w-[65%]">Distribution</span>
        </div>
        {workTypes.map((item) => (
          <div key={item.type} className="flex items-center flex-col md:flex-row">
            <div className="w-full md:w-[35%] flex flex-row mb-4 md:mb-0">
              <div className={`w-6 h-6 ${item.color} rounded flex items-center justify-center mr-2`}>
                <Plus className={`w-4 h-4 ${getIconColor(item.type)}`} />
              </div>
              <div className="flex flex-row gap-2 items-center">
                <span className="capitalize font-medium">{item.type}</span>
                <ExternalLink className="w-4 h-4 text-black-200" />
              </div>
            </div>
            <div className="flex w-full md:w-[65%] items-center space-x-2">
              <div className="w-full h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypesOfWork;