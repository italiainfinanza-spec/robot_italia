'use client'

import { RefreshCw, Clock, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  lastUpdated: Date | null
  isRefreshing: boolean
  onRefresh: () => void
}

export function Header({ lastUpdated, isRefreshing, onRefresh }: HeaderProps) {
  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (seconds < 10) return 'Just now'
    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    return date.toLocaleTimeString()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Mission Control</h1>
            <p className="text-xs text-slate-400">Admin Dashboard</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Last updated */}
          <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">
            <Clock className="h-4 w-4" />
            <span>Updated: {formatLastUpdated(lastUpdated)}</span>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-slate-300 transition-all',
              'hover:border-primary hover:text-white',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            aria-label="Refresh data"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  )
}
