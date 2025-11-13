# CMA IPO Application System - Backend API Documentation

## Overview

This backend API provides comprehensive endpoints for managing IPO applications with role-based access control for Issuers, IB Advisors, and CMA Regulators.

## Architecture

- **Framework**: Next.js App Router API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Authorization**: Role-based access control (RLS policies)

## Base URL

All endpoints are prefixed with `/api/cma`

## Authentication

All endpoints require authentication via Supabase session cookies. Unauthorized requests return `401 Unauthorized`.

## Role-Based Access

- **ISSUER_CEO**: Create applications, assign IB advisors, submit applications
- **ISSUER_CFO/SECRETARY/LEGAL**: Update assigned sections
- **IB_ADVISOR**: View and assist with assigned applications
- **CMA_REGULATOR**: Review, query, approve/reject applications
- **CMA_ADMIN**: Full access to all applications

---

## Endpoints

### Applications

#### GET `/api/cma/applications`
Get applications based on user role.

**Response:**
```json
{
  "applications": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "application_number": "IPO-2025-0001",
      "status": "DRAFT",
      "completion_percentage": 45,
      "companies": { "legal_name": "Company Name" },
      "assigned_ib_advisor": { "full_name": "Advisor Name" },
      "assigned_cma_officer": { "full_name": "Officer Name" }
    }
  ]
}
```

#### POST `/api/cma/applications`
Create new application (Issuer only).

**Request:**
```json
{
  "target_amount": 50000000
}
```

**Response:**
```json
{
  "application": { /* application object */ }
}
```

#### GET `/api/cma/applications/[id]`
Get specific application with full details.

**Response:**
```json
{
  "application": {
    "id": "uuid",
    "companies": { /* company details */ },
    "application_sections": [ /* sections array */ ],
    "team_assignments": [ /* team members */ ]
  }
}
```

#### PATCH `/api/cma/applications/[id]`
Update application details.

**Request:**
```json
{
  "target_amount": 60000000,
  "current_phase": "REVIEW"
}
```

---

### Application Submission

#### POST `/api/cma/applications/[id]/submit`
Submit application for CMA review (CEO only).

**Requirements:**
- All sections must be completed
- User must be ISSUER_CEO

**Response:**
```json
{
  "application": { /* updated application */ },
  "message": "Application submitted successfully"
}
```

---

### Sections

#### GET `/api/cma/applications/[id]/sections`
Get all sections for an application.

**Response:**
```json
{
  "sections": [
    {
      "id": "uuid",
      "section_number": 1,
      "section_title": "Company Identity",
      "status": "COMPLETED",
      "data": { /* section data */ }
    }
  ]
}
```

#### PATCH `/api/cma/applications/[id]/sections/[sectionId]`
Update section data and status.

**Request:**
```json
{
  "status": "COMPLETED",
  "data": {
    "legalName": "Company Ltd",
    "registrationNumber": "12345"
  }
}
```

**Response:**
```json
{
  "section": { /* updated section */ }
}
```

---

### IB Advisor Management

#### GET `/api/cma/ib-advisors`
Get list of available IB Advisors.

**Response:**
```json
{
  "advisors": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

#### POST `/api/cma/applications/[id]/assign-ib`
Assign IB Advisor to application (CEO only).

**Request:**
```json
{
  "ib_advisor_id": "uuid"
}
```

**Response:**
```json
{
  "application": { /* updated application */ },
  "ib_advisor": { /* advisor details */ },
  "message": "IB Advisor assigned successfully"
}
```

#### DELETE `/api/cma/applications/[id]/assign-ib`
Remove IB Advisor assignment (CEO only).

---

### CMA Review

#### POST `/api/cma/applications/[id]/review`
CMA Regulator review actions.

**Actions:**
- `START_REVIEW`: Begin reviewing application
- `ISSUE_QUERY`: Request additional information
- `APPROVE`: Approve application
- `REJECT`: Reject application

**Request:**
```json
{
  "action": "ISSUE_QUERY",
  "comment": "Please provide additional financial statements",
  "risk_rating": "MEDIUM",
  "compliance_score": 75
}
```

**Response:**
```json
{
  "application": { /* updated application */ },
  "review": { /* review record */ },
  "message": "Query issued successfully"
}
```

---

### Comments

#### GET `/api/cma/applications/[id]/comments`
Get comments for application.

**Query Parameters:**
- `section_id` (optional): Filter by section

**Response:**
```json
{
  "comments": [
    {
      "id": "uuid",
      "content": "Comment text",
      "author": {
        "full_name": "John Doe",
        "role": "CMA_REGULATOR"
      },
      "is_internal": false,
      "created_at": "2025-11-08T10:00:00Z"
    }
  ]
}
```

#### POST `/api/cma/applications/[id]/comments`
Add comment to application.

**Request:**
```json
{
  "content": "This looks good",
  "section_id": "uuid",
  "is_internal": false,
  "parent_comment_id": "uuid"
}
```

**Response:**
```json
{
  "comment": { /* created comment */ }
}
```

---

### Notifications

#### GET `/api/cma/notifications`
Get user notifications.

**Query Parameters:**
- `unread_only`: boolean (default: false)
- `limit`: number (default: 50)

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "New Comment",
      "message": "Someone commented on your application",
      "type": "COMMENT_ADDED",
      "is_read": false,
      "created_at": "2025-11-08T10:00:00Z"
    }
  ]
}
```

#### PATCH `/api/cma/notifications`
Mark notifications as read.

**Request:**
```json
{
  "notification_ids": ["uuid1", "uuid2"],
  "mark_all": false
}
```

---

## Client Usage

### Using the API Client

```typescript
import { cmaApi } from '@/lib/api/cma-api-client'

// Get applications
const { data, error } = await cmaApi.getApplications()

// Create application
const result = await cmaApi.createApplication({ target_amount: 50000000 })

// Submit application
await cmaApi.submitApplication(applicationId)

// Assign IB Advisor
await cmaApi.assignIBAdvisor(applicationId, advisorId)

// CMA Review
await cmaApi.issueQuery(applicationId, "Need more info", "MEDIUM", 75)
```

### Using React Hooks

```typescript
import { 
  useApplications, 
  useApplication,
  useSubmitApplication,
  useCMAReview 
} from '@/lib/api/use-cma-api'

function MyComponent() {
  const { applications, loading, error } = useApplications()
  const { submitApplication } = useSubmitApplication()
  const { issueQuery } = useCMAReview()

  // Use the data and functions
}
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Workflow Examples

### Issuer Workflow

1. Create application: `POST /api/cma/applications`
2. Assign IB Advisor: `POST /api/cma/applications/[id]/assign-ib`
3. Complete sections: `PATCH /api/cma/applications/[id]/sections/[sectionId]`
4. Submit application: `POST /api/cma/applications/[id]/submit`

### IB Advisor Workflow

1. View assigned applications: `GET /api/cma/applications`
2. Review sections: `GET /api/cma/applications/[id]/sections`
3. Add comments: `POST /api/cma/applications/[id]/comments`
4. Update sections: `PATCH /api/cma/applications/[id]/sections/[sectionId]`

### CMA Regulator Workflow

1. View submitted applications: `GET /api/cma/applications`
2. Start review: `POST /api/cma/applications/[id]/review` (action: START_REVIEW)
3. Issue queries: `POST /api/cma/applications/[id]/review` (action: ISSUE_QUERY)
4. Approve/Reject: `POST /api/cma/applications/[id]/review` (action: APPROVE/REJECT)

---

## Real-time Updates

The system supports real-time updates via Supabase subscriptions. Use the `subscribeToApplication` method from `ApplicationService`:

```typescript
import { ApplicationService } from '@/lib/supabase/applications'

const service = new ApplicationService()
const subscription = service.subscribeToApplication(applicationId, (payload) => {
  console.log('Application updated:', payload)
})

// Cleanup
subscription.unsubscribe()
```

---

## Security

- All endpoints enforce authentication
- Role-based access control via Supabase RLS
- Sensitive operations (submit, approve, reject) require specific roles
- Internal comments only visible to CMA regulators
- File uploads validated and scanned

---

## Testing

Use the provided hooks and client for easy testing:

```typescript
// Test creating an application
const { createApplication } = useCreateApplication()
const app = await createApplication({ target_amount: 50000000 })

// Test submission
const { submitApplication } = useSubmitApplication()
const success = await submitApplication(app.id)
```
