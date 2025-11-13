# 🚀 Deployment Guide for Hosting Person

## What You're Getting
A complete Next.js trading platform with gamification system ready for cPanel hosting.

## 📁 Key Files You Need

### 1. Database Setup
- **`mysql-schema.sql`** ← Import this to create all database tables
- **`mysql-sample-data.sql`** ← Optional demo data

### 2. Configuration
- **`.env.example`** ← Rename to `.env.local` and add your database credentials

### 3. Migration (Optional)
- **`scripts/migrate-to-mysql.js`** ← Run this to fully migrate from Supabase

## ⚡ Quick Setup (15 minutes)

### Step 1: Create MySQL Database
1. cPanel → MySQL Databases
2. Create database: `trading_platform`
3. Create user with strong password
4. Assign user to database (ALL PRIVILEGES)

### Step 2: Import Database
1. cPanel → phpMyAdmin
2. Select your database
3. Import → Upload `mysql-schema.sql`
4. Import → Upload `mysql-sample-data.sql` (optional)

### Step 3: Configure Environment
1. Rename `.env.example` to `.env.local`
2. Update with your database credentials:
```env
DB_HOST=localhost
DB_USER=your_cpanel_username_dbuser
DB_PASSWORD=your_database_password
DB_NAME=your_cpanel_username_trading_platform
DB_PORT=3306
```

### Step 4: Deploy
1. Upload all files to cPanel
2. cPanel → Node.js Selector → Create app
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Start application

## ✅ Verification
- Main site should load at your domain
- All trading features should work
- Gamification system should be functional
- Admin dashboard accessible at `/admin`

## 🆘 Need Help?
- Check cPanel error logs
- Verify database connection
- Ensure Node.js 18+ is selected
- Confirm all files uploaded correctly

**That's it! The platform will be fully functional with MySQL database.**