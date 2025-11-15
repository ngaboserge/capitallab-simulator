# Deploy to Vercel via CLI (Alternative Method)

## Install Vercel CLI

```bash
npm install -g vercel
```

## Login to Vercel

```bash
vercel login
```

## Deploy

```bash
# First deployment
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? capitallab-simulator
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://luihumdrijeleuqujhyd.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste your anon key

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste your service role key

# Deploy to production
vercel --prod
```

## Your app will be live at:
https://capitallab-simulator.vercel.app (or similar)

## Update Supabase
Go to Supabase Dashboard → Authentication → URL Configuration
Add your Vercel URL as Site URL and Redirect URL
