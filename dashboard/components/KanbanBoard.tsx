import { Task, Agent, TaskStatus, Column } from '@/types';
import { columns } from '@/lib/data';
import TaskCard from './TaskCard';
import { useState } from 'react';

interface KanbanBoardProps {
  tasks: Task[];
  agents: Agent[];
  draggedTask: Task | null;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  onDrop: (status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function KanbanBoard({
  tasks,
  agents,
  draggedTask,
  onDragStart,
  onDragEnd,
  onDrop,
  onDeleteTask,
}: KanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-4">Task Board</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter((t) => t.status === column.id)}
            agents={agents}
            isDragOver={dragOverColumn === column.id}
            draggedTask={draggedTask}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragEnter={() => setDragOverColumn(column.id)}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={() => {
              onDrop(column.id);
              setDragOverColumn(null);
            }}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </section>
  );
}

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  agents: Agent[];
  isDragOver: boolean;
  draggedTask: Task | null;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onDeleteTask: (taskId: string) => void;
}

function KanbanColumn({
  column,
  tasks,
  agents,
  isDragOver,
  draggedTask,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDeleteTask,
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={`
        flex flex-col min-h-[400px] rounded-xl transition-all duration-200
        ${isDragOver 
          ? 'bg-slate-800/80 border-2 border-dashed border-primary-500' 
          : 'bg-slate-800/30 border border-slate-700/50'
        }
      `}
      onDragOver={handleDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Column Header */}
      <div 
        className="flex items-center justify-between p-3 border-b border-slate-700/50"
        style={{ borderTopColor: column.color }}
      >
        <div className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-medium text-white text-sm">{column.title}</h3>
        </div>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-2 space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            agent={agents.find((a) => a.id === task.assignee)}
            isDragging={draggedTask?.id === task.id}
            onDragStart={() => onDragStart(task)}
            onDragEnd={onDragEnd}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <p className="text-xs">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
