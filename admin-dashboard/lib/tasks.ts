export type TaskStatus = 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  assignee?: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

export const STATUS_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'inbox', title: 'Inbox', color: 'bg-status-inbox' },
  { id: 'assigned', title: 'Assigned', color: 'bg-status-assigned' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-status-inProgress' },
  { id: 'review', title: 'Review', color: 'bg-status-review' },
  { id: 'done', title: 'Done', color: 'bg-status-done' },
]

export function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function createTask(
  title: string,
  status: TaskStatus = 'inbox',
  options: Partial<Omit<Task, 'id' | 'title' | 'status' | 'createdAt' | 'updatedAt'>> = {}
): Task {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    title,
    description: options.description || '',
    status,
    assignee: options.assignee,
    priority: options.priority || 'medium',
    dueDate: options.dueDate,
    createdAt: now,
    updatedAt: now,
    tags: options.tags || [],
  }
}
