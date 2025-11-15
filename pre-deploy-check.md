# 🚀 Pre-Deployment Checklist

Run through this before deploying to production.

## ✅ Code Quality

```bash
# 1. Build locally to catch errors
npm run build

# 2. Check for TypeScript errors
npx tsc --noEmit

# 3. Run linter
npm run lint
```

## ✅ Environment Variables

- [ ] `.env.local` has all required variables
- [ ] Supabase URL is correct
- [ ] Supabase keys are valid
- [ ] No sensitive data in code

## ✅ Supabase Setup

- [ ] Run `lib/supabase/SETUP_COMPLETE.sql` in Supabase SQL Editor
- [ ] Storage bucket 'documents' exists
- [ ] RLS policies are enabled
- [ ] Auth settings configured
- [ ] Email templates customized

## ✅ Security

- [ ] All API routes have proper authentication
- [ ] RLS policies tested for each user role
- [ ] File upload size limits set
- [ ] CORS configured in Supabase
- [ ] No console.logs with sensitive data

## ✅ Git Repository

```bash
# Ensure everything is committed
git status

# Push to GitHub
git add .
git commit -m "Ready for production deployment"
git push origin main
```

## ✅ Vercel Configuration

1. **Import Project**
   - [ ] Connected to GitHub repository
   - [ ] Framework preset: Next.js
   - [ ] Root directory: ./

2. **Environment Variables** (Add in Vercel Dashboard)
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_APP_URL
   ```

3. **Build Settings**
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `.next`
   - [ ] Install Command: `npm install`

## ✅ Post-Deployment Tests

After deployment, test these flows:

### Authentication
- [ ] Sign up new user
- [ ] Verify email (if enabled)
- [ ] Log in
- [ ] Log out
- [ ] Password reset

### Core Features
- [ ] Create company
- [ ] Start IPO application
- [ ] Fill out sections
- [ ] Upload documents
- [ ] Submit application
- [ ] View as different roles (Issuer, IB Advisor, CMA Regulator)

### Performance
- [ ] Page load time < 3 seconds
- [ ] Images load properly
- [ ] Mobile responsive
- [ ] Works on different browsers

### Security
- [ ] HTTPS enabled (green lock icon)
- [ ] Users can't access other users' data
- [ ] API routes require authentication
- [ ] File uploads work correctly

## 🎯 Success Criteria

Your deployment is successful when:

✅ All tests pass
✅ No console errors
✅ All user roles work
✅ Data persists correctly
✅ Files upload successfully
✅ Email notifications work
✅ Mobile experience is smooth
✅ Performance is acceptable

## 📞 If Something Goes Wrong

### Build Fails
1. Check Vercel build logs
2. Run `npm run build` locally
3. Fix errors and push again

### Runtime Errors
1. Check Vercel Function logs
2. Verify environment variables
3. Check Supabase connection

### Database Issues
1. Verify RLS policies
2. Check table structure
3. Re-run setup SQL if needed

---

**Ready to Deploy?** Follow HOSTING_GUIDE.md for step-by-step instructions.
