# 🚀 CapitalLab Deployment Guide

## Quick Start (20 minutes total)

### 1. Setup Supabase Backend (10 minutes)

Follow the detailed guide in `SUPABASE_SETUP_GUIDE.md`:

```bash
# Quick checklist:
☐ Create Supabase project at supabase.com
☐ Run lib/supabase/SETUP_COMPLETE.sql in SQL Editor
☐ Create 'documents' storage bucket
☐ Copy credentials to .env.local
☐ Restart dev server
```

### 2. Verify Setup (2 minutes)

```bash
# Install tsx if you don't have it
npm install -D tsx

# Run verification script
npx tsx scripts/verify-supabase.ts
```

You should see:
```
✅ Connected successfully
✅ All tables exist
✅ Storage bucket exists
🎉 All checks passed!
```

### 3. Test Locally (5 minutes)

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000

# Test flow:
1. Go to /auth/shora-exchange-signup
2. Create account (email, password, name)
3. Log in
4. Create a company
5. Start an IPO application
6. Upload a document
```

### 4. Deploy to Vercel (3 minutes)

```bash
# Push to GitHub
git add .
git commit -m "Add Supabase integration"
git push origin main

# In Vercel Dashboard:
1. Go to your project settings
2. Add Environment Variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Redeploy
```

## What Changed from localStorage?

### Before (localStorage):
- ❌ Data only in browser
- ❌ Lost on cache clear
- ❌ No multi-user support
- ❌ Files not really uploaded

### After (Supabase):
- ✅ Data in cloud database
- ✅ Persistent across devices
- ✅ Real multi-user collaboration
- ✅ Actual file storage
- ✅ Row-level security
- ✅ Real-time updates possible

## Features Now Working

### Authentication
- ✅ Sign up with email/password
- ✅ Login/logout
- ✅ Session management
- ✅ Role-based access

### Data Management
- ✅ Create companies
- ✅ Create IPO applications
- ✅ Fill out sections
- ✅ Auto-save functionality
- ✅ Progress tracking

### File Uploads
- ✅ Upload documents
- ✅ Store in Supabase Storage
- ✅ Download documents
- ✅ Document review workflow

### Collaboration
- ✅ Assign IB Advisors
- ✅ CMA Regulator review
- ✅ Comments and feedback
- ✅ Notifications
- ✅ Activity tracking

## Troubleshooting

### "Failed to fetch" errors
```bash
# Check env vars are set
cat .env.local

# Restart dev server
npm run dev
```

### Database errors
```bash
# Re-run the SQL setup
# Go to Supabase > SQL Editor
# Run lib/supabase/SETUP_COMPLETE.sql again
```

### Upload errors
```bash
# Verify storage bucket exists
# Supabase Dashboard > Storage
# Should see 'documents' bucket
```

## Production Checklist

Before going live:
- ☐ Supabase project on paid plan (if needed)
- ☐ Custom domain configured
- ☐ Email templates customized
- ☐ Backup strategy in place
- ☐ Monitoring setup
- ☐ Rate limiting configured

## Support

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Project Issues: Create an issue in your repo

## Next Steps

1. **Customize Email Templates**: Supabase > Authentication > Email Templates
2. **Add More Roles**: Extend the role system as needed
3. **Enable Real-time**: Add real-time subscriptions for live updates
4. **Add Analytics**: Track user behavior and application metrics
5. **Backup Database**: Set up automated backups

---

**Ready to deploy?** Follow the steps above and you'll be live in 20 minutes! 🎉
