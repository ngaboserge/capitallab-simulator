# 🚀 Quick Start - Get Running in 5 Minutes

## Current Status

✅ **Code is ready** - All Supabase integration is complete  
⚠️ **Build requires Supabase** - You need credentials to build/deploy  
📝 **localStorage still works** - Local dev works without Supabase (but data won't persist)

## Option 1: Quick Local Test (No Supabase)

```bash
# Just run it
npm run dev

# Open browser
http://localhost:3000
```

**Note**: Data stored in localStorage only (not persistent, not shareable)

## Option 2: Full Setup with Supabase (20 minutes)

### Step 1: Create Supabase Project (5 min)
1. Go to https://supabase.com
2. Create new project
3. Save your database password

### Step 2: Setup Database (2 min)
1. Open Supabase Dashboard > SQL Editor
2. Copy ALL content from `lib/supabase/SETUP_COMPLETE.sql`
3. Paste and click "Run"

### Step 3: Create Storage (1 min)
1. Go to Storage in Supabase
2. Create bucket named `documents`
3. Keep it Private

### Step 4: Configure App (2 min)
1. Get credentials from Supabase > Settings > API
2. Update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

### Step 5: Verify (1 min)
```bash
npx tsx scripts/verify-supabase.ts
```

### Step 6: Run (1 min)
```bash
npm run dev
```

## Deploy to Vercel

```bash
# Push code
git push origin main

# In Vercel Dashboard:
# 1. Add environment variables (same as .env.local)
# 2. Redeploy
```

## Need Help?

- **Detailed Guide**: See `SUPABASE_SETUP_GUIDE.md`
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **Full Docs**: See `README_DEPLOYMENT.md`

## What's Different with Supabase?

| Feature | localStorage | Supabase |
|---------|-------------|----------|
| Data Persistence | ❌ Browser only | ✅ Cloud database |
| Multi-user | ❌ No | ✅ Yes |
| File Upload | ❌ Fake | ✅ Real storage |
| Authentication | ❌ Mock | ✅ Real auth |
| Works Deployed | ❌ No | ✅ Yes |

## Build Errors?

If you see build errors about Supabase:
1. Make sure `.env.local` has valid credentials
2. Or use placeholder values (app won't work but will build)
3. Real credentials needed for production

---

**Ready?** Follow Option 2 above or open `DEPLOYMENT_CHECKLIST.md` for step-by-step!
