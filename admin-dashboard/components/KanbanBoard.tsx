'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/lib/tasks'
import { STATUS_COLUMNS, createTask } from '@/lib/tasks'
import { saveTasks } from '@/lib/storage'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'

interface KanbanBoardProps {
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
}

export function KanbanBoard({ tasks, onTasksChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isAddingTask, setIsAddingTask] = useState<TaskStatus | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (!over) return

      const activeTask = tasks.find((t) => t.id === active.id)
      if (!activeTask) return

      const overId = over.id as string

      // Check if dropped over a column
      const isOverColumn = STATUS_COLUMNS.some((col) => col.id === overId)

      if (isOverColumn && activeTask.status !== overId) {
        // Dropped on a different column
        const updatedTasks = tasks.map((t) =>
          t.id === activeTask.id
            ? { ...t, status: overId as TaskStatus, updatedAt: new Date().toISOString() }
            : t
        )
        onTasksChange(updatedTasks)
        saveTasks(updatedTasks)
      } else if (!isOverColumn && active.id !== over.id) {
        // Dropped over another task - reorder within column
        const oldIndex = tasks.findIndex((t) => t.id === active.id)
        const newIndex = tasks.findIndex((t) => t.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedTasks = arrayMove(tasks, oldIndex, newIndex)
          onTasksChange(reorderedTasks)
          saveTasks(reorderedTasks)
        }
      }
    },
    [tasks, onTasksChange]
  )

  const handleAddTask = useCallback(
    (status: TaskStatus) => {
      setIsAddingTask(status)
      setNewTaskTitle('')
    },
    []
  )

  const handleSaveNewTask = useCallback(() => {
    if (!newTaskTitle.trim() || !isAddingTask) return

    const newTask = createTask(newTaskTitle.trim(), isAddingTask)
    const updatedTasks = [...tasks, newTask]
    onTasksChange(updatedTasks)
    saveTasks(updatedTasks)
    setIsAddingTask(null)
    setNewTaskTitle('')
  }, [newTaskTitle, isAddingTask, tasks, onTasksChange])

  const handleUpdateTask = useCallback(
    (updatedTask: Task) => {
      const updatedTasks = tasks.map((t) =>
        t.id === updatedTask.id ? updatedTask : t
      )
      onTasksChange(updatedTasks)
      saveTasks(updatedTasks)
    },
    [tasks, onTasksChange]
  )

  const handleDeleteTask = useCallback(
    (id: string) => {
      const updatedTasks = tasks.filter((t) => t.id !== id)
      onTasksChange(updatedTasks)
      saveTasks(updatedTasks)
    },
    [tasks, onTasksChange]
  )

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  return (
    <div className="flex h-full flex-col">
      {/* Add task input */}
      {isAddingTask && (
        <div className="mb-4 rounded-lg border border-primary/50 bg-surface p-4">
          <h3 className="mb-2 text-sm font-medium text-white">
            Add task to {STATUS_COLUMNS.find((c) => c.id === isAddingTask)?.title}
          </h3>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNewTask()
              if (e.key === 'Escape') {
                setIsAddingTask(null)
                setNewTaskTitle('')
              }
            }}
            placeholder="Enter task title..."
            autoFocus
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary focus:outline-none"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleSaveNewTask}
              disabled={!newTaskTitle.trim()}
              className="rounded bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-hover disabled:opacity-50"
            >
              Add Task
            </button>
            <button
              onClick={() => {
                setIsAddingTask(null)
                setNewTaskTitle('')
              }}
              className="rounded border border-border bg-surface px-3 py-1.5 text-sm text-slate-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kanban columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={tasks.filter((t) => t.status === column.id)}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onUpdate={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
