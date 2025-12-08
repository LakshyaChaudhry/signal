# Signal - Quick Start Guide

Get Signal running in 5 minutes.

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check if PostgreSQL is available
which psql
```

## Option 1: Quick Setup with Docker (Easiest)

```bash
# Start PostgreSQL in Docker
docker run --name signal-db \
  -e POSTGRES_PASSWORD=signal \
  -e POSTGRES_DB=signal \
  -p 5432:5432 \
  -d postgres:15

# Create .env file
echo 'DATABASE_URL="postgresql://postgres:signal@localhost:5432/signal"' > .env

# Install dependencies and setup database
npm install
npx prisma generate
npx prisma migrate dev --name init

# Start the app
npm run dev
```

## Option 2: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql

# Create database
createdb signal

# Setup project
echo 'DATABASE_URL="postgresql://localhost:5432/signal"' > .env
npm install
npx prisma generate
npx prisma migrate dev --name init

# Start the app
npm run dev
```

## Option 3: Cloud Database (Supabase)

```bash
# 1. Go to https://supabase.com and create a free project
# 2. Copy the connection string from Settings > Database
# 3. Create .env file with your connection string:
echo 'DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"' > .env

# Setup project
npm install
npx prisma generate
npx prisma migrate dev --name init

# Start the app
npm run dev
```

## Verify Installation

Open [http://localhost:3000](http://localhost:3000)

You should see:
- Black background with white "SIGNAL" text
- "0:00" in large electric blue text
- "+ NEW LOG ENTRY" button in bottom-right

## First Entry

1. Click **"+ NEW LOG ENTRY"**
2. Type: `woke up at 9am [wake]`
3. Press **⌘/Ctrl + Enter** or click **SUBMIT**
4. Click **"START NEW DAY"** when prompted
5. You now have your first day!

## Add Some Activity

Click **"+ NEW LOG ENTRY"** again and try:

```
worked on side project [signal: 90]
```

Watch the timer update to show 1:30 (90 minutes) in electric blue!

## Common Issues

### "ECONNREFUSED" error
PostgreSQL isn't running. Start it:
```bash
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
docker start signal-db          # Docker
```

### "DATABASE_URL not found"
Create .env file in project root:
```bash
echo 'DATABASE_URL="your-connection-string"' > .env
```

### Port 3000 already in use
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed documentation
- Open `npx prisma studio` to view your database
- Check [README.md](./README.md) for tag reference and features

## Need Help?

1. Check [SETUP.md](./SETUP.md) for troubleshooting
2. Verify database connection: `psql $DATABASE_URL`
3. Check logs in terminal for error details

Happy tracking! 🎯

