import { ExternalLink } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  workload: number;
}

const TeamWorkload = () => {
  const team: TeamMember[] = [
    { id: 'unassigned', name: 'Unassigned', workload: 0 },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold">Team workload</h2>
      <p className="text-gray-600 mb-4">
        To monitor the capacity of your team,{' '}
        <a href="#" className="text-blue-600 hover:underline">
          create some issues
        </a>
      </p>
      <div className="mt-4">
        <div className="flex flex-row text-sm text-gray-600 font-semibold mb-2">
          <span className="text-sm text-gray-500 font-semibold w-[35%]">Assignee</span>
          <span className="text-sm text-gray-500 font-semibold w-[65%]">Work distribution</span>
        </div>
        {team.map((member) => (
          <div key={member.id} className="flex items-center flex-col md:flex-row">
            <div className="w-full md:w-[35%] flex flex-row mb-4 md:mb-0">
              <div className="flex flex-row gap-2 items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <span className="capitalize font-medium">{member.name}</span>
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

export default TeamWorkload;