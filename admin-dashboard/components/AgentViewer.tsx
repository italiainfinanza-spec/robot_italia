'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AGENTS, type Agent, type AgentStatus } from '@/lib/agents'
import { AgentModal } from './AgentModal'

const statusColors: Record<AgentStatus, string> = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  busy: 'bg-red-500',
}

const statusLabels: Record<AgentStatus, string> = {
  active: 'Active',
  idle: 'Idle',
  busy: 'Busy',
}

export function AgentViewer() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsModalOpen(true)
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-white">Active Agents</h2>
        </div>
        <span className="text-xs text-slate-500">Click to view SOUL</span>
      </div>

      <div className="divide-y divide-border">
        {AGENTS.map((agent) => (
          <button
            key={agent.id}
            onClick={() => handleAgentClick(agent)}
            className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-background/50"
          >
            {/* Avatar */}
            <div
              className={cn(
                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                agent.color
              )}
            >
              {agent.avatar}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{agent.name}</span>
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    statusColors[agent.status]
                  )}
                  title={statusLabels[agent.status]}
                />
              </div>
              <p className="truncate text-xs text-slate-400">{agent.role}</p>
              {agent.currentTask && (
                <p className="truncate text-xs text-slate-500">
                  {agent.currentTask}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      <AgentModal
        agent={selectedAgent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
