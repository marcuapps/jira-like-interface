import { List } from "lucide-react"

const StatusOverview = () => {
  return (
    <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold">Status overview</h2>
            <div className="text-gray-600 mb-4">
              The status overview for this project will display here after you{' '}
              <a href="#" className="text-blue-600 hover:underline">
                create some issues
              </a>
            </div>
            <div className="flex flex-col md:flex-row py-10">
            <div className="flex justify-center items-center py-8 md:w-[75%]">
              <div className="text-center">
                <div className="text-4xl font-medium mb-1">0</div>
                <div className="text-gray-500">Total issues</div>
              </div>
            </div>
            <div className="space-y-2 md:w-[25%] flex flex-col justify-center">
              <div className="flex items-center text-sm py-1">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span>To Do: 0</span>
              </div>
              <div className="flex items-center text-sm py-1">
                <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                <span>In Progress: 0</span>
              </div>
              <div className="flex items-center text-sm py-1">
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                <span>Done: 0</span>
              </div>
            </div>
          </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <List className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">No activity yet</h3>
                <p className="text-gray-600 max-w-sm">
                  Create a few issues and invite some teammates to your project to see your project activity.
                </p>
              </div>
            </div>
          </div>
        </div>
     </div>
  )
}

export default StatusOverview;