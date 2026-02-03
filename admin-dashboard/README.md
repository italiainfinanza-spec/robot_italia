# Mission Control - Admin Dashboard

A modern, interactive admin dashboard for managing multi-agent tasks and workflows.

## Tech Stack

- **Next.js 14+** - App Router, React Server Components
- **React 18+** - Functional components with hooks
- **TypeScript** - Strict typing throughout
- **Tailwind CSS** - Dark theme with custom colors
- **@dnd-kit** - Drag and drop functionality
- **date-fns** - Date manipulation

## Features

### 1. Kanban Board
- 5 columns: Inbox, Assigned, In Progress, Review, Done
- Drag and drop tasks between columns
- Add new tasks inline
- Edit tasks with inline editing
- Delete tasks with confirmation
- Persist to localStorage

### 2. Agent Viewer
- Shows all 6 agents with status indicators
- Click agent to view SOUL.md in modal
- Color-coded avatars
- Current task display

### 3. Gantt Chart
- Weekly timeline view
- Task bars with color-coded status
- Today marker
- Navigate between weeks

### 4. Real-time Updates
- Auto-refresh every 30 seconds
- "Last updated" timestamp
- Loading states

### 5. Stats Dashboard
- Total tasks
- Completed tasks
- In progress count
- High priority items

## Design

- Dark theme (#0f172a background)
- Purple gradient accents
- Mobile responsive
- Accessible (keyboard nav, ARIA labels)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

## Build Output

Static export to `dist/` folder, ready for deployment.
