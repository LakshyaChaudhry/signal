# Signal - Setup Guide

Complete setup instructions for getting Signal running on your local machine.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database (local or cloud)
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Framer Motion, Prisma, and their dependencies.

### 2. Set Up PostgreSQL Database

You have several options:

#### Option A: Local PostgreSQL

Install PostgreSQL locally:
- **macOS**: `brew install postgresql@15 && brew services start postgresql`
- **Ubuntu**: `sudo apt install postgresql && sudo systemctl start postgresql`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)

Create a database:
```bash
psql postgres
CREATE DATABASE signal;
\q
```

#### Option B: Docker PostgreSQL

```bash
docker run --name signal-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=signal \
  -p 5432:5432 \
  -d postgres:15
```

#### Option C: Cloud Database (Supabase/Neon)

1. Create a free account at [Supabase](https://supabase.com) or [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example
cp .env.example .env

# Edit .env with your database connection string
# Example for local PostgreSQL:
DATABASE_URL="postgresql://postgres:password@localhost:5432/signal?schema=public"

# Example for Supabase:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"

# Example for Neon:
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/signal?sslmode=require"
```

### 4. Run Prisma Migrations

Generate the Prisma client and create database tables:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view your database
npx prisma studio
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Use

1. Click "**+ NEW LOG ENTRY**" to create your first entry
2. Type: `9:30am woke up [wake]`
3. Submit - you'll be prompted to start a new day
4. Add more entries with tags:
   - `10-12 worked on research [signal: 120]` - logs 2 hours of high-signal work
   - `wasted 30min on social media [wasted: 30]` - logs wasted time
   - `lunch break` - neutral entry (no tag)

## Tag Reference

- `[wake]` - Marks wake-up time (creates new day)
- `[sleep]` - Marks sleep time (closes current day)
- `[signal: X]` - High-signal work time in minutes
- `[wasted: X]` - Wasted time in minutes

## Keyboard Shortcuts

- `⌘/Ctrl + Enter` - Submit log entry
- `Escape` - Close input modal

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql $DATABASE_URL

# Check if PostgreSQL is running (local)
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

### Prisma Issues

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate

# View database in browser
npx prisma studio
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
PORT=3001 npm run dev
```

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `DATABASE_URL` environment variable
4. Deploy

### Database for Production

Use a managed PostgreSQL service:
- **Supabase**: Free tier, includes auth
- **Neon**: Serverless, free tier
- **Railway**: Easy setup, free tier
- **Heroku Postgres**: Add-on available

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npx prisma studio    # Open database GUI
npx prisma migrate dev  # Create migration
npx prisma db push   # Push schema changes (dev only)
```

## Project Structure

```
signal/
├── app/
│   ├── api/
│   │   ├── days/route.ts       # Day CRUD endpoints
│   │   └── entries/route.ts    # Entry CRUD endpoints
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main dashboard
├── components/
│   ├── SignalTimer.tsx         # Hero timer display
│   ├── TimelineView.tsx        # Visual timeline
│   ├── LogInput.tsx            # Full-screen input
│   ├── LogHistory.tsx          # Entry list
│   ├── DaySelector.tsx         # Day navigation
│   └── ConfirmationModal.tsx   # Day boundary prompts
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   └── parser.ts               # Entry parsing logic
├── prisma/
│   └── schema.prisma           # Database schema
└── types/
    └── index.ts                # TypeScript types
```

## Next Steps

- Add more entries to see the timeline populate
- Try different entry types to see color coding
- Close your day with a `[sleep]` entry
- Check Prisma Studio to view your data

For issues or questions, refer to the main README.md.

