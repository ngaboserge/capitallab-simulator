# Custom Domain Setup Guide - Connecting Your Domain to Vercel

## Overview
You have a domain purchased from a web hosting provider and want to connect it to your Vercel-hosted app.

---

## Part 1: Add Domain in Vercel (Do This First)

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com
2. Log in to your account
3. Click on your project: **capitallab-simulator**

### Step 2: Navigate to Domains Settings
1. Click on the **Settings** tab at the top
2. Click on **Domains** in the left sidebar

### Step 3: Add Your Custom Domain
1. In the "Add Domain" field, type your domain name
   - Example: `yourdomain.com` or `www.yourdomain.com`
2. Click **Add**

### Step 4: Note the DNS Records
Vercel will show you DNS records that need to be configured. You'll see something like:

**Option A - Using A Record (Recommended for root domain):**
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
```

**Option B - Using CNAME Record (For www subdomain):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Keep this page open** - you'll need these values in the next part.

---

## Part 2: Configure DNS at Your Web Hosting Provider

### Step 1: Log in to Your Web Hosting Control Panel
1. Go to your web hosting provider's website
2. Log in with your credentials
3. Look for one of these sections:
   - **Domain Management**
   - **DNS Management**
   - **DNS Settings**
   - **Name Servers**
   - **cPanel** (if they use cPanel)

### Step 2: Find DNS/Domain Settings
Common locations depending on your provider:
- **cPanel**: Domains → Zone Editor
- **Plesk**: Domains → DNS Settings
- **Custom Panel**: Look for "DNS", "Domain", or "Name Servers"

### Step 3: Choose Your Configuration Method

#### **Method A: Point Root Domain (yourdomain.com)**

1. Find the DNS records section
2. Look for existing **A Records** pointing to `@` or your domain
3. **Delete or modify** the existing A record
4. **Add new A Record:**
   - **Type:** A
   - **Host/Name:** @ (or leave blank, or type your domain)
   - **Points to/Value:** `76.76.21.21`
   - **TTL:** 3600 (or leave default)
5. Click **Save** or **Add Record**

#### **Method B: Point WWW Subdomain (www.yourdomain.com)**

1. Find the DNS records section
2. Look for existing **CNAME Records** for `www`
3. **Delete or modify** the existing CNAME record
4. **Add new CNAME Record:**
   - **Type:** CNAME
   - **Host/Name:** www
   - **Points to/Value:** `cname.vercel-dns.com`
   - **TTL:** 3600 (or leave default)
5. Click **Save** or **Add Record**

#### **Method C: Point Both (Recommended)**

Do both Method A and Method B to make both `yourdomain.com` and `www.yourdomain.com` work.

### Step 4: Save Changes
- Click **Save**, **Update**, or **Apply Changes**
- Some providers require you to click a final "Publish" or "Activate" button

---

## Part 3: Verify and Wait for Propagation

### Step 1: Return to Vercel Dashboard
1. Go back to your Vercel project
2. Go to **Settings** → **Domains**
3. You should see your domain with a status indicator

### Step 2: Wait for DNS Propagation
- **Typical time:** 5-30 minutes
- **Maximum time:** Up to 48 hours (rare)
- Vercel will automatically verify the DNS records

### Step 3: Check Domain Status
The domain status in Vercel will show:
- 🟡 **Pending** - DNS not propagated yet (wait)
- 🟢 **Valid** - Domain is connected successfully!
- 🔴 **Invalid Configuration** - DNS records are incorrect (recheck Part 2)

---

## Part 4: Configure SSL Certificate (Automatic)

Once your domain shows as **Valid** in Vercel:
1. Vercel automatically provisions an SSL certificate
2. This usually takes 1-5 minutes
3. Your site will be accessible via `https://yourdomain.com`

---

## Part 5: Set Primary Domain (Optional)

If you added both `yourdomain.com` and `www.yourdomain.com`:

1. In Vercel → Settings → Domains
2. Find the domain you want as primary
3. Click the **⋯** (three dots) next to it
4. Select **Set as Primary Domain**
5. The other domain will automatically redirect to the primary

---

## Common Web Hosting Providers - Specific Instructions

### **Namecheap**
1. Dashboard → Domain List → Manage
2. Advanced DNS tab
3. Add/Edit records in "Host Records" section

### **GoDaddy**
1. My Products → Domains → DNS
2. Scroll to "Records" section
3. Add/Edit records

### **Hostinger**
1. Domains → Manage
2. DNS / Name Servers
3. Manage DNS records

### **Bluehost**
1. Domains → Zone Editor
2. Manage DNS records

### **SiteGround**
1. Site Tools → Domain → DNS Zone Editor
2. Add/Edit records

### **HostGator**
1. cPanel → Domains → Zone Editor
2. Manage records

---

## Troubleshooting

### Domain Not Connecting After 1 Hour?

**Check 1: Verify DNS Records**
Use a DNS checker tool:
- Visit: https://dnschecker.org
- Enter your domain
- Check if A or CNAME records show Vercel's values

**Check 2: Remove Conflicting Records**
In your hosting DNS settings:
- Remove any old A records pointing to other IPs
- Remove any CNAME records pointing to other services
- Remove any URL redirects or forwarding rules

**Check 3: Check Name Servers**
Some hosting providers require you to use their name servers:
- Make sure you're using your hosting provider's name servers
- OR switch to Vercel's name servers (advanced - see below)

### SSL Certificate Not Working?

1. Wait 5-10 minutes after domain verification
2. Try accessing with `https://` explicitly
3. Clear browser cache
4. Check Vercel dashboard for SSL status

### "Invalid Configuration" Error in Vercel?

1. Double-check DNS records match exactly what Vercel shows
2. Make sure there are no typos in the CNAME value
3. Remove any proxy/CDN settings (like Cloudflare orange cloud)
4. Wait 30 minutes and refresh Vercel page

---

## Advanced: Using Vercel Name Servers (Optional)

If you want Vercel to fully manage your DNS:

### Step 1: Get Vercel Name Servers
1. Vercel Dashboard → Settings → Domains
2. Click "Use Vercel DNS" or "Transfer DNS"
3. Note the name servers (usually like `ns1.vercel-dns.com`)

### Step 2: Update at Your Hosting Provider
1. Go to your hosting provider's domain settings
2. Find "Name Servers" or "Custom Name Servers"
3. Replace existing name servers with Vercel's
4. Save changes

**Warning:** This will move ALL DNS management to Vercel. Any email or other services using your domain will need to be reconfigured.

---

## Quick Reference - DNS Records

### For Root Domain (yourdomain.com)
```
Type: A
Name: @ or blank
Value: 76.76.21.21
TTL: 3600
```

### For WWW Subdomain (www.yourdomain.com)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

---

## After Domain is Connected

### Update Environment Variables
1. Go to Vercel → Settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to your custom domain:
   ```
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```
3. Redeploy your application

### Test Your Domain
1. Visit `https://yourdomain.com`
2. Check that SSL (padlock icon) is working
3. Test all pages and functionality
4. Check that redirects work properly

---

## Need Help?

### Check These Resources:
1. **Vercel Docs:** https://vercel.com/docs/concepts/projects/domains
2. **Your Hosting Provider's DNS Guide**
3. **DNS Propagation Checker:** https://dnschecker.org

### Common Issues:
- **"Domain already in use"** - Domain is connected to another Vercel project
- **"Invalid configuration"** - DNS records don't match
- **"Pending verification"** - Wait for DNS propagation (up to 48 hours)

---

## Summary Checklist

- [ ] Add domain in Vercel Dashboard
- [ ] Note the DNS records Vercel provides
- [ ] Log in to web hosting provider
- [ ] Navigate to DNS/Domain settings
- [ ] Add/Update A record for root domain
- [ ] Add/Update CNAME record for www subdomain
- [ ] Save DNS changes
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Verify domain shows as "Valid" in Vercel
- [ ] Wait for SSL certificate (automatic)
- [ ] Update NEXT_PUBLIC_APP_URL environment variable
- [ ] Test your custom domain

**Estimated Total Time:** 30 minutes to 2 hours (mostly waiting for DNS propagation)
