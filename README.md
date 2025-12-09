# Signal

A brutalist personal productivity tracking system that digitizes daily logs and maximizes focused work time.

## Philosophy

Signal is built on a simple premise: productivity tracking should be **honest, confrontational, and raw**. No gamification, no productivity theater—just signal vs noise.

Days are defined by your wake-sleep cycle, not arbitrary calendar boundaries. You log naturally, like on a post-it note. The system parses your entries and shows you the truth about your time.

## Features

### V0.1 (Current)

- **Live Timer**: Real-time stopwatch that tracks work as it happens with pause/resume
- **Picture-in-Picture Mode**: Draggable, resizable floating timer window - within browser window boundaries only ATM
- **5-Level Quality System**: Deep Work, Focused, Neutral, Distracted, Wasted (color-coded)
- **Auto-Draft Entries**: Timer creates placeholder entries (Whoop-style activity detection)
- **Enhanced Log Entry**: Quality dropdown, custom timestamps, manual duration override
- **Dynamic Day Boundaries**: Days start when you wake up and end when you sleep
- **Full-Screen Logging**: Minimal, distraction-free input interface  
- **Signal Timer**: Large, impossible-to-ignore display of high-signal work time
- **Timeline Visualization**: 5-color coded blocks showing your day from wake to sleep
- **Log History**: Chronological list with quality badges
- **Brutalist Design**: Pure black & white with terminal aesthetics (IBM Plex Mono)
- **Timer Persistence**: localStorage saves timer state across page refreshes

### Planned (Future)

- NLP-powered automatic entry parsing
- Multi-day analytics and trends
- Weekly/monthly summaries
- Pattern detection (when are you most productive?)
- Distraction correlation analysis
- Export data to CSV/JSON

## Screenshots

> See the attached post-it note images for the original analog system

## Getting Started

See [SETUP.md](./SETUP.md) for complete installation instructions.

### Quick Start

```bash
# Install dependencies
npm install

# Set up database connection
echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/signal"' > .env

# Run migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Option 1: Live Timer (Recommended)

**Start Tracking:**
1. Click **"▶ START TIMER"** (bottom-left)
2. Timer begins tracking your work
3. Optional: Click "MINIMIZE TO PIP" for floating window

**While Working:**
- Pause for breaks: Click "⏸ PAUSE"
- Resume: Click "▶ RESUME"
- PIP mode: Drag to reposition, resize from corner

**When Done:**
1. Click **"⏹ STOP"**
2. Add description of what you worked on
3. Select quality level: Deep/Focused/Neutral/Distracted/Wasted
4. Submit (duration is auto-filled from timer)

### Option 2: Manual Logging

**For Retroactive Entries:**
1. Click **"+ NEW LOG ENTRY"** (bottom-right)
2. Enter what you worked on
3. Select quality level
4. Check "Custom Time" to set when (for logging past activities)
5. Check "Duration" to manually enter minutes
6. Submit

**Old Tag System (Still Works):**
```
10-12 worked on research [signal: 120]
wasted 45min on twitter [wasted: 45]
```

### Quality Levels Guide

- **Deep Work** (Blue): Flow state, complex cognitive work, peak focus
- **Focused** (Cyan): Productive work with good concentration
- **Neutral** (Gray): Routine tasks, emails, meetings
- **Distracted** (Orange): Frequent interruptions, multitasking
- **Wasted** (Red): Social media, procrastination, off-task

### Day Boundaries

**Starting a Day:**
- Timer auto-creates a day if none exists
- Or manually log: `woke up at 9am [wake]` → Confirm prompt

**Ending a Day:**
- Log: `going to sleep [sleep]` → Confirm "Close day?"
- Days span calendar dates (e.g., wake 10am Dec 8, sleep 2am Dec 9)

## Tag Reference

- `[wake]` - Marks wake-up time (creates new day)
- `[sleep]` - Marks sleep time (closes current day)  
- `[signal: X]` - High-signal work time in minutes
- `[wasted: X]` - Wasted time in minutes
- No tag - Neutral time (meals, breaks, etc.)

## Design System

### Color Palette

- Background: `#000000` (pure black)
- Text: `#FFFFFF` (pure white)
- Secondary: `#808080` (gray)
- Signal: `#0EA5E9` (electric blue)
- Wasted: `#404040` (dark gray)

### Typography

- Font: IBM Plex Mono (monospace)
- Timer: 84px, bold
- Body: 16px
- Labels: 12-14px, uppercase, tracked

### Principles

- No rounded corners
- No shadows
- No gradients
- High contrast
- Sharp edges
- Information density
- Terminal aesthetics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Database**: Prisma + PostgreSQL
- **Deployment**: Vercel-ready

## Project Structure

```
signal/
├── app/
│   ├── api/              # API routes
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main dashboard
├── components/           # React components
├── lib/                  # Utilities & Prisma client
├── prisma/              # Database schema
└── types/               # TypeScript types
```

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start prod server
npx prisma studio    # Open database GUI
```

## Deployment

Deploy to Vercel in one click:

1. Push to GitHub
2. Import project in Vercel
3. Add `DATABASE_URL` environment variable
4. Deploy

Recommended databases: Supabase (free tier), Neon (serverless), Railway

## Future Roadmap

**V2: Intelligence**
- Natural language parsing (no manual tags)
- Auto-detect activity types
- Smart time extraction from natural text

**V3: Analytics**
- Multi-day trends
- Pattern detection
- Peak productivity hours
- Distraction analysis

**V4: Insights**
- AI-powered recommendations
- Correlation analysis
- Predictive modeling
- Export & integrations

## Contributing

This is a personal project, but ideas and feedback are welcome. Open an issue or reach out directly.

## License

MIT

## Design Philosophy

> No rounded corners. No shadows. No gradients.  
> No productivity theater. No gamification.  
> Just signal vs noise.

Built with focus. For focus.

