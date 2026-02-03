// types/index.ts

export type TaskStatus = 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export type AgentStatus = 'active' | 'idle' | 'working' | 'offline';

export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: AgentStatus;
  statusText: string;
  color: string;
}

export interface Activity {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  action: string;
  target?: string;
  timestamp: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  color: string;
}
