# 🚀 CapitalLab - Advanced Capital Markets Education Platform

A comprehensive capital markets education platform featuring trading simulation, team collaboration, and institutional role-playing. Built with Next.js 15, TypeScript, and MySQL for production-ready deployment.

## 🚀 Features

### CapitalLab - Institutional Capital Markets Simulation
- **Role-Based Learning** - 7 institutional roles: Issuer, IB Advisor, Broker, Investor, Regulator, Listing Desk, CSD Operator
- **Complete Capital Raise Process** - From intent submission to final settlement
- **Regulatory Simulation** - CMA approval process, RSE listing, CSD settlement
- **Educational Artifacts** - Generate PDFs, certificates, contract notes (watermarked for education)
- **Institutional Hierarchy** - Enforced role-based access and interactions
- **Due Diligence Process** - Document requests, KYC, prospectus building
- **Broker-Mediated Trading** - Investors must be activated by brokers to trade

### Trading System
- **Team Trading** - Collaborative trading with voting system
- **Individual Trading** - Personal portfolio management
- **Real-time Market Data** - Live stock prices and charts
- **Advanced Order Types** - Market, limit, and stop orders
- **Portfolio Analytics** - Performance tracking and insights

### Gamification System
- **XP & Leveling** - Earn experience points for trading activities
- **Achievements** - Unlock badges for milestones
- **Daily Streaks** - Maintain consistent trading activity
- **Leaderboards** - Compete with other traders
- **Power-ups** - Special abilities and bonuses

### Admin Dashboard
- **Market Maker Console** - Control market conditions
- **Trading Monitor** - Oversee all trading activities
- **Event Simulator** - Create market events
- **Analytics & Reports** - Comprehensive trading data

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: MySQL (migrated from Supabase for cPanel hosting)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 For Hosting Person

**Everything you need is in this repository:**

1. **Database Files**: `mysql-schema.sql` and `mysql-sample-data.sql`
2. **Configuration**: `.env.example` (rename to `.env.local`)
3. **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
4. **Migration Script**: `scripts/migrate-to-mysql.js`

**Quick Start**: Follow `DEPLOYMENT_GUIDE.md` for 15-minute setup on cPanel.

## 🎯 What's Included

- Complete trading platform with team and individual modes
- MySQL database schema and sample data
- Gamification system with XP, achievements, and leaderboards
- Admin dashboard with market maker tools
- Responsive design for all devices
- Production-ready code

## 📋 Requirements

- cPanel hosting with Node.js 18+ support
- MySQL database access
- Basic cPanel management skills

## 🚀 Quick Deployment

1. **Download**: Clone or download this repository
2. **Database**: Import `mysql-schema.sql` to your MySQL database
3. **Configure**: Update `.env.local` with your database credentials
4. **Deploy**: Upload to cPanel and follow `DEPLOYMENT_GUIDE.md`

## 🔧 Key Features

### Trading Modes
- **Individual**: `/individual` - Personal trading dashboard
- **Team**: `/team` - Collaborative trading with voting
- **Admin**: `/admin` - Market maker and monitoring tools

### Pages Available
- Main dashboard with market overview
- Professional trading interface
- Gamification hub with achievements
- Real-time leaderboards and analytics
- **CapitalLab institutional dashboards** for each role

### CapitalLab Roles & Dashboards
- **Issuer** (`/capitallab/issuer`) - Submit capital raise intents, respond to due diligence
- **IB Advisor** (`/capitallab/ib-advisor`) - Manage due diligence, create prospectus filings
- **Broker** (`/capitallab/broker`) - Activate investors, execute trades
- **Investor** (`/capitallab/investor`) - Broker-mediated portfolio management
- **Regulator** (`/capitallab/regulator`) - Review and approve/reject filings
- **Listing Desk** (`/capitallab/listing-desk`) - Create virtual ISINs, approve listings
- **CSD Operator** (`/capitallab/csd`) - Manage registry, process settlements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
