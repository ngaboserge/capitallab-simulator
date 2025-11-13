# CapitalLab - Software Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture](#architecture)
4. [User Roles & Workflows](#user-roles--workflows)
5. [Core Features](#core-features)
6. [Technical Stack](#technical-stack)
7. [Database Schema](#database-schema)
8. [API Documentation](#api-documentation)
9. [Authentication & Authorization](#authentication--authorization)
10. [Deployment Guide](#deployment-guide)
11. [User Guide](#user-guide)
12. [Troubleshooting](#troubleshooting)

---

## Executive Summary

**CapitalLab** is a comprehensive capital markets education and simulation platform that replicates the complete Initial Public Offering (IPO) process in Rwanda. The platform enables collaborative learning through role-based simulations where users experience real-world workflows of issuers, investment bank advisors, regulators, and other market participants.

### Key Highlights
- **Educational Focus**: Hands-on learning of Rwanda's capital markets regulatory framework
- **Collaborative Simulation**: Multi-role workflow from IPO application to market listing
- **Regulatory Compliance**: Based on actual CMA Rwanda requirements and processes
- **Real-time Collaboration**: Teams work together across different roles
- **Production-Ready**: Built with Next.js 15, TypeScript, and Supabase

---

## System Overview

### Purpose
CapitalLab simulates the complete lifecycle of an IPO in Rwanda, from initial application through regulatory approval to market listing. It serves as:
- **Training Platform** for financial professionals
- **Educational Tool** for students and institutions
- **Process Simulator** for companies preparing for IPO
- **Regulatory Training** for understanding CMA requirements

### Core Workflow
```
Issuer Company → IB Advisor → CMA Regulator → SHORA Exchange → CSD Registry
                                    ↓
                            Brokers & Investors
```


### Platform Modes

1. **Educational Mode** (`/capitallab/education`)
   - Interactive learning modules
   - Role-based tutorials
   - Market process education
   - Progress tracking

2. **Collaborative Hub** (`/capitallab/collaborative`)
   - Real-time multi-role simulation
   - Live workflow processes
   - Team-based collaboration
   - 7 market roles available

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPITALLAB PLATFORM                       │
├─────────────────────────────────────────────────────────────┤
│  Frontend Layer (Next.js 15 + React 19)                    │
│  ├── Issuer Dashboard                                       │
│  ├── IB Advisor Dashboard                                   │
│  ├── CMA Regulator Dashboard                                │
│  ├── SHORA Exchange Dashboard                               │
│  ├── CSD Registry Dashboard                                 │
│  ├── Broker Dashboard                                       │
│  └── Investor Dashboard                                     │
├─────────────────────────────────────────────────────────────┤
│  API Layer (Next.js API Routes)                            │
│  ├── Authentication APIs                                    │
│  ├── Application Management APIs                            │
│  ├── Document Management APIs                               │
│  ├── Section Management APIs                                │
│  ├── Review & Approval APIs                                 │
│  └── Notification APIs                                      │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                       │
│  ├── Application Service                                    │
│  ├── Section Service                                        │
│  ├── Document Service                                       │
│  ├── Validation Engine                                      │
│  └── Workflow Engine                                        │
├─────────────────────────────────────────────────────────────┤
│  Data Layer (Supabase PostgreSQL)                          │
│  ├── Companies                                              │
│  ├── Profiles                                               │
│  ├── IPO Applications                                       │
│  ├── Application Sections                                   │
│  ├── Documents                                              │
│  ├── Comments                                               │
│  ├── CMA Reviews                                            │
│  ├── Notifications                                          │
│  └── Audit Logs                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

**Frontend Components:**
- Role-specific dashboards for each market participant
- Reusable form components for data entry
- Document upload and management components
- Real-time notification system
- Progress tracking and analytics

**Backend Services:**
- RESTful API endpoints for all operations
- Row-Level Security (RLS) for data protection
- Automated triggers for workflow management
- Real-time subscriptions for live updates


---

## User Roles & Workflows

### 1. Issuer Company (Issuer)

**Role Description:**  
Companies seeking to raise capital through public offerings. The issuer team completes the comprehensive 10-section IPO application.

**Team Structure:**
- **CEO**: Strategic leadership, company vision, final approvals
- **CFO**: Financial reporting, capitalization, offer structuring
- **Legal Advisor**: Legal compliance, regulatory requirements, risk management
- **Company Secretary**: Corporate governance, administration, regulatory coordination

**Workflow:**
1. Create company account and set up team
2. Complete 10-section IPO application:
   - Section 1: Company Identity & Legal Form
   - Section 2: Capitalization & Financial Strength
   - Section 3: Share Ownership & Distribution
   - Section 4: Governance & Management
   - Section 5: Legal & Regulatory Compliance
   - Section 6: Offer Details (IPO Information)
   - Section 7: Prospectus & Disclosure Checklist
   - Section 8: Publication & Advertisement
   - Section 9: Post-Approval Undertakings
   - Section 10: Declarations & Contacts
3. Upload required documents for each section
4. Select and assign IB Advisor
5. Transfer application to IB Advisor for review
6. Respond to queries from IB Advisor or CMA
7. Receive approval and proceed to listing

**Key Features:**
- Role-based section access (each team member sees only their sections)
- Auto-save functionality for all form data
- Document upload with validation
- Progress tracking dashboard
- Real-time notifications
- Team collaboration tools

**Access Routes:**
- Dashboard: `/capitallab/collaborative/issuer`
- Section Forms: `/capitallab/collaborative/issuer/sections/[sectionId]`
- Team Setup: `/auth/signup-team`
- Join Team: `/auth/join-team`

---

### 2. Investment Bank Advisor (IB Advisor)

**Role Description:**  
Professional advisors who structure deals, review issuer applications, and guide companies through the regulatory process.

**Responsibilities:**
- Review and take issuer applications
- Structure deal terms and pricing
- Conduct due diligence
- Prepare regulatory filings
- Provide feedback to issuers
- Submit structured deals to CMA

**Workflow:**
1. View pending issuer applications
2. Take application for review
3. Review all 10 sections and documents
4. Structure deal (pricing, shares, fees, timeline)
5. Provide feedback to issuer if needed
6. Prepare final submission package
7. Submit to CMA for regulatory review

**Key Features:**
- Application queue management
- Document review interface
- Deal structuring calculator
- Feedback management system
- Compliance checklist
- CMA submission workflow

**Access Routes:**
- Dashboard: `/capitallab/collaborative/ib-advisor`
- Signup: `/auth/ib-advisor-signup`
- Login: `/auth/ib-advisor-login`


---

### 3. CMA Regulator

**Role Description:**  
Capital Markets Authority regulatory officers who review and approve IPO applications to protect investors and ensure market integrity.

**Responsibilities:**
- Review submitted applications for compliance
- Conduct detailed regulatory analysis
- Issue queries and information requests
- Approve or reject applications with reasoning
- Monitor ongoing regulatory compliance
- Enforce CMA regulations

**Workflow:**
1. View regulatory queue of submitted applications
2. Select application for review
3. Conduct compliance assessment:
   - Financial strength verification
   - Governance structure review
   - Legal compliance check
   - Disclosure adequacy assessment
   - Risk rating determination
4. Issue queries if additional information needed
5. Make final decision (Approve/Reject/Query)
6. Generate official decision letter
7. Monitor post-approval compliance

**Key Features:**
- Regulatory dashboard with SLA tracking
- Detailed compliance checklist
- Risk assessment tools
- Query management system
- Decision templates
- Audit trail logging

**Access Routes:**
- Dashboard: `/capitallab/collaborative/cma-regulator`
- Mock Mode: `/capitallab/collaborative/cma-regulator-mock`

---

### 4. SHORA Exchange Listing Desk

**Role Description:**  
Rwanda Stock Exchange listing officers who manage instrument listings and create ISIN codes.

**Responsibilities:**
- Create ISIN codes for approved securities
- List approved instruments on the exchange
- Manage trading sessions
- Maintain market data
- Monitor listing compliance

**Status:** Pending Implementation

**Access Routes:**
- Dashboard: `/capitallab/collaborative/rse-listing`

---

### 5. CSD Registry

**Role Description:**  
Central Securities Depository operators who maintain authoritative ownership records and process settlements.

**Responsibilities:**
- Maintain share registry
- Process settlements
- Issue ownership certificates
- Handle corporate actions
- Manage shareholder records

**Status:** Pending Implementation

**Access Routes:**
- Dashboard: `/capitallab/collaborative/csd-registry`

---

### 6. Licensed Broker

**Role Description:**  
Licensed brokers who facilitate investor access and execute trades on behalf of clients.

**Responsibilities:**
- Activate investor accounts
- Execute buy/sell orders
- Manage client portfolios
- Provide market access
- Ensure trade compliance

**Status:** Pending Implementation

**Access Routes:**
- Dashboard: `/capitallab/collaborative/licensed-broker`

---

### 7. Investor

**Role Description:**  
Individual or institutional investors who participate in IPOs and trade securities.

**Responsibilities:**
- Request account activation from broker
- Place IPO orders
- Monitor portfolio performance
- Execute secondary market trades
- Receive dividends and corporate actions

**Status:** Pending Implementation

**Access Routes:**
- Dashboard: `/capitallab/collaborative/investor`


---

## Core Features

### 1. IPO Application System

**10-Section Application Form:**

**Section 1: Company Identity & Legal Form**
- Legal name, trading name, company type
- Registration number and incorporation date
- Registered address and contact information
- Certificate of Incorporation upload
- Memorandum and Articles of Association upload

**Section 2: Capitalization & Financial Strength**
- Authorized share capital (minimum RWF 500M)
- Paid-up share capital
- Net assets before offer (minimum RWF 1B)
- Audited financial statements (IFRS-compliant)
- Auditor's unqualified opinion

**Section 3: Share Ownership & Distribution**
- Total issued shares
- Shares to be offered to public
- Public shareholding percentage (minimum 25%)
- Expected number of shareholders (minimum 1,000)
- Free transferability confirmation
- Share register and ownership structure

**Section 4: Governance & Management**
- Board of Directors details (with independent director)
- Senior management information
- Fit-and-proper declarations
- Qualifications and experience
- No bankruptcy/conviction confirmations

**Section 5: Legal & Regulatory Compliance**
- Business licenses
- Tax clearance certificates
- Legal compliance statement
- Material contracts and obligations
- Ongoing litigation disclosure

**Section 6: Offer Details (IPO Information)**
- Offer type (Equity/Debt/Hybrid)
- Total amount to raise
- Number of securities and price per security
- Use of proceeds
- Offer timetable
- Underwriting agreement
- Advisor mandate letter
- Bank and registrar agreements

**Section 7: Prospectus & Disclosure Checklist**
- Full prospectus
- Abridged prospectus
- Expert consents (auditor, legal counsel, valuer)
- Risk factors summary
- Project timeline
- Capital structure table
- Fee disclosure

**Section 8: Publication & Advertisement**
- Newspaper prospectus copy
- Electronic subscription form
- CMA submission timing (48 hours before publication)
- Advertisement approval tracking

**Section 9: Post-Approval Undertakings**
- Lock-up undertaking by controlling shareholders
- Prospectus publication confirmation (2 national newspapers)
- CMA approval letter
- Continuous disclosure obligations

**Section 10: Declarations & Contacts**
- Authorized officer details and signature
- Investment adviser confirmation
- Truthfulness and completeness declaration
- Digital signature with timestamp


### 2. Document Management System

**Features:**
- Secure file upload with validation
- Support for PDF, DOC, XLS, and image formats
- Virus scanning and security validation
- Document categorization and tagging
- Version control and history tracking
- In-browser document preview
- Access control and encryption
- Audit trail for all document operations

**Storage:**
- Supabase Storage for production
- LocalStorage for demo/offline mode
- Automatic backup and recovery

**Document Categories:**
- Corporate documents (incorporation, articles)
- Financial documents (audited statements, opinions)
- Legal documents (licenses, clearances, contracts)
- Governance documents (fit-and-proper declarations)
- Prospectus documents (full, abridged, consents)
- Supporting documents (risk factors, timelines, structures)

---

### 3. Validation Engine

**Real-time Validation:**
- Field-level validation with immediate feedback
- Section-level validation before completion
- Application-level validation before submission
- Server-side validation for security

**Validation Rules:**
- Minimum capital requirements (RWF 500M authorized, RWF 1B net assets)
- Public float requirements (25% minimum, 1000+ shareholders)
- Document completeness and format validation
- Timeline and deadline compliance
- Board composition requirements (independent director)
- Financial threshold calculations

**Compliance Scoring:**
- Automated compliance score calculation
- Risk rating determination (LOW/MEDIUM/HIGH)
- Section completion tracking
- Overall application readiness assessment

---

### 4. Workflow Management

**Application Status Flow:**
```
DRAFT → IN_PROGRESS → SUBMITTED → IB_REVIEW → IB_APPROVED → 
CMA_REVIEW → QUERY_ISSUED → UNDER_REVIEW → APPROVED/REJECTED
```

**Phase Tracking:**
- DATA_COLLECTION: Issuer completing application
- IB_REVIEW: IB Advisor reviewing and structuring
- CMA_SUBMISSION: Submitted to CMA
- CMA_REVIEW: Under regulatory review
- COMPLETED: Final decision made

**Automated Triggers:**
- Application number generation (CMA-IPO-YYYY-NNNN)
- Completion percentage calculation
- Status change notifications
- SLA deadline tracking
- Audit log creation

---

### 5. Team Collaboration

**Issuer Team Features:**
- Role-based access control
- Section assignment by role
- Team member invitation system
- Collaborative editing
- Internal comments and notes
- Activity tracking

**Cross-Role Collaboration:**
- Issuer ↔ IB Advisor communication
- IB Advisor ↔ CMA communication
- Query and response management
- Document sharing
- Status updates and notifications

---

### 6. Notification System

**Notification Types:**
- APPLICATION_SUBMITTED
- APPLICATION_ASSIGNED
- COMMENT_ADDED
- STATUS_CHANGED
- QUERY_ISSUED
- DECISION_MADE
- INFO, WARNING, ERROR, SUCCESS

**Delivery Methods:**
- In-app notifications
- Real-time updates via Supabase subscriptions
- Email notifications (configurable)
- Priority-based routing (LOW/MEDIUM/HIGH/URGENT)

**Features:**
- Read/unread tracking
- Action URLs for quick access
- Metadata for context
- Bulk mark as read
- Notification history


---

## Technical Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context API
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Subscriptions

### Development Tools
- **Package Manager**: npm/yarn
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Version Control**: Git

### Deployment
- **Hosting**: Vercel (recommended) or cPanel
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Environment**: Node.js 18+

---

## Database Schema

### Core Tables

**1. companies**
```sql
- id: UUID (PK)
- legal_name: TEXT
- trading_name: TEXT
- registration_number: TEXT (UNIQUE)
- incorporation_date: DATE
- business_description: TEXT
- industry_sector: TEXT
- registered_address: JSONB
- contact_info: JSONB
- status: TEXT (ACTIVE/INACTIVE/SUSPENDED)
- created_by: UUID
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**2. profiles**
```sql
- id: UUID (PK, FK to auth.users)
- email: TEXT (UNIQUE)
- username: TEXT (UNIQUE)
- full_name: TEXT
- role: TEXT (ISSUER/IB_ADVISOR/CMA_REGULATOR/CMA_ADMIN)
- company_id: UUID (FK to companies)
- company_role: TEXT (CEO/CFO/LEGAL_ADVISOR/SECRETARY/etc.)
- avatar_url: TEXT
- phone: TEXT
- is_active: BOOLEAN
- last_login: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**3. ipo_applications**
```sql
- id: UUID (PK)
- company_id: UUID (FK to companies)
- application_number: TEXT (UNIQUE, auto-generated)
- status: TEXT (DRAFT/IN_PROGRESS/SUBMITTED/IB_REVIEW/etc.)
- current_phase: TEXT (DATA_COLLECTION/IB_REVIEW/CMA_REVIEW/etc.)
- completion_percentage: INTEGER (0-100)
- target_amount: DECIMAL(15,2)
- securities_count: BIGINT
- price_per_security: DECIMAL(10,2)
- assigned_ib_advisor: UUID (FK to profiles)
- assigned_cma_officer: UUID (FK to profiles)
- priority: TEXT (LOW/MEDIUM/HIGH/URGENT)
- expected_listing_date: DATE
- submitted_at: TIMESTAMP
- approved_at: TIMESTAMP
- rejected_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**4. application_sections**
```sql
- id: UUID (PK)
- application_id: UUID (FK to ipo_applications)
- section_number: INTEGER (1-10)
- section_title: TEXT
- status: TEXT (NOT_STARTED/IN_PROGRESS/COMPLETED/etc.)
- data: JSONB (section form data)
- validation_errors: JSONB
- completion_percentage: INTEGER (0-100)
- completed_by: UUID (FK to profiles)
- completed_at: TIMESTAMP
- reviewed_by: UUID (FK to profiles)
- reviewed_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- UNIQUE(application_id, section_number)
```

**5. documents**
```sql
- id: UUID (PK)
- application_id: UUID (FK to ipo_applications)
- section_id: UUID (FK to application_sections)
- filename: TEXT
- original_name: TEXT
- file_path: TEXT
- file_size: BIGINT
- mime_type: TEXT
- category: TEXT
- description: TEXT
- version: INTEGER
- checksum: TEXT
- uploaded_by: UUID (FK to profiles)
- uploaded_at: TIMESTAMP
- is_active: BOOLEAN
- is_confidential: BOOLEAN
```


**6. comments**
```sql
- id: UUID (PK)
- application_id: UUID (FK to ipo_applications)
- section_id: UUID (FK to application_sections)
- document_id: UUID (FK to documents)
- author_id: UUID (FK to profiles)
- content: TEXT
- comment_type: TEXT (GENERAL/QUERY/FEEDBACK/APPROVAL/REJECTION)
- is_internal: BOOLEAN
- is_resolved: BOOLEAN
- priority: TEXT (LOW/MEDIUM/HIGH)
- parent_comment_id: UUID (FK to comments)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**7. cma_reviews**
```sql
- id: UUID (PK)
- application_id: UUID (FK to ipo_applications)
- reviewer_id: UUID (FK to profiles)
- review_type: TEXT (INITIAL_REVIEW/DETAILED_REVIEW/etc.)
- status: TEXT (PENDING/IN_PROGRESS/COMPLETED/ON_HOLD)
- compliance_score: INTEGER (0-100)
- risk_rating: TEXT (LOW/MEDIUM/HIGH/CRITICAL)
- decision: TEXT (APPROVE/REJECT/QUERY/DEFER)
- decision_reason: TEXT
- conditions: JSONB
- recommendations: JSONB
- review_checklist: JSONB
- started_at: TIMESTAMP
- completed_at: TIMESTAMP
- due_date: TIMESTAMP
```

**8. notifications**
```sql
- id: UUID (PK)
- recipient_id: UUID (FK to profiles)
- sender_id: UUID (FK to profiles)
- title: TEXT
- message: TEXT
- type: TEXT (APPLICATION_SUBMITTED/COMMENT_ADDED/etc.)
- application_id: UUID (FK to ipo_applications)
- section_id: UUID (FK to application_sections)
- priority: TEXT (LOW/MEDIUM/HIGH/URGENT)
- is_read: BOOLEAN
- action_url: TEXT
- metadata: JSONB
- created_at: TIMESTAMP
```

**9. audit_logs**
```sql
- id: UUID (PK)
- table_name: TEXT
- record_id: UUID
- action: TEXT (INSERT/UPDATE/DELETE/LOGIN/LOGOUT/etc.)
- old_values: JSONB
- new_values: JSONB
- changed_by: UUID (FK to profiles)
- changed_at: TIMESTAMP
- ip_address: INET
- user_agent: TEXT
- application_id: UUID (FK to ipo_applications)
```

### Database Functions

**1. update_updated_at_column()**
- Automatically updates `updated_at` timestamp on row updates

**2. generate_application_number()**
- Generates unique application numbers in format: CMA-IPO-YYYY-NNNN
- Example: CMA-IPO-2025-0001

**3. calculate_application_completion()**
- Calculates completion percentage based on completed sections
- Updates `ipo_applications.completion_percentage`

**4. create_audit_log()**
- Creates audit log entries for all table operations
- Tracks INSERT, UPDATE, DELETE operations

### Indexes

Performance-optimized indexes on:
- Foreign keys (company_id, application_id, etc.)
- Status fields for filtering
- Username and email for authentication
- Created_at timestamps for sorting
- Application numbers for lookup

### Row-Level Security (RLS)

All tables have RLS enabled with policies for:
- **Issuers**: Can only access their own company data
- **IB Advisors**: Can access assigned applications
- **CMA Regulators**: Can access all submitted applications
- **CMA Admins**: Full access to all data


---

## API Documentation

### Base URL
All API endpoints are prefixed with `/api/cma`

### Authentication
All endpoints require authentication via Supabase session cookies.

### Applications API

**GET /api/cma/applications**
- Get applications based on user role
- Returns: Array of applications with company details

**POST /api/cma/applications**
- Create new application (Issuer only)
- Body: `{ target_amount: number }`
- Returns: Created application object

**GET /api/cma/applications/[id]**
- Get specific application with full details
- Returns: Application with sections, team, documents

**PATCH /api/cma/applications/[id]**
- Update application details
- Body: `{ target_amount?, current_phase?, status? }`
- Returns: Updated application

**POST /api/cma/applications/[id]/submit**
- Submit application for CMA review (CEO only)
- Requires: All sections completed
- Returns: Updated application with SUBMITTED status

**POST /api/cma/applications/[id]/recalculate-completion**
- Recalculate completion percentage
- Returns: Updated completion percentage

### Sections API

**GET /api/cma/applications/[id]/sections**
- Get all sections for an application
- Returns: Array of sections with data and status

**PATCH /api/cma/applications/[id]/sections/[sectionId]**
- Update section data and status
- Body: `{ status?, data? }`
- Returns: Updated section

**POST /api/cma/applications/[id]/sections/[sectionId]/complete**
- Mark section as completed
- Returns: Updated section with COMPLETED status

### IB Advisor API

**GET /api/cma/ib-advisors**
- Get list of available IB Advisors
- Returns: Array of IB Advisor profiles

**POST /api/cma/applications/[id]/assign-ib**
- Assign IB Advisor to application (CEO only)
- Body: `{ ib_advisor_id: string }`
- Returns: Updated application with assigned advisor

**DELETE /api/cma/applications/[id]/assign-ib**
- Remove IB Advisor assignment (CEO only)
- Returns: Updated application

### CMA Review API

**POST /api/cma/applications/[id]/review**
- CMA Regulator review actions
- Body: `{ action, comment?, risk_rating?, compliance_score? }`
- Actions: START_REVIEW, ISSUE_QUERY, APPROVE, REJECT
- Returns: Updated application and review record

### Comments API

**GET /api/cma/applications/[id]/comments**
- Get comments for application
- Query: `?section_id=uuid` (optional)
- Returns: Array of comments with author details

**POST /api/cma/applications/[id]/comments**
- Add comment to application
- Body: `{ content, section_id?, is_internal?, parent_comment_id? }`
- Returns: Created comment

### Documents API

**POST /api/cma/documents/upload**
- Upload document
- Body: FormData with file and metadata
- Returns: Created document record

**GET /api/cma/documents/[id]**
- Get document metadata
- Returns: Document details

**GET /api/cma/documents/[id]/download**
- Download document file
- Returns: File stream

**DELETE /api/cma/documents/[id]**
- Delete document
- Returns: Success message

**GET /api/cma/applications/[id]/documents**
- Get all documents for application
- Query: `?section_id=uuid` (optional)
- Returns: Array of documents

### Notifications API

**GET /api/cma/notifications**
- Get user notifications
- Query: `?unread_only=boolean&limit=number`
- Returns: Array of notifications

**PATCH /api/cma/notifications**
- Mark notifications as read
- Body: `{ notification_ids: string[], mark_all?: boolean }`
- Returns: Success message

### Companies API

**GET /api/cma/companies/[id]**
- Get company details
- Returns: Company information

**PATCH /api/cma/companies/[id]**
- Update company details
- Body: Company fields to update
- Returns: Updated company


---

## Authentication & Authorization

### Authentication System

**Simple Authentication (Username/Password)**
- No email verification required
- Username and password-based login
- Secure JWT-based session management
- HTTP-only cookies for session storage
- Automatic session refresh

### User Roles

**1. ISSUER**
- Company seeking IPO listing
- Automatically creates company profile during signup
- Can create and manage IPO applications
- Team-based with sub-roles (CEO, CFO, Legal, Secretary)

**2. IB_ADVISOR**
- Investment Bank Advisor
- Reviews issuer applications
- Structures deals and provides guidance
- Submits applications to CMA

**3. CMA_REGULATOR**
- CMA Regulatory Officer
- Reviews submitted applications
- Issues queries and requests changes
- Approves or rejects applications

**4. CMA_ADMIN**
- CMA Administrator
- Full system access
- User management
- System configuration

### Authorization (Row-Level Security)

**Issuer Access:**
- Can only view/edit their own company's applications
- Role-based section access within team
- Cannot view other companies' data

**IB Advisor Access:**
- Can view applications assigned to them
- Can view all submitted applications (for taking)
- Cannot modify issuer data directly

**CMA Regulator Access:**
- Can view all submitted applications
- Can add comments and reviews
- Can change application status
- Cannot modify issuer data directly

**CMA Admin Access:**
- Full access to all data
- User management capabilities
- System configuration access

### API Routes

**POST /api/auth/signup**
- Create new user account
- Body: `{ username, password, email, fullName, role, companyName? }`
- Returns: User object and session

**POST /api/auth/login**
- Authenticate user
- Body: `{ username, password }`
- Returns: User object and session

**POST /api/auth/logout**
- End user session
- Returns: Success message

**GET /api/auth/session**
- Get current user session
- Returns: User and profile data

### Team Management

**POST /api/auth/signup-team**
- Create issuer team
- Body: `{ companyName, ceoName, ceoEmail, ceoUsername, password }`
- Returns: Company and CEO profile

**POST /api/auth/join-team**
- Join existing issuer team
- Body: `{ inviteCode, username, password, role }`
- Returns: User profile with company assignment

### Protected Routes

**Client-Side Protection:**
```typescript
<SimpleProtectedRoute allowedRoles={['ISSUER']}>
  <IssuerDashboard />
</SimpleProtectedRoute>
```

**Server-Side Protection:**
```typescript
const { user } = await getSession()
if (!user || !['CMA_REGULATOR', 'CMA_ADMIN'].includes(user.role)) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
```


---

## Deployment Guide

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier available)
- Vercel account (optional, for deployment)
- Git installed

### Environment Setup

**1. Clone Repository**
```bash
git clone <repository-url>
cd capitallab
npm install
```

**2. Configure Environment Variables**

Create `.env.local` file:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**3. Database Setup**

Run SQL scripts in Supabase SQL Editor:
```bash
# 1. Create schema
lib/supabase/schema-backend-integration.sql

# 2. Set up RLS policies
lib/supabase/rls-policies-backend-integration.sql

# 3. Configure storage
lib/supabase/storage-backend-integration.sql
```

**4. Storage Setup**

In Supabase Dashboard:
1. Go to Storage
2. Create bucket: `application-documents`
3. Set bucket to public or private based on requirements
4. Configure RLS policies for bucket access

**5. Local Development**
```bash
npm run dev
```
Access at: http://localhost:3000

### Production Deployment

**Option 1: Vercel (Recommended)**

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

**Option 2: cPanel Hosting**

1. Build the application:
```bash
npm run build
```

2. Upload files to cPanel:
- Upload `.next` folder
- Upload `public` folder
- Upload `package.json`
- Upload `next.config.js`

3. Install dependencies on server:
```bash
npm install --production
```

4. Start application:
```bash
npm start
```

5. Configure Node.js app in cPanel:
- Set application root
- Set application URL
- Set environment variables
- Start application

### Database Migration

If migrating from existing database:
```bash
node scripts/migrate-to-mysql.js
```

### Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test authentication flow
- [ ] Verify file uploads work
- [ ] Check RLS policies are active
- [ ] Test all user roles
- [ ] Verify email notifications (if configured)
- [ ] Check audit logs are working
- [ ] Test real-time subscriptions
- [ ] Verify backup procedures
- [ ] Set up monitoring and alerts

### Monitoring

**Supabase Dashboard:**
- Monitor database performance
- Check API usage
- Review error logs
- Monitor storage usage

**Application Monitoring:**
- Set up error tracking (Sentry recommended)
- Monitor API response times
- Track user activity
- Review audit logs regularly


---

## User Guide

### For Issuer Companies

**Getting Started:**

1. **Create Account**
   - Visit `/auth/signup-team`
   - Enter company details
   - Set up CEO account
   - Receive company ID and invite codes

2. **Invite Team Members**
   - Share invite code with team
   - Team members visit `/auth/join-team`
   - Assign roles: CEO, CFO, Legal Advisor, Secretary

3. **Complete Application**
   - Login at `/capitallab/collaborative/issuer`
   - View role-based dashboard
   - Complete assigned sections (1-10)
   - Upload required documents
   - Save progress automatically

4. **Select IB Advisor**
   - Complete at least 3 sections
   - Click "Select IB Advisor"
   - Choose from available advisors
   - Transfer application for review

5. **Respond to Queries**
   - Monitor notifications
   - Respond to IB Advisor feedback
   - Address CMA queries
   - Update sections as needed

6. **Track Progress**
   - View completion percentage
   - Monitor section status
   - Check team activity
   - Receive status updates

**Section Responsibilities:**

**CEO:**
- Section 1: Company Identity
- Section 7: Prospectus
- Section 10: Declarations
- Final approval authority

**CFO:**
- Section 2: Capitalization
- Section 3: Share Ownership
- Section 6: Offer Details

**Legal Advisor:**
- Section 5: Legal Compliance
- Section 9: Post-Approval Undertakings

**Company Secretary:**
- Section 4: Governance
- Section 8: Publication

---

### For IB Advisors

**Getting Started:**

1. **Create Account**
   - Visit `/auth/ib-advisor-signup`
   - Enter professional details
   - Verify credentials
   - Access dashboard

2. **Review Applications**
   - Login at `/capitallab/collaborative/ib-advisor`
   - View pending applications
   - Review company details
   - Check completion status

3. **Take Application**
   - Select application to review
   - Click "Take Application"
   - Application moves to your queue
   - Begin detailed review

4. **Structure Deal**
   - Review all 10 sections
   - Analyze financial data
   - Structure pricing and terms
   - Calculate fees and timeline
   - Prepare deal summary

5. **Provide Feedback**
   - Add feedback items
   - Categorize issues
   - Set priority levels
   - Send to issuer
   - Track resolution

6. **Submit to CMA**
   - Ensure all sections complete
   - Add IB comments
   - Submit for regulatory review
   - Monitor CMA process

---

### For CMA Regulators

**Getting Started:**

1. **Access Dashboard**
   - Login with CMA credentials
   - Visit `/capitallab/collaborative/cma-regulator`
   - View regulatory queue

2. **Review Applications**
   - Select application from queue
   - Review compliance checklist
   - Analyze financial strength
   - Assess governance structure
   - Evaluate risk rating

3. **Conduct Assessment**
   - Review all 10 sections
   - Verify document completeness
   - Check regulatory compliance
   - Calculate compliance score
   - Determine risk level

4. **Issue Queries**
   - Identify missing information
   - Use query templates
   - Add detailed comments
   - Set response deadline
   - Track issuer response

5. **Make Decision**
   - Review complete application
   - Consider all factors
   - Approve or reject
   - Provide detailed reasoning
   - Generate decision letter

6. **Monitor Compliance**
   - Track SLA deadlines
   - Review post-approval obligations
   - Monitor ongoing compliance
   - Generate reports


---

## Troubleshooting

### Common Issues

**1. Login Issues**

**Problem:** Cannot login with credentials
**Solutions:**
- Verify username and password are correct
- Check if account is active
- Clear browser cookies and cache
- Try different browser
- Check Supabase auth logs

**Problem:** Redirected to wrong dashboard
**Solutions:**
- Verify user role in database
- Check RLS policies are active
- Clear session and login again
- Verify role-based routing logic

---

**2. Application Issues**

**Problem:** Cannot create application
**Solutions:**
- Verify company profile exists
- Check user has ISSUER role
- Verify database connection
- Check RLS policies allow INSERT
- Review error logs

**Problem:** Sections not saving
**Solutions:**
- Check browser console for errors
- Verify API endpoint is accessible
- Check localStorage quota (demo mode)
- Verify database write permissions
- Check network connectivity

**Problem:** Documents not uploading
**Solutions:**
- Check file size (max 50MB)
- Verify file format is supported
- Check Supabase storage bucket exists
- Verify storage RLS policies
- Check network speed
- Try smaller file

---

**3. Team Issues**

**Problem:** Cannot invite team members
**Solutions:**
- Verify you are CEO
- Check company ID is valid
- Generate new invite code
- Verify team member limit not reached

**Problem:** Team member cannot access sections
**Solutions:**
- Verify role assignment
- Check section permissions
- Verify company_id matches
- Review RLS policies
- Check user profile data

---

**4. IB Advisor Issues**

**Problem:** Cannot see applications
**Solutions:**
- Verify IB_ADVISOR role
- Check applications are submitted
- Verify RLS policies
- Check filter settings
- Review database queries

**Problem:** Cannot submit to CMA
**Solutions:**
- Verify all sections completed
- Check IB comments added
- Verify application status
- Check CMA regulator exists
- Review workflow logic

---

**5. CMA Regulator Issues**

**Problem:** Cannot access applications
**Solutions:**
- Verify CMA_REGULATOR role
- Check applications are IB_APPROVED
- Verify RLS policies
- Check filter settings
- Review access permissions

**Problem:** Cannot approve/reject
**Solutions:**
- Verify decision reason provided
- Check application status
- Verify CMA_REGULATOR permissions
- Review workflow constraints
- Check database triggers

---

**6. Performance Issues**

**Problem:** Slow page loading
**Solutions:**
- Check database query performance
- Review indexes on tables
- Optimize RLS policies
- Enable caching
- Check network latency
- Review Supabase dashboard metrics

**Problem:** File upload slow
**Solutions:**
- Check file size
- Verify network speed
- Use CDN for storage
- Compress files before upload
- Check Supabase storage region

---

**7. Data Issues**

**Problem:** Data not syncing
**Solutions:**
- Check real-time subscriptions
- Verify Supabase connection
- Review RLS policies
- Check browser console
- Refresh page
- Clear cache

**Problem:** Missing data
**Solutions:**
- Check database directly
- Verify RLS policies
- Review audit logs
- Check user permissions
- Verify foreign key constraints

---

### Debug Mode

**Enable Debug Logging:**
```typescript
// In browser console
localStorage.setItem('debug', 'true')
```

**Check Application State:**
```typescript
// In browser console
console.log('User:', localStorage.getItem('user'))
console.log('Session:', localStorage.getItem('session'))
```

**Verify Database Connection:**
```typescript
// Test API endpoint
fetch('/api/test-db')
  .then(r => r.json())
  .then(console.log)
```

---

### Getting Help

**Documentation:**
- Review this documentation
- Check API documentation
- Review database schema
- Read code comments

**Support Channels:**
- GitHub Issues
- Email support
- Community forum
- Developer documentation

**Reporting Bugs:**
Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and version
- Error messages
- Screenshots
- User role and permissions


---

## Appendix

### A. CMA Rwanda Regulatory Requirements

**Minimum Requirements for IPO:**
- Authorized share capital: RWF 500 million minimum
- Net assets: RWF 1 billion minimum
- Public float: 25% minimum
- Minimum shareholders: 1,000 post-offer
- Independent director: At least one required
- Audited financials: IFRS-compliant, unqualified opinion
- Company type: Public Limited Company
- Free transferability: Shares must be freely transferable

**Timeline:**
- Application review: 60 working days (SLA)
- IB Advisor review: 2-3 weeks typical
- CMA review: 4-6 weeks typical
- Total process: 3-6 months average

---

### B. Document Requirements Checklist

**Corporate Documents:**
- [ ] Certificate of Incorporation
- [ ] Memorandum and Articles of Association
- [ ] Business licenses
- [ ] Tax clearance certificate

**Financial Documents:**
- [ ] Audited financial statements (3 years)
- [ ] Auditor's opinion letter
- [ ] Financial projections
- [ ] Use of proceeds breakdown

**Governance Documents:**
- [ ] Board composition details
- [ ] Fit-and-proper declarations
- [ ] Director CVs and qualifications
- [ ] Management structure chart

**Legal Documents:**
- [ ] Legal compliance statement
- [ ] Material contracts
- [ ] Litigation disclosure
- [ ] Regulatory approvals

**Prospectus Documents:**
- [ ] Full prospectus
- [ ] Abridged prospectus
- [ ] Expert consents (auditor, legal, valuer)
- [ ] Risk factors summary
- [ ] Capital structure table

**Offer Documents:**
- [ ] Underwriting agreement
- [ ] Advisor mandate letter
- [ ] Bank agreement
- [ ] Registrar agreement
- [ ] Lock-up undertakings

---

### C. Glossary

**CMA**: Capital Markets Authority - Rwanda's securities regulator

**IPO**: Initial Public Offering - First sale of stock by a company to the public

**IB Advisor**: Investment Bank Advisor - Professional advisor who structures deals

**SHORA**: Stock Exchange - Rwanda's securities exchange

**CSD**: Central Securities Depository - Maintains ownership records

**ISIN**: International Securities Identification Number - Unique security identifier

**RLS**: Row-Level Security - Database security feature

**Prospectus**: Formal document describing securities offering

**Public Float**: Percentage of shares available to public investors

**Lock-up**: Period during which insiders cannot sell shares

**Due Diligence**: Comprehensive investigation of business

**Underwriting**: Guarantee to purchase unsold shares

**Compliance Score**: Automated assessment of regulatory compliance

**SLA**: Service Level Agreement - Expected processing time

---

### D. API Response Codes

**Success Codes:**
- 200: OK - Request successful
- 201: Created - Resource created successfully
- 204: No Content - Successful deletion

**Client Error Codes:**
- 400: Bad Request - Invalid request data
- 401: Unauthorized - Authentication required
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource not found
- 409: Conflict - Resource conflict (duplicate)
- 422: Unprocessable Entity - Validation failed

**Server Error Codes:**
- 500: Internal Server Error - Server error
- 502: Bad Gateway - Upstream service error
- 503: Service Unavailable - Service temporarily down

---

### E. Version History

**Version 1.0.0** (Current)
- Initial release
- Complete IPO application system (10 sections)
- Issuer team collaboration
- IB Advisor workflow
- CMA Regulator review system
- Document management
- Real-time notifications
- Audit logging

**Planned Features:**
- SHORA Exchange listing workflow
- CSD Registry integration
- Broker and Investor roles
- Secondary market trading
- Corporate actions processing
- Advanced analytics dashboard
- Mobile application
- Email notifications
- PDF report generation

---

### F. Contact Information

**Technical Support:**
- Email: support@capitallab.rw
- Documentation: https://docs.capitallab.rw
- GitHub: https://github.com/capitallab/platform

**Training:**
- Training portal: https://training.capitallab.rw
- Video tutorials: https://youtube.com/capitallab
- Webinars: Monthly training sessions

**Regulatory Information:**
- CMA Rwanda: https://www.cma.rw
- SHORA Exchange: https://www.rse.rw
- Legal framework: Rwanda Securities Law

---

## Conclusion

CapitalLab provides a comprehensive, production-ready platform for simulating Rwanda's IPO process. The system combines educational value with practical workflow simulation, enabling users to understand and experience the complete capital raising journey.

The platform is built on modern, scalable technology and follows best practices for security, performance, and user experience. With role-based access, real-time collaboration, and comprehensive audit trails, CapitalLab serves as both a learning tool and a process simulator.

For questions, support, or contributions, please refer to the contact information above or visit our documentation portal.

---

**Document Version:** 1.0.0  
**Last Updated:** November 11, 2025  
**Maintained By:** CapitalLab Development Team
