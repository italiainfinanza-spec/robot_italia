'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Edit2, Calendar, Tag, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/lib/tasks'
import { getAgentById } from '@/lib/agents'

interface TaskCardProps {
  task: Task
  onUpdate: (task: Task) => void
  onDelete: (id: string) => void
}

const priorityColors = {
  low: 'bg-slate-600',
  medium: 'bg-yellow-600',
  high: 'bg-red-600',
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || '')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate({
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim(),
        updatedAt: new Date().toISOString(),
      })
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setEditTitle(task.title)
      setEditDescription(task.description || '')
      setIsEditing(false)
    }
  }

  const assignee = task.assignee ? getAgentById(task.assignee) : null

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-lg border border-primary/50 bg-surface p-3 shadow-lg"
      >
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          autoFocus
          className="w-full rounded border border-border bg-background px-2 py-1 text-sm text-white placeholder-slate-500 focus:border-primary focus:outline-none"
          placeholder="Task title..."
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          rows={2}
          className="mt-2 w-full resize-none rounded border border-border bg-background px-2 py-1 text-xs text-slate-300 placeholder-slate-500 focus:border-primary focus:outline-none"
          placeholder="Description (optional)..."
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">Press Enter to save, Esc to cancel</span>
          <button
            onClick={handleSave}
            className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-primary-hover"
          >
            Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border border-border bg-surface p-3 transition-all',
        'hover:border-primary/50 hover:shadow-md',
        isDragging && 'opacity-50 rotate-2 scale-105 shadow-xl'
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab text-slate-600 opacity-0 transition-opacity hover:text-slate-400 active:cursor-grabbing group-hover:opacity-100"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="pl-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="flex-1 cursor-pointer text-sm font-medium text-white hover:text-primary"
            onClick={() => setIsEditing(true)}
          >
            {task.title}
          </h3>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded p-1 text-slate-400 hover:bg-surface hover:text-white"
              aria-label="Edit task"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="rounded p-1 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
              aria-label="Delete task"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="mt-1 text-xs text-slate-400 line-clamp-2">{task.description}</p>
        )}

        {/* Footer */}
        <div className="mt-2 flex items-center gap-2">
          {/* Priority */}
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              priorityColors[task.priority]
            )}
            title={`Priority: ${task.priority}`}
          />

          {/* Assignee */}
          {assignee && (
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white',
                assignee.color
              )}
              title={`Assigned to: ${assignee.name}`}
            >
              {assignee.avatar}
            </div>
          )}

          {/* Due date */}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3 text-slate-500" />
              <span className="text-xs text-slate-500">{task.tags.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
