'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/lib/tasks'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  id: TaskStatus
  title: string
  color: string
  tasks: Task[]
  onAddTask: (status: TaskStatus) => void
  onUpdateTask: (task: Task) => void
  onDeleteTask: (id: string) => void
}

export function KanbanColumn({
  id,
  title,
  color,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full min-w-[280px] flex-col rounded-xl border border-border bg-background/50 backdrop-blur-sm',
        'transition-all duration-200',
        isOver && 'border-primary bg-primary/5'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', color)} />
          <h2 className="font-semibold text-white">{title}</h2>
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-slate-400">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(id)}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-surface hover:text-white"
          aria-label={`Add task to ${title}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-700 text-sm text-slate-500">
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}
