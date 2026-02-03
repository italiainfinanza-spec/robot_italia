# TASK-010: Develop Interactive Admin Dashboard

## Assigned to: Marty (Coding Best Practices)
**Status:** Assigned  
**Priority:** HIGH  
**Due:** Feb 7, 2026  
**Tech Stack:** React, Next.js 14+, Tailwind CSS, Vercel

## Mission
Transform the static admin dashboard into a fully interactive React application with:
- Drag-and-drop Kanban board
- Agent SOUL file viewer
- Gantt chart for task scheduling
- Real-time updates

## Current State
Static HTML at: `/newsletter/website/admin/index.html`
- Works but not interactive
- No drag-drop
- No SOUL viewing
- No Gantt chart

## Deliverables

### 1. Project Setup (Next.js 14+)
- [ ] Create Next.js app in `/admin-dashboard/`
- [ ] Configure Tailwind CSS
- [ ] Setup project structure (App Router)
- [ ] Add necessary dependencies (dnd-kit for drag-drop, recharts for Gantt)

### 2. Kanban Board Component
- [ ] Drag-and-drop columns (Inbox → Done)
- [ ] Drag cards between columns
- [ ] Add new task button
- [ ] Edit task inline
- [ ] Persist state (localStorage or Supabase)

### 3. Agent Viewer
- [ ] List all 6 agents (Jarvis, Shuri, Fury, Loki, Vision, Marty)
- [ ] Click agent → view SOUL.md content
- [ ] Status indicator (active/idle/busy)
- [ ] Current task display

### 4. Gantt Chart
- [ ] Timeline view of tasks
- [ ] Show task dependencies
- [ ] Drag to reschedule
- [ ] Today marker

### 5. Real-time Updates
- [ ] Auto-refresh every 30 seconds
- [ ] WebSocket or polling for live data
- [ ] Show last update timestamp

### 6. Deployment
- [ ] Build static export
- [ ] Deploy to `/admin/` on main site
- [ ] Update password protection

## Acceptance Criteria
- [ ] All drag-drop works smoothly
- [ ] Agent SOUL files load correctly
- [ ] Gantt shows task timeline
- [ ] Mobile responsive
- [ ] Build passes without errors
- [ ] Lighthouse score > 90

## Design Reference
- Keep dark theme (#0f172a background)
- Use Tailwind for all styling
- Follow existing color scheme (purple gradient)
- Responsive grid layout

## Resources
- Current admin: `/newsletter/website/admin/index.html`
- Agent SOULs: `/agents/*/SOUL.md`
- Tasks: `/mission-control/tasks.md`

---
**Marty:** You're assigned! Start with project setup, then build components one by one. Follow your best practices - functional components, proper hooks, clean code!
