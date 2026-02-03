export type AgentStatus = 'active' | 'idle' | 'busy'

export interface Agent {
  id: string
  name: string
  role: string
  status: AgentStatus
  currentTask?: string
  avatar: string
  color: string
  soulPath: string
}

export const AGENTS: Agent[] = [
  {
    id: 'jarvis',
    name: 'Jarvis',
    role: 'Squad Lead',
    status: 'active',
    currentTask: 'Managing team workflow',
    avatar: 'J',
    color: 'bg-agent-jarvis',
    soulPath: '/agents/jarvis/SOUL.md',
  },
  {
    id: 'shuri',
    name: 'Shuri',
    role: 'Product Analyst',
    status: 'idle',
    avatar: 'S',
    color: 'bg-agent-shuri',
    soulPath: '/agents/shuri/SOUL.md',
  },
  {
    id: 'fury',
    name: 'Fury',
    role: 'Researcher',
    status: 'busy',
    currentTask: 'Analyzing market data',
    avatar: 'F',
    color: 'bg-agent-fury',
    soulPath: '/agents/fury/SOUL.md',
  },
  {
    id: 'loki',
    name: 'Loki',
    role: 'Content Writer',
    status: 'active',
    currentTask: 'Writing newsletter',
    avatar: 'L',
    color: 'bg-agent-loki',
    soulPath: '/agents/loki/SOUL.md',
  },
  {
    id: 'vision',
    name: 'Vision',
    role: 'SEO/Marketing',
    status: 'idle',
    avatar: 'V',
    color: 'bg-agent-vision',
    soulPath: '/agents/vision/SOUL.md',
  },
  {
    id: 'marty',
    name: 'Marty',
    role: 'Coding Best Practices',
    status: 'busy',
    currentTask: 'Building admin dashboard',
    avatar: 'M',
    color: 'bg-agent-marty',
    soulPath: '/agents/marty/SOUL.md',
  },
]

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find(agent => agent.id === id)
}

export function getAgentColor(agentId: string): string {
  const agent = getAgentById(agentId)
  return agent?.color || 'bg-gray-500'
}
