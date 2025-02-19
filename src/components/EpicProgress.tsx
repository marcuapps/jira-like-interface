import { Plus } from "lucide-react";

const EpicProgress = () => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 h-80 flex justify-center items-center">
      <div className="flex flex-col items-center justify-center h-48">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded"></div>
          <div className="w-12 h-12 bg-gray-100 rounded"></div>
          <div className="w-12 h-12 bg-gray-100 rounded"></div>
          <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-lg font-semibold">Epic progress</h2>
        <p className="text-center text-gray-600">
          Use epics to track larger initiatives in your project.{' '}
          <a href="#" className="text-blue-600 hover:underline">
            What is an epic?
          </a>
        </p>
      </div>
    </div>
  );
};

export default EpicProgress;