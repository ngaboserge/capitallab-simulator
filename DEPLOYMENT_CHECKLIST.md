# ✅ CapitalLab Deployment Checklist

Print this and check off as you go!

## Phase 1: Supabase Setup

### Create Project
- [ ] Go to https://supabase.com
- [ ] Click "New Project"
- [ ] Name: `capitallab-simulator`
- [ ] Save database password securely
- [ ] Choose region (closest to users)
- [ ] Wait for project creation (2-3 min)

### Setup Database
- [ ] Click "SQL Editor" in sidebar
- [ ] Click "New Query"
- [ ] Open `lib/supabase/SETUP_COMPLETE.sql`
- [ ] Copy ALL SQL code
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run" or press Ctrl+Enter
- [ ] Verify "Success" message appears

### Create Storage
- [ ] Click "Storage" in sidebar
- [ ] Click "New bucket"
- [ ] Name: `documents`
- [ ] Keep "Private" selected
- [ ] Click "Create bucket"

### Get Credentials
- [ ] Click "Settings" (gear icon)
- [ ] Click "API"
- [ ] Copy "Project URL"
- [ ] Copy "anon public" key
- [ ] Keep this tab open

## Phase 2: Local Configuration

### Environment Setup
- [ ] Create `.env.local` file in project root
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL=` (paste URL)
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY=` (paste key)
- [ ] Save file

### Verify Setup
- [ ] Run: `npm install -D tsx`
- [ ] Run: `npx tsx scripts/verify-supabase.ts`
- [ ] All checks should pass ✅

### Test Locally
- [ ] Run: `npm run dev`
- [ ] Open: http://localhost:3000
- [ ] Go to signup page
- [ ] Create test account
- [ ] Log in successfully
- [ ] Create a test company
- [ ] Start IPO application
- [ ] Upload a test document
- [ ] Verify data persists after refresh

## Phase 3: Deploy to Vercel

### Prepare Code
- [ ] Run: `git add .`
- [ ] Run: `git commit -m "Add Supabase integration"`
- [ ] Run: `git push origin main`

### Configure Vercel
- [ ] Go to Vercel dashboard
- [ ] Select your project
- [ ] Go to Settings > Environment Variables
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` (same value)
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same value)
- [ ] Click "Save"

### Deploy
- [ ] Go to Deployments tab
- [ ] Click "Redeploy" (or wait for auto-deploy)
- [ ] Wait for build to complete
- [ ] Click "Visit" to open live site

### Test Production
- [ ] Open your live URL
- [ ] Create new account
- [ ] Log in
- [ ] Create company
- [ ] Start application
- [ ] Upload document
- [ ] Verify everything works

## Phase 4: Post-Deployment

### Security
- [ ] Review RLS policies in Supabase
- [ ] Test different user roles
- [ ] Verify users can't access others' data

### Monitoring
- [ ] Check Supabase Dashboard > Database
- [ ] Verify data is being saved
- [ ] Check Storage for uploaded files
- [ ] Review Auth users list

### Documentation
- [ ] Share login credentials with team
- [ ] Document any custom setup
- [ ] Note any issues encountered

## Troubleshooting

If something doesn't work:

### Connection Issues
- [ ] Verify .env.local has correct values
- [ ] Restart dev server
- [ ] Check Supabase project is active

### Database Errors
- [ ] Re-run SETUP_COMPLETE.sql
- [ ] Check all tables were created
- [ ] Verify RLS policies exist

### Upload Errors
- [ ] Confirm 'documents' bucket exists
- [ ] Check bucket is set to Private
- [ ] Verify storage policies

### Auth Errors
- [ ] Check email confirmation settings
- [ ] Verify user was created in Supabase
- [ ] Test with different email

## Success Criteria

You're done when:
- ✅ Can sign up new users
- ✅ Can log in/out
- ✅ Can create companies
- ✅ Can create applications
- ✅ Can upload files
- ✅ Data persists after refresh
- ✅ Works on production URL
- ✅ Multiple users can collaborate

---

**Estimated Time**: 20-30 minutes total

**Need Help?** Check SUPABASE_SETUP_GUIDE.md for detailed instructions
