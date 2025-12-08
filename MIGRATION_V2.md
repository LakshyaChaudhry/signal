# Signal V2 Migration Guide

This guide will help you upgrade from Signal V1 to V2 with the new live timer features.

## What's New in V2

- **Live Timer**: Real-time stopwatch that tracks your work as it happens
- **Picture-in-Picture Mode**: Draggable, resizable floating timer window
- **5-Level Quality System**: Deep Work, Focused, Neutral, Distracted, Wasted
- **Enhanced Log Entry**: Quality dropdown, custom timestamps, manual duration
- **Auto-Draft Entries**: Timer automatically creates draft entries (Whoop-style)
- **Pause/Resume**: Take breaks without losing your timer state

## Database Migration Required

### Step 1: Run Prisma Migration

```bash
# Generate Prisma Client with new schema
npx prisma generate

# Create and run the migration
npx prisma migrate dev --name add_quality_and_draft

# Verify migration was successful
npx prisma studio
```

### Step 2: Verify New Fields

In Prisma Studio, check the `LogEntry` table has new columns:
- `quality` (String, nullable)
- `isDraft` (Boolean, default: false)

## Using the New Features

### Starting the Live Timer

1. Click **"▶ START TIMER"** (bottom-left)
2. Timer begins tracking immediately
3. A draft entry is created with placeholder text

### While Timer is Running

- **Pause**: Click "⏸ PAUSE" to take a break
- **Resume**: Click "▶ RESUME" to continue
- **PIP Mode**: Click "⬇ MINIMIZE TO PIP" for floating window
- **Stop**: Click "⏹ STOP" to complete the session

### PIP Timer Features

- **Draggable**: Click and drag to reposition
- **Resizable**: Drag bottom-right corner to resize
- **Persistent**: Position/size saved to localStorage
- **Min size**: 120x60px, Max size: 300x200px

### Completing a Timer Session

1. Click **"⏹ STOP"** when done
2. Log entry modal opens with pre-filled duration
3. Add description of what you worked on
4. Select quality level (Deep/Focused/Neutral/Distracted/Wasted)
5. Submit to finalize entry

### Manual Log Entries (Without Timer)

1. Click **"+ NEW LOG ENTRY"** (bottom-right, only visible when timer is stopped)
2. Enter description
3. Optional: Select quality level
4. Optional: Set custom timestamp (for retroactive entries)
5. Optional: Enter manual duration (if you forgot to start timer)
6. Submit

### Quality Levels Explained

| Quality | Color | Use When... |
|---------|-------|-------------|
| **Deep Work** | Electric Blue (#0EA5E9) | Peak focus, flow state, complex work |
| **Focused** | Cyan (#06B6D4) | Solid concentration, productive work |
| **Neutral** | Gray (#808080) | Routine tasks, emails, meetings |
| **Distracted** | Orange (#F59E0B) | Frequent interruptions, multitasking |
| **Wasted** | Red (#EF4444) | Social media, procrastination, off-task |

## Backward Compatibility

V2 is **fully backward compatible** with V1:
- Old entries without `quality` field will display using `type` (signal/wasted/neutral)
- Timeline shows both quality-based and type-based colors
- Old tag parsing (`[signal: 120]`, `[wasted: 45]`) still works

## Color System Changes

### New Tailwind Color Tokens

```typescript
// V2 adds these colors
deep: '#0EA5E9'      // Deep work
focused: '#06B6D4'   // Focused work
medium: '#808080'    // Neutral
distracted: '#F59E0B' // Distracted
lost: '#EF4444'      // Wasted

// V1 colors (still available for backwards compatibility)
signal: '#0EA5E9'
wasted: '#404040'
neutral: '#808080'
```

## Troubleshooting

### Migration Fails

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually add columns in SQL
ALTER TABLE "LogEntry" ADD COLUMN "quality" TEXT;
ALTER TABLE "LogEntry" ADD COLUMN "isDraft" BOOLEAN DEFAULT false;
```

### Timer Not Persisting

- Check browser localStorage is enabled
- Clear old timer state: `localStorage.removeItem('signal_timer_state')`

### PIP Window Not Saving Position

- Clear PIP settings:
```javascript
localStorage.removeItem('signal_pip_position')
localStorage.removeItem('signal_pip_size')
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Keyboard Shortcuts

- **⌘/Ctrl + Enter**: Submit log entry
- **Escape**: Close log entry modal
- **Pause/Resume**: While timer running, in LiveTimer component

## API Changes

### New Endpoints

**PATCH `/api/entries`**: Update existing entries (for completing drafts)
```typescript
{
  entryId: string
  content?: string
  quality?: string
  duration?: number
  isDraft?: boolean
}
```

### Updated Endpoints

**POST `/api/entries`**: Now accepts `quality` and `isDraft` fields
```typescript
{
  dayId: string
  content: string
  quality?: string  // NEW
  isDraft?: boolean // NEW
  timestamp?: string
  duration?: number
}
```

**GET `/api/entries`**: Optional `includeDrafts` query param
```
GET /api/entries?dayId=xyz&includeDrafts=true
```

## Performance Notes

- Timer ticks every 100ms for smooth display
- Timer state auto-saves to localStorage on every change
- PIP position/size persists across sessions
- Draft entries are filtered from main timeline by default

## Next Steps

1. Run the migration: `npx prisma migrate dev --name add_quality_and_draft`
2. Restart dev server: `npm run dev`
3. Test the timer: Click "START TIMER"
4. Try PIP mode: Minimize and drag the floating window
5. Complete a session: Stop timer and select quality level

Enjoy the new live tracking features! 🎯

