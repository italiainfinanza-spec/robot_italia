'use client';

import { useState, useEffect } from 'react';
import { Agent, Task, Activity, TaskStatus } from '@/types';
import { initialAgents, initialTasks, initialActivities, columns } from '@/lib/data';
import Header from './Header';
import AgentStatus from './AgentStatus';
import KanbanBoard from './KanbanBoard';
import ActivityFeed from './ActivityFeed';
import TaskModal from './TaskModal';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Simulate loading for smooth UX
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = (status: TaskStatus) => {
    if (!draggedTask || draggedTask.status === status) return;

    setTasks(prev =>
      prev.map(task =>
        task.id === draggedTask.id
          ? { ...task, status, updatedAt: new Date().toISOString() }
          : task
      )
    );

    // Add activity
    const agent = agents.find(a => a.id === draggedTask.assignee);
    if (agent) {
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        agentId: agent.id,
        agentName: agent.name,
        agentEmoji: agent.emoji,
        action: 'moved task to',
        target: columns.find(c => c.id === status)?.title || status,
        timestamp: new Date().toISOString(),
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 50));
    }

    setDraggedTask(null);
  };

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);

    // Add activity
    const agent = agents.find(a => a.id === taskData.assignee);
    if (agent) {
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        agentId: agent.id,
        agentName: agent.name,
        agentEmoji: agent.emoji,
        action: 'created task',
        target: taskData.title,
        timestamp: new Date().toISOString(),
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 50));
    }

    setIsModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <Header 
        stats={stats} 
        onCreateTask={() => setIsModalOpen(true)} 
      />
      
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Agent Status */}
        <AgentStatus agents={agents} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Kanban Board - Takes 3 columns */}
          <div className="lg:col-span-3">
            <KanbanBoard
              tasks={tasks}
              agents={agents}
              draggedTask={draggedTask}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onDeleteTask={handleDeleteTask}
            />
          </div>

          {/* Activity Feed - Takes 1 column */}
          <div className="lg:col-span-1">
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </main>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        agents={agents}
      />
    </div>
  );
}
