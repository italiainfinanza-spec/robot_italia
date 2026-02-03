'use client';

import { Activity } from '@/types';
import { Activity as ActivityIcon, Clock } from 'lucide-react';
import { useMemo } from 'react';

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  // Group activities by time period
  const groupedActivities = useMemo(() => {
    const groups: { label: string; items: Activity[] }[] = [];
    const now = new Date();

    const today: Activity[] = [];
    const yesterday: Activity[] = [];
    const thisWeek: Activity[] = [];
    const older: Activity[] = [];

    activities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        today.push(activity);
      } else if (diffDays === 1) {
        yesterday.push(activity);
      } else if (diffDays < 7) {
        thisWeek.push(activity);
      } else {
        older.push(activity);
      }
    });

    if (today.length) groups.push({ label: 'Today', items: today });
    if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday });
    if (thisWeek.length) groups.push({ label: 'This Week', items: thisWeek });
    if (older.length) groups.push({ label: 'Older', items: older });

    return groups;
  }, [activities]);

  return (
    <section className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-primary-400" />
          Activity Feed
        </h2>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
          {activities.length}
        </span>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {groupedActivities.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <ActivityIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {groupedActivities.map((group) => (
                <div key={group.label}>
                  <div className="px-4 py-2 bg-slate-800/50 sticky top-0">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    {group.items.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface ActivityItemProps {
  activity: Activity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const timeAgo = getTimeAgo(activity.timestamp);

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors group">
      {/* Agent Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-sm">
        {activity.agentEmoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200">
          <span className="font-medium text-white">{activity.agentName}</span>{' '}
          <span className="text-slate-400">{activity.action}</span>{' '}
          {activity.target && (
            <span className="text-primary-400 font-medium truncate">
              {activity.target}
            </span>
          )}
        </p>
        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
