# 🚀 Supabase Setup Guide for CapitalLab

## Prerequisites
- A Supabase account (free tier works fine)
- Your project code ready

## Step 1: Create Supabase Project (5 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Fill in:
   - **Project Name**: `capitallab-simulator`
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

## Step 2: Run Database Schema (2 minutes)

1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `lib/supabase/SETUP_COMPLETE.sql` from your project
4. Copy ALL the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for "Success. No rows returned" message

## Step 3: Create Storage Bucket (1 minute)

1. Click **Storage** in left sidebar
2. Click **New bucket**
3. Name it: `documents`
4. Keep it **Private** (not public)
5. Click **Create bucket**

## Step 4: Get Your Credentials (1 minute)

1. Click **Settings** (gear icon) in left sidebar
2. Click **API** under Project Settings
3. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
4. Keep this page open - you'll need these values

## Step 5: Configure Your App (2 minutes)

1. In your project, create `.env.local` file (if it doesn't exist)
2. Add these lines (replace with YOUR values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file
4. Restart your dev server: `npm run dev`

## Step 6: Test It! (5 minutes)

1. Open your app: `http://localhost:3000`
2. Go to signup page
3. Create a test account:
   - Email: `test@example.com`
   - Password: `Test123!`
   - Full Name: `Test User`
   - Role: `ISSUER_CEO`
4. Check if you can log in
5. Try creating a company

## Troubleshooting

### "Failed to fetch" error
- Check your `.env.local` has correct URL and key
- Restart dev server after adding env vars

### "Row Level Security" error
- Make sure you ran the COMPLETE SQL script
- Check RLS policies were created

### Can't upload files
- Verify storage bucket named `documents` exists
- Check bucket is set to Private

## What's Next?

Once setup is complete:
- ✅ Authentication works
- ✅ Data persists in database
- ✅ File uploads work
- ✅ Multi-user collaboration enabled
- ✅ Ready to deploy to Vercel!

Need help? Check the Supabase docs or ask me!
