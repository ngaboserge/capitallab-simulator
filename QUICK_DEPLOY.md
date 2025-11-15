# ⚡ Quick Deploy Guide (5 Minutes)

The fastest way to get CapitalLab live.

## 🎯 Prerequisites

- GitHub account (you have this ✅)
- Supabase account (free)
- Vercel account (free)

---

## Step 1: Supabase Setup (2 min)

1. Go to https://supabase.com → Sign up
2. Click "New Project"
   - Name: `capitallab`
   - Password: (save this!)
   - Region: Europe (closest to Rwanda)
3. Wait for project creation
4. Click "SQL Editor" → "New Query"
5. Copy ALL content from `lib/supabase/SETUP_COMPLETE.sql`
6. Paste and click "Run"
7. Click "Storage" → "New bucket"
   - Name: `documents`
   - Keep "Private"
8. Click "Settings" → "API"
   - Copy "Project URL"
   - Copy "anon public" key
   - Keep this tab open

---

## Step 2: Deploy to Vercel (2 min)

1. Go to https://vercel.com → Sign up with GitHub
2. Click "Add New Project"
3. Import your `capitallab-simulator` repository
4. Before deploying, add Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = [paste from Supabase]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [paste from Supabase]
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
```

5. Click "Deploy"
6. Wait 2-3 minutes
7. Click "Visit" to see your live site!

---

## Step 3: Configure Supabase Auth (1 min)

1. Back in Supabase Dashboard
2. Go to "Authentication" → "URL Configuration"
3. Add your Vercel URL:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`
4. Click "Save"

---

## ✅ Test Your Deployment

1. Visit your Vercel URL
2. Click "Sign Up"
3. Create an account
4. Create a company
5. Start an IPO application
6. Upload a test document

**Everything works?** 🎉 You're live!

---

## 💰 Costs

**Free Tier (Perfect for MVP):**
- Vercel: $0 (100GB bandwidth)
- Supabase: $0 (500MB database)
- **Total: $0/month**

Good for: 100-500 users, testing, MVP

**Production Tier (When you grow):**
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- **Total: $45/month**

Good for: 1000+ users, serious production

---

## 🆘 Troubleshooting

### "Can't connect to database"
→ Check environment variables in Vercel are correct

### "Upload failed"
→ Verify 'documents' bucket exists in Supabase Storage

### "Build failed"
→ Check Vercel build logs, likely a TypeScript error

---

## 📚 More Details

- **Full Guide**: See `HOSTING_GUIDE.md`
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **Pre-Deploy**: See `pre-deploy-check.md`

---

## 🚀 Next Steps

1. **Custom Domain**: Buy domain, add in Vercel settings
2. **Email Setup**: Configure SMTP in Supabase
3. **Analytics**: Already included (Vercel Analytics)
4. **Monitoring**: Set up Supabase alerts
5. **Backups**: Enable daily backups in Supabase

---

**Need help?** Check the full HOSTING_GUIDE.md for detailed instructions.

**Ready to scale?** Upgrade to Pro tiers when you hit 100+ active users.
