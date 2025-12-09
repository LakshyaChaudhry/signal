# Duplicate Days Fix

## Problem

The app was creating multiple day records for the same calendar date when users would:
1. Close a day (mark sleep time)
2. Wake up and confirm "start new day"

This resulted in having multiple Dec 9th days (for example), with some closed and one open, even though they all represent the same calendar date.

## Root Cause

The **"wake up after sleep"** flow was always creating a brand new day without checking if:
- An open day already exists
- A day for today's date already exists that could be reopened

This happened in two places:
1. `POST /api/days` route - Always created a new day
2. `handleWakeConfirm` in `app/page.tsx` - Always called createNewDay

## What Was Fixed

### 1. API Route (`app/api/days/route.ts`)

Updated the `POST /api/days` endpoint to be smarter about day creation:

**New behavior:**
1. **Check for existing open day** - If one exists, return it (don't create a new one)
2. **Check for today's day** - If the most recent day was created today and is closed, reopen it instead of creating a new one
3. **Only create new day** - If neither of the above conditions are met

This prevents duplicate days for the same calendar date.

### 2. Frontend (`app/page.tsx`)

Updated `handleWakeConfirm` to work with the new API behavior:
- Now properly handles cases where the API returns an existing/reopened day instead of creating a new one
- Comments updated to reflect new behavior

### 3. Cleanup Script (`scripts/cleanup-duplicate-days.ts`)

Created a utility script to:
- Identify duplicate days (multiple days with the same calendar date)
- Show details about each duplicate (status, entries, signal/wasted time)
- Clean up duplicates by keeping the most relevant day (most recent with most entries)

## How to Use the Cleanup Script

### Step 1: Identify Duplicates (Dry Run)

```bash
npm run cleanup:days
```

This will:
- List all dates with duplicate days
- Show details about each day (open/closed, entry count, signal/wasted time)
- **NOT make any changes** (dry run)

Example output:
```
📊 Analyzing days for duplicates...

⚠️  Found 1 date(s) with duplicate days:

📅 Dec 9, 2025 (3 days):
  1. 🔒 CLOSED | ID: abc12345... | 9:00 AM → 11:30 AM
     Entries: 0 | Signal: 0min | Wasted: 0min
  2. 🔒 CLOSED | ID: def67890... | 11:45 AM → 2:00 PM
     Entries: 5 | Signal: 120min | Wasted: 30min
  3. 🔓 OPEN | ID: ghi54321... | 2:15 PM → ongoing
     Entries: 3 | Signal: 45min | Wasted: 0min

💡 This was a dry run. Run with --cleanup to actually delete.
```

### Step 2: Clean Up (After Reviewing)

Once you've reviewed the duplicates and confirmed which days should be kept:

```bash
npm run cleanup:days:confirm
```

This will:
- Keep the most recent day with the most entries
- Delete the other duplicate days
- Show what was deleted

**Strategy for keeping days:**
1. Prefer days with more entries
2. If entry count is equal, keep the most recent one

## Prevention

With the fixes in place, the app will now:
- ✅ Not create duplicate days for the same calendar date
- ✅ Reopen today's day if you close and wake up again on the same day
- ✅ Return existing open day if one already exists
- ✅ Prevent creating days in the future

## Testing the Fix

1. **Test reopening a day:**
   - Close your current day (mark sleep)
   - Log something that triggers "wake up" prompt
   - Confirm "START NEW DAY"
   - Verify: Same day is reopened (check day ID in URL or database)

2. **Test with existing open day:**
   - Make sure you have an open day
   - Try to start the timer or create a new day
   - Verify: Uses existing open day, doesn't create a duplicate

3. **Test day navigation:**
   - Navigate between days using PREV/NEXT buttons
   - Verify: No duplicate dates appear

## Files Changed

1. `app/api/days/route.ts` - Smarter day creation logic
2. `app/page.tsx` - Updated wake confirmation handler
3. `scripts/cleanup-duplicate-days.ts` - New cleanup utility
4. `package.json` - Added cleanup scripts and tsx dependency

## Next Steps

1. Run the cleanup script to remove existing duplicates
2. Test the new flow by closing and reopening days
3. Monitor for any new duplicates (shouldn't happen now)

---

**Note:** Always run the dry run first (`npm run cleanup:days`) before doing the actual cleanup to make sure you agree with what will be deleted!
