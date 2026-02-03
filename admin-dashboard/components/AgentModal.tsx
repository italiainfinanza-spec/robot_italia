'use client'

import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Agent } from '@/lib/agents'

interface AgentModalProps {
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
}

export function AgentModal({ agent, isOpen, onClose }: AgentModalProps) {
  const [soulContent, setSoulContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && agent) {
      setIsLoading(true)
      setError(null)

      // Fetch the SOUL.md content
      fetch(agent.soulPath)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load SOUL.md')
          return res.text()
        })
        .then((text) => {
          setSoulContent(text)
          setIsLoading(false)
        })
        .catch((err) => {
          setError(err.message)
          setIsLoading(false)
        })
    }
  }, [isOpen, agent])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !agent) return null

  const statusColors = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    busy: 'bg-red-500',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-background/50 p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white',
                agent.color
              )}
            >
              {agent.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{agent.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">{agent.role}</span>
                <span className="flex items-center gap-1 text-xs">
                  <span className={cn('h-2 w-2 rounded-full', statusColors[agent.status])} />
                  <span className="capitalize text-slate-400">{agent.status}</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-2 text-slate-400 hover:bg-surface hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-100px)] overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-300">
                {soulContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
