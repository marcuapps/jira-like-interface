import {
  BarChart2,
  Clock,
  Code,
  FileText,
  Layout,
  List,
  Settings,
  Target,
  Plus,
  Archive
} from 'lucide-react';
import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded"></div>
                <div>
                  <h2 className="font-medium">My Scrum Project</h2>
                  <p className="text-sm text-gray-500">Software project</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-6">
                <h3 className="text-xs font-medium text-gray-500 mb-2">PLANNING</h3>
                <ul className="space-y-2">
                  <li>
                    <Link className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-2 rounded" href={"/summary"}>
                      <Layout className="w-4 h-4" />
                      <span>Summary</span>
                    </Link>
                  </li>
                  <li >
                    <Link className="flex items-center space-x-2 text-gray-700 p-2 hover:bg-gray-100" href={"/timeline"}>
                      <Clock className="w-4 h-4" />
                      <span>Timeline</span>
                    </Link>
                  </li>
                  <li className="flex items-center space-x-2 text-gray-700 p-2">
                    <List className="w-4 h-4" />
                    <span>Backlog</span>
                  </li>
                  <li className="flex items-center space-x-2 text-gray-700 p-2">
                    <BarChart2 className="w-4 h-4" />
                    <span>Board</span>
                  </li>
                  <li className="flex items-center space-x-2 text-gray-700 p-2">
                    <FileText className="w-4 h-4" />
                    <span>Forms</span>
                  </li>
                  <li className="flex items-center space-x-2 text-gray-700 p-2">
                    <Target className="w-4 h-4" />
                    <span>Goals</span>
                  </li>
                  <li className="flex items-center space-x-2 text-gray-700 p-2">
                    <Plus className="w-4 h-4" />
                    <span>Add view</span>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-medium text-gray-500 mb-2">DEVELOPMENT</h3>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2 text-gray-700 p-2">
                    <Code className="w-4 h-4" />
                    <span>Code</span>
                  </li>
                  <li className="flex items-center space-x-2 text-gray-700 p-2">
                    <FileText className="w-4 h-4" />
                    <span>Project pages</span>
                  </li>
                  <li className="flex items-center space-x-2 text-gray-700 p-2">
                    <Settings className="w-4 h-4" />
                    <span>Project settings</span>
                  </li>
                  <li className="flex items-center space-x-2 text-gray-700 p-2">
                    <Archive className="w-4 h-4" />
                    <span>Archived issues</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">NEW</span>
                  </li>
                </ul>
              </div>
            </div>
      </div>
  )
}

export default Sidebar;