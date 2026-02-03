import type { Task } from './tasks'

const STORAGE_KEY = 'mission-control-tasks'
const LAST_UPDATED_KEY = 'mission-control-last-updated'

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    localStorage.setItem(LAST_UPDATED_KEY, new Date().toISOString())
  } catch (error) {
    console.error('Failed to save tasks:', error)
  }
}

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load tasks:', error)
  }
  return []
}

export function getLastUpdated(): Date | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(LAST_UPDATED_KEY)
    if (stored) {
      return new Date(stored)
    }
  } catch (error) {
    console.error('Failed to get last updated:', error)
  }
  return null
}

export function clearTasks(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LAST_UPDATED_KEY)
  } catch (error) {
    console.error('Failed to clear tasks:', error)
  }
}
