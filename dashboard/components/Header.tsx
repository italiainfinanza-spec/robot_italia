import { Rocket, Plus, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface HeaderProps {
  stats: {
    total: number;
    done: number;
    inProgress: number;
    highPriority: number;
  };
  onCreateTask: () => void;
}

export default function Header({ stats, onCreateTask }: HeaderProps) {
  const completionRate = stats.total > 0 
    ? Math.round((stats.done / stats.total) * 100) 
    : 0;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Mission Control</h1>
              <p className="text-xs text-slate-400">Robotica Weekly Squad</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-6">
            <StatItem 
              icon={<CheckCircle2 className="w-4 h-4" />}
              label="Done"
              value={`${completionRate}%`}
              color="text-green-400"
            />
            <StatItem 
              icon={<Clock className="w-4 h-4" />}
              label="In Progress"
              value={stats.inProgress}
              color="text-yellow-400"
            />
            <StatItem 
              icon={<AlertCircle className="w-4 h-4" />}
              label="High Priority"
              value={stats.highPriority}
              color="text-red-400"
            />
            <div className="h-8 w-px bg-slate-700 mx-2" />
            <StatItem 
              icon={<Users className="w-4 h-4" />}
              label="Active Agents"
              value={6}
              color="text-primary-400"
            />
          </div>

          {/* Create Task Button */}
          <button
            onClick={onCreateTask}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function StatItem({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`${color}`}>{icon}</span>
      <div className="text-right">
        <p className="text-sm font-semibold text-white">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}
