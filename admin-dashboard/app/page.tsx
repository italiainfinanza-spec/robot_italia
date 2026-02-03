'use client'

import { useState, useEffect, useCallback } from 'react'
import { KanbanBoard } from '@/components/KanbanBoard'
import { GanttChart } from '@/components/GanttChart'
import { AgentViewer } from '@/components/AgentViewer'
import { Header } from '@/components/Header'
import { loadTasks, saveTasks, getLastUpdated } from '@/lib/storage'
import type { Task } from '@/lib/tasks'

// Initial sample tasks for first-time users
const INITIAL_TASKS: Task[] = [
  {
    id: 'task-001',
    title: 'Setup Multi-Agent System',
    description: 'Implement the multi-agent structure with 6 agents',
    status: 'done',
    assignee: 'jarvis',
    priority: 'high',
    dueDate: '2026-02-02',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-02T00:00:00Z',
    tags: ['setup', 'architecture'],
  },
  {
    id: 'task-002',
    title: 'Create Content Tools for Loki',
    description: 'Develop templates and guidelines for consistent content creation',
    status: 'done',
    assignee: 'loki',
    priority: 'high',
    dueDate: '2026-02-03',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-02T00:00:00Z',
    tags: ['content', 'tools'],
  },
  {
    id: 'task-003',
    title: 'Research Robotics Market',
    description: 'Deep research on robotics market trends and investment opportunities',
    status: 'done',
    assignee: 'fury',
    priority: 'high',
    dueDate: '2026-02-04',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-03T00:00:00Z',
    tags: ['research', 'market'],
  },
  {
    id: 'task-006',
    title: 'Write First Premium Newsletter',
    description: 'Create the first Daily Premium newsletter using new templates',
    status: 'done',
    assignee: 'loki',
    priority: 'high',
    dueDate: '2026-02-03',
    createdAt: '2026-02-02T00:00:00Z',
    updatedAt: '2026-02-03T00:00:00Z',
    tags: ['content', 'newsletter'],
  },
  {
    id: 'task-007',
    title: 'SEO Optimization',
    description: 'Audit and optimize website for search engines',
    status: 'done',
    assignee: 'vision',
    priority: 'high',
    dueDate: '2026-02-03',
    createdAt: '2026-02-02T00:00:00Z',
    updatedAt: '2026-02-03T00:00:00Z',
    tags: ['seo', 'marketing'],
  },
  {
    id: 'task-010',
    title: 'Build Interactive Admin Dashboard',
    description: 'Create a modern, interactive dashboard for mission control',
    status: 'in_progress',
    assignee: 'marty',
    priority: 'high',
    dueDate: '2026-02-07',
    createdAt: '2026-02-03T00:00:00Z',
    updatedAt: '2026-02-03T00:00:00Z',
    tags: ['development', 'dashboard'],
  },
]

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'kanban' | 'timeline'>('kanban')

  // Load tasks on mount
  useEffect(() => {
    const stored = loadTasks()
    if (stored.length === 0) {
      // First time - use initial tasks
      setTasks(INITIAL_TASKS)
      saveTasks(INITIAL_TASKS)
    } else {
      setTasks(stored)
    }
    setLastUpdated(getLastUpdated())
    setIsLoading(false)
  }, [])

  // Handle task changes
  const handleTasksChange = useCallback((newTasks: Task[]) => {
    setTasks(newTasks)
    saveTasks(newTasks)
    setLastUpdated(new Date())
  }, [])

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      const stored = loadTasks()
      if (stored.length > 0) {
        setTasks(stored)
      }
      setLastUpdated(getLastUpdated())
      setIsRefreshing(false)
    }, 500)
  }, [])

  // Stats calculation
  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === 'done').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    highPriority: tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length,
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading Mission Control...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      <main className="p-4 sm:p-6 lg:p-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Total Tasks"
            value={stats.total}
            color="bg-blue-500"
          />
          <StatCard
            label="Completed"
            value={stats.done}
            color="bg-emerald-500"
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            color="bg-amber-500"
          />
          <StatCard
            label="High Priority"
            value={stats.highPriority}
            color="bg-red-500"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Left Sidebar - Agents */}
          <div className="lg:col-span-1">
            <AgentViewer />
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-3">
            {/* Custom Tabs */}
            <div className="mb-6">
              <div className="inline-flex rounded-lg border border-border bg-surface p-1">
                <button
                  onClick={() => setActiveTab('kanban')}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === 'kanban'
                      ? 'bg-primary text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Kanban Board
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === 'timeline'
                      ? 'bg-primary text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Timeline
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="rounded-xl border border-border bg-surface p-4">
              {activeTab === 'kanban' ? (
                <KanbanBoard tasks={tasks} onTasksChange={handleTasksChange} />
              ) : (
                <GanttChart tasks={tasks} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  label: string
  value: number
  color: string
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/50">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center`}>
          <span className="text-lg font-bold text-white">{value}</span>
        </div>
        <div>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  )
}
