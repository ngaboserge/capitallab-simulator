# 🚀 CapitalLab Platform Hosting Guide

## Overview

Your CapitalLab platform is a Next.js 15 application with Supabase backend. Here's your complete hosting strategy.

---

## 🎯 Recommended Hosting Solution

### **Option 1: Vercel (Recommended) ⭐**

**Why Vercel:**
- Built by Next.js creators - zero configuration needed
- Automatic deployments from GitHub
- Global CDN for fast performance
- Free SSL certificates
- Generous free tier
- Excellent for Rwanda and East Africa

**Pricing:**
- **Hobby (Free)**: Perfect for testing/MVP
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  
- **Pro ($20/month)**: For production launch
  - 1TB bandwidth
  - Advanced analytics
  - Password protection
  - Team collaboration

---

## 📋 Step-by-Step Deployment

### Phase 1: Pre-Deployment Checklist

#### 1. **Verify Supabase is Production-Ready**

```bash
# Check your Supabase project
# Go to: https://supabase.com/dashboard
```

**Verify:**
- [ ] Database tables created (run SETUP_COMPLETE.sql)
- [ ] Storage bucket 'documents' exists
- [ ] RLS policies are active
- [ ] Auth settings configured

#### 2. **Update Environment Variables**

Create `.env.production` for reference:

```env
# Production URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME="CapitalLab - Rwanda Capital Markets Platform"

# Supabase (same as .env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 3. **Security Hardening**

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mysql2'],
  images: {
    domains: ['luihumdrijeleuqujhyd.supabase.co'], // Your Supabase domain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable for production
  },
  typescript: {
    ignoreBuildErrors: false, // Enable for production
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
```

---

### Phase 2: Deploy to Vercel

#### Step 1: Push to GitHub

```bash
# Ensure everything is committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

#### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js

#### Step 3: Configure Environment Variables

In Vercel dashboard:

```
Settings > Environment Variables > Add

NEXT_PUBLIC_SUPABASE_URL = https://luihumdrijeleuqujhyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
```

**Important:** Add to all environments (Production, Preview, Development)

#### Step 4: Deploy

```bash
# Vercel will automatically:
# 1. Install dependencies
# 2. Run build
# 3. Deploy to global CDN
# 4. Provide HTTPS URL
```

#### Step 5: Custom Domain (Optional)

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Vercel: Settings > Domains
3. Add your domain
4. Update DNS records as instructed
5. Wait 24-48 hours for propagation

---

### Phase 3: Supabase Production Configuration

#### 1. **Update Supabase Auth Settings**

Go to: Supabase Dashboard > Authentication > URL Configuration

```
Site URL: https://your-domain.vercel.app
Redirect URLs: 
  - https://your-domain.vercel.app/auth/callback
  - https://your-domain.vercel.app/auth/login
  - https://your-domain.vercel.app/dashboard
```

#### 2. **Configure Email Templates**

Go to: Authentication > Email Templates

Customize:
- Confirmation email
- Password reset
- Magic link

Add your branding and logo.

#### 3. **Set Up Database Backups**

Go to: Database > Backups

- Enable daily backups
- Set retention period (7 days minimum)

#### 4. **Monitor Usage**

Go to: Settings > Usage

Watch:
- Database size
- Storage usage
- Bandwidth
- API requests

---

## 🔒 Security Best Practices

### 1. **Environment Variables**

```bash
# NEVER commit these files:
.env.local
.env.production
.env

# Already in .gitignore - verify:
cat .gitignore | grep .env
```

### 2. **Supabase RLS Policies**

Verify Row Level Security is active:

```sql
-- Check in Supabase SQL Editor
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All should show rowsecurity = true
```

### 3. **API Rate Limiting**

Add to your API routes:

```typescript
// lib/api/rate-limit.ts
export const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}
```

### 4. **CORS Configuration**

Update Supabase settings:
- Settings > API > CORS
- Add your production domain

---

## 📊 Monitoring & Analytics

### 1. **Vercel Analytics**

Already included in your package.json:

```typescript
// app/layout.tsx - add:
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. **Supabase Monitoring**

Dashboard > Reports:
- API requests
- Database performance
- Storage usage
- Active users

### 3. **Error Tracking (Optional)**

Consider adding Sentry:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 💰 Cost Estimation

### Monthly Costs (Production)

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| **Vercel** | Pro | $20 | For production features |
| **Supabase** | Pro | $25 | 8GB database, 100GB storage |
| **Domain** | - | $12/year | .com domain |
| **Total** | - | **~$45/month** | For serious production |

### Free Tier (MVP/Testing)

| Service | Tier | Cost | Limits |
|---------|------|------|--------|
| **Vercel** | Hobby | $0 | 100GB bandwidth |
| **Supabase** | Free | $0 | 500MB database, 1GB storage |
| **Total** | - | **$0** | Good for 100-500 users |

---

## 🚦 Performance Optimization

### 1. **Enable Caching**

```typescript
// app/api/cma/applications/route.ts
export const revalidate = 60 // Cache for 60 seconds
```

### 2. **Image Optimization**

```typescript
// next.config.js - already configured
images: {
  domains: ['*.supabase.co'],
  formats: ['image/avif', 'image/webp'],
}
```

### 3. **Database Indexing**

Run in Supabase SQL Editor:

```sql
-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_applications_company_id 
ON ipo_applications(company_id);

CREATE INDEX IF NOT EXISTS idx_applications_status 
ON ipo_applications(status);

CREATE INDEX IF NOT EXISTS idx_sections_application_id 
ON application_sections(application_id);
```

---

## 🔄 CI/CD Pipeline

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Development
git push origin develop
# → Deploys to preview URL

# Production
git push origin main
# → Deploys to production URL
```

### Preview Deployments

Every pull request gets a unique URL:
- Test before merging
- Share with stakeholders
- No impact on production

---

## 🌍 Rwanda-Specific Considerations

### 1. **CDN & Performance**

Vercel has edge nodes in:
- Europe (closest to Rwanda)
- Africa (South Africa)

Expected latency: 50-150ms

### 2. **Payment Methods**

For Vercel Pro:
- Credit card (Visa/Mastercard)
- PayPal

For Supabase Pro:
- Credit card
- Can use virtual cards (Chipper Cash, etc.)

### 3. **Local Compliance**

Consider:
- Data residency requirements
- Rwanda Data Protection Law
- CMA regulations for financial platforms

### 4. **Backup Strategy**

```bash
# Weekly database exports
# Supabase Dashboard > Database > Backups > Download
```

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Check locally first
npm run build

# Common issues:
# 1. TypeScript errors - fix in code
# 2. Missing env vars - add in Vercel
# 3. Import errors - check paths
```

### Database Connection Issues

```bash
# Verify Supabase URL is correct
# Check RLS policies aren't blocking
# Verify service role key for admin operations
```

### File Upload Errors

```bash
# Check storage bucket exists
# Verify storage policies
# Check file size limits (default 50MB)
```

---

## ✅ Post-Deployment Checklist

- [ ] Site loads at production URL
- [ ] Can create new account
- [ ] Can log in/out
- [ ] Can create company
- [ ] Can start IPO application
- [ ] Can upload documents
- [ ] Email notifications work
- [ ] All user roles function correctly
- [ ] Mobile responsive
- [ ] SSL certificate active (https://)
- [ ] Analytics tracking
- [ ] Error monitoring setup
- [ ] Database backups enabled
- [ ] Team has access credentials

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Your Deployment Checklist**: See DEPLOYMENT_CHECKLIST.md

---

## 🎉 You're Ready!

Your platform is production-ready. Start with the free tier, test thoroughly, then upgrade as you grow.

**Estimated Setup Time**: 1-2 hours
**Recommended Launch**: Start free, upgrade at 100+ active users
