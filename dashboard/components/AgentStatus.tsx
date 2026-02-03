import { Agent } from '@/types';
import { Bot, MoreHorizontal } from 'lucide-react';

interface AgentStatusProps {
  agents: Agent[];
}

const statusColors = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  working: 'bg-primary-500 animate-pulse',
  offline: 'bg-slate-500',
};

export default function AgentStatus({ agents }: AgentStatusProps) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary-400" />
          Squad Status
        </h2>
        <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <MoreHorizontal className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </section>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div 
      className="group relative bg-slate-800/50 hover:bg-slate-800 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all duration-200"
      style={{ '--agent-color': agent.color } as React.CSSProperties}
    >
      {/* Status Indicator */}
      <div className="absolute top-3 right-3">
        <span 
          className={`w-2.5 h-2.5 rounded-full ${statusColors[agent.status]} status-dot`}
          title={`Status: ${agent.status}`}
        />
      </div>

      {/* Avatar */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
        style={{ backgroundColor: `${agent.color}20` }}
      >
        {agent.emoji}
      </div>

      {/* Info */}
      <h3 className="font-semibold text-white text-sm truncate">{agent.name}</h3>
      <p className="text-xs text-slate-400 truncate">{agent.role}</p>
      
      {/* Status Text */}
      <p className="text-xs text-slate-500 mt-2 truncate group-hover:text-slate-400 transition-colors">
        {agent.statusText}
      </p>

      {/* Hover Glow Effect */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 50% 0%, ${agent.color}10, transparent 70%)`,
        }}
      />
    </div>
  );
}
