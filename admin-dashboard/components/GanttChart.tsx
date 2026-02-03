'use client'

import { useMemo, useState } from 'react'
import { format, addDays, startOfWeek, differenceInDays, isSameDay } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/tasks'

interface GanttChartProps {
  tasks: Task[]
}

const DAYS_TO_SHOW = 14

export function GanttChart({ tasks }: GanttChartProps) {
  const [startDate, setStartDate] = useState(() => startOfWeek(new Date()))

  const days = useMemo(() => {
    return Array.from({ length: DAYS_TO_SHOW }, (_, i) => addDays(startDate, i))
  }, [startDate])

  const ganttTasks = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate)
      .map((task) => {
        const dueDate = new Date(task.dueDate!)
        const startOffset = Math.max(0, differenceInDays(dueDate, startDate))
        const duration = 2 // Default duration of 2 days for visual purposes

        return {
          ...task,
          startOffset,
          duration,
        }
      })
      .filter((task) => task.startOffset < DAYS_TO_SHOW)
  }, [tasks, startDate])

  const today = new Date()
  const todayIndex = differenceInDays(today, startDate)

  const navigateWeek = (direction: 'prev' | 'next') => {
    setStartDate((prev) => addDays(prev, direction === 'prev' ? -7 : 7))
  }

  const statusColors = {
    inbox: 'bg-slate-600',
    assigned: 'bg-blue-600',
    in_progress: 'bg-amber-600',
    review: 'bg-purple-600',
    done: 'bg-emerald-600',
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-white">Timeline</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="rounded p-1 text-slate-400 hover:bg-surface hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[140px] text-center text-sm text-slate-300">
            {format(startDate, 'MMM d')} - {format(addDays(startDate, DAYS_TO_SHOW - 1), 'MMM d')}
          </span>
          <button
            onClick={() => navigateWeek('next')}
            className="rounded p-1 text-slate-400 hover:bg-surface hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header row */}
          <div className="flex border-b border-border">
            <div className="w-48 flex-shrink-0 border-r border-border p-2 text-xs font-medium text-slate-400">
              Task
            </div>
            <div className="flex flex-1">
              {days.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 border-r border-border p-2 text-center text-xs',
                    isSameDay(day, today) && 'bg-primary/10'
                  )}
                >
                  <div className={cn(
                    'font-medium',
                    isSameDay(day, today) ? 'text-primary' : 'text-slate-400'
                  )}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={cn(
                    isSameDay(day, today) ? 'text-white' : 'text-slate-500'
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today marker line */}
          {todayIndex >= 0 && todayIndex < DAYS_TO_SHOW && (
            <div
              className="pointer-events-none absolute z-10 h-full w-px bg-primary"
              style={{
                left: `calc(12rem + ((100% - 12rem) / ${DAYS_TO_SHOW}) * ${todayIndex})`,
              }}
            >
              <div className="absolute -top-1 -translate-x-1/2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                TODAY
              </div>
            </div>
          )}

          {/* Task rows */}
          <div className="relative">
            {ganttTasks.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-slate-500">
                No tasks with due dates
              </div>
            ) : (
              ganttTasks.map((task) => (
                <div key={task.id} className="flex border-b border-border">
                  <div className="w-48 flex-shrink-0 border-r border-border p-2">
                    <div className="truncate text-sm text-white" title={task.title}>
                      {task.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      Due: {format(new Date(task.dueDate!), 'MMM d')}
                    </div>
                  </div>
                  <div className="relative flex flex-1">
                    {days.map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 border-r border-border"
                      />
                    ))}
                    {/* Task bar */}
                    <div
                      className={cn(
                        'absolute top-1/2 h-6 -translate-y-1/2 rounded-md px-2 text-xs font-medium text-white',
                        statusColors[task.status]
                      )}
                      style={{
                        left: `${(task.startOffset / DAYS_TO_SHOW) * 100}%`,
                        width: `${(task.duration / DAYS_TO_SHOW) * 100}%`,
                        minWidth: '40px',
                      }}
                    >
                      <span className="truncate block">{task.title}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
