# Signal

A brutalist productivity tracker with a local AI coach — no gamification, just truth.

## Philosophy

Productivity tracking should be **honest, confrontational, and raw**. No streaks, no badges, no dopamine tricks — just signal vs noise.

Days are defined by your wake-sleep cycle, not arbitrary calendar boundaries. You log naturally. The system shows you the truth about your time.

## Features

- **Live Timer** — Track work as it happens with pause/resume and picture-in-picture mode
- **5-Level Quality System** — Deep Work, Focused, Neutral, Distracted, Wasted (color-coded)
- **Dynamic Day Boundaries** — Days start when you wake, end when you sleep
- **Timeline Visualization** — See your entire day as colored blocks from wake to sleep
- **Brutalist Interface** — Pure black & white, monospace, no rounded corners, no shadows

![Signal Screenshot](screenshot.png)
<!-- TODO: Add screenshot -->

## Roadmap

**V1: Core** ✅
Manual logging, live timer, timeline visualization

**V2: Local AI Coach** (In Development)
- Personal AI trained on your productivity patterns
- Runs entirely on-device — your data never leaves your machine
- Learns what "deep work" means for *you*, not generic advice

**V3: Analytics**
Multi-day trends, pattern detection, peak hours analysis

## Quick Start

```bash
npm install
echo 'DATABASE_URL="postgresql://user:pass@localhost:5432/signal"' > .env
npx prisma migrate dev
npm run dev
```

Open [localhost:3000](http://localhost:3000)

## Stack

Next.js 14 · TypeScript · Tailwind · Prisma · PostgreSQL

## License

MIT

---

> No rounded corners. No shadows. No gradients.
> No productivity theater. No gamification.
> Just signal vs noise.

Built with focus. For focus.
