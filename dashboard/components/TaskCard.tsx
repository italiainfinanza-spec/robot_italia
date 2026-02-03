'use client';

import { Task, Agent, TaskPriority } from '@/types';
import { 
  Calendar, 
  Trash2, 
  GripVertical,
  AlertCircle,
  ArrowUpCircle,
  MinusCircle
} from 'lucide-react';
import { memo } from 'react';

interface TaskCardProps {
  task: Task;
  agent?: Agent;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDelete: () => void;
}

const priorityConfig: Record<TaskPriority, { color: string; icon: React.ReactNode; label: string }> = {
  high: {
    color: 'text-red-400 bg-red-400/10 border-red-400/20',
    icon: <AlertCircle className="w-3 h-3" />,
    label: 'High',
  },
  medium: {
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    icon: <ArrowUpCircle className="w-3 h-3" />,
    label: 'Medium',
  },
  low: {
    color: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    icon: <MinusCircle className="w-3 h-3" />,
    label: 'Low',
  },
};

function TaskCardComponent({
  task,
  agent,
  isDragging,
  onDragStart,
  onDragEnd,
  onDelete,
}: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'done';

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`
        task-card group relative bg-slate-800 hover:bg-slate-750 
        rounded-lg p-3 border border-slate-700/50 hover:border-slate-600
        cursor-grab active:cursor-grabbing select-none
        ${isDragging ? 'dragging' : ''}
      `}
      aria-grabbed={isDragging}
      role="listitem"
    >
      {/* Drag Handle */}
      <div 
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
        aria-hidden="true"
      >
        <GripVertical className="w-4 h-4 text-slate-500" />
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 
                   hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
        aria-label={`Delete task: ${task.title}`}
        title="Delete task"
      >
        <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
      </button>

      {/* Priority Badge */}
      <div className="flex items-center gap-1.5 mb-2">
        <span 
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${priority.color}`}
        >
          {priority.icon}
          {priority.label}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-white mb-1 pr-6 line-clamp-2">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-400 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/50">
        {/* Agent */}
        {agent && (
          <div className="flex items-center gap-1.5">
            <span 
              className="w-5 h-5 rounded-md flex items-center justify-center text-xs"
              style={{ backgroundColor: `${agent.color}30` }}
              title={agent.name}
            >
              {agent.emoji}
            </span>
            <span className="text-xs text-slate-400 truncate max-w-[80px]">
              {agent.name}
            </span>
          </div>
        )}

        {/* Due Date */}
        {dueDate && (
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
            <Calendar className="w-3 h-3" />
            <span>{formatDate(dueDate)}</span>
          </div>
        )}
      </div>
    </article>
  );
}

// Format date to relative or short date
function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays < 7) return `in ${diffDays}d`;
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Memoize to prevent unnecessary re-renders during drag operations
export default memo(TaskCardComponent, (prev, next) => {
  return (
    prev.task.id === next.task.id &&
    prev.task.status === next.task.status &&
    prev.isDragging === next.isDragging &&
    prev.agent?.id === next.agent?.id
  );
});
