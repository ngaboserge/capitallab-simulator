# Simple Authentication System

This directory contains the simplified authentication system for the CMA Backend Integration. The system provides username/password authentication without email verification, with automatic company creation for issuer users.

## Features

- **Simple Authentication**: Username/password login without email verification
- **Role-Based Access**: Support for ISSUER, IB_ADVISOR, CMA_REGULATOR, and CMA_ADMIN roles
- **Automatic Company Creation**: Automatically creates a company profile for issuer users during signup
- **Session Management**: Secure JWT-based session management with automatic refresh
- **Protected Routes**: Role-based route protection with customizable access control
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Components

### 1. SimpleAuthProvider

React context provider that manages authentication state.

```tsx
import { SimpleAuthProvider } from '@/lib/auth'

function App({ children }) {
  return (
    <SimpleAuthProvider>
      {children}
    </SimpleAuthProvider>
  )
}
```

### 2. useSimpleAuth Hook

Hook to access authentication state and methods.

```tsx
import { useSimpleAuth } from '@/lib/auth'

function MyComponent() {
  const { user, profile, loading, login, signup, logout } = useSimpleAuth()

  const handleLogin = async () => {
    try {
      await login('username', 'password')
      // Redirect or update UI
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div>
      {user ? (
        <p>Welcome, {user.username}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  )
}
```

### 3. SimpleProtectedRoute

Component for protecting routes based on authentication and roles.

```tsx
import { SimpleProtectedRoute } from '@/lib/auth'

function IssuerDashboard() {
  return (
    <SimpleProtectedRoute allowedRoles={['ISSUER']}>
      <div>Issuer Dashboard Content</div>
    </SimpleProtectedRoute>
  )
}
```

### 4. SimpleAuthForm

Pre-built authentication form with login and signup tabs.

```tsx
import { SimpleAuthForm } from '@/components/auth/simple-auth-form'

function LoginPage() {
  return <SimpleAuthForm />
}
```

## API Routes

### POST /api/auth/signup

Create a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securepassword123",
  "email": "john@example.com",
  "fullName": "John Doe",
  "role": "ISSUER",
  "companyName": "Acme Corporation" // Required for ISSUER role
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "username": "john_doe",
    "role": "ISSUER",
    "companyId": "company-uuid"
  }
}
```

### POST /api/auth/login

Authenticate a user.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "username": "john_doe",
    "fullName": "John Doe",
    "role": "ISSUER",
    "companyId": "company-uuid"
  },
  "session": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresAt": 1234567890
  }
}
```

### POST /api/auth/logout

End the current user session.

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### GET /api/auth/session

Get the current user session.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "username": "john_doe",
    "fullName": "John Doe",
    "role": "ISSUER",
    "companyId": "company-uuid"
  },
  "profile": { /* Full profile object */ },
  "session": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresAt": 1234567890
  }
}
```

## Company Service

The `CompanyService` class handles company creation and management for issuer users.

```tsx
import { CompanyService } from '@/lib/auth'

const companyService = new CompanyService()

// Create a company
const { company, error } = await companyService.createCompany(
  {
    legalName: 'Acme Corporation',
    tradingName: 'Acme',
    registrationNumber: 'REG123456',
    incorporationDate: '2020-01-01',
    businessDescription: 'Technology company',
    industrySector: 'Technology'
  },
  userId
)

// Get a company
const company = await companyService.getCompany(companyId)

// Update a company
const { company, error } = await companyService.updateCompany(
  companyId,
  {
    legalName: 'Acme Corporation Ltd',
    status: 'ACTIVE'
  }
)
```

## User Roles

The system supports four user roles:

1. **ISSUER**: Company seeking IPO listing
   - Automatically creates a company profile during signup
   - Can create and manage IPO applications
   - Can fill out application sections

2. **IB_ADVISOR**: Investment Bank Advisor
   - Reviews issuer applications
   - Provides feedback and guidance
   - Submits applications to CMA

3. **CMA_REGULATOR**: CMA Regulatory Officer
   - Reviews submitted applications
   - Issues queries and requests changes
   - Approves or rejects applications

4. **CMA_ADMIN**: CMA Administrator
   - Full system access
   - User management
   - System configuration

## Workflow

1. **User Signup**
   - User fills out signup form with username, email, password, and role
   - For ISSUER role, company name is required
   - System creates auth user, company (if issuer), and profile
   - User is automatically logged in after signup

2. **User Login**
   - User enters username and password
   - System validates credentials and creates session
   - User is redirected to appropriate dashboard based on role

3. **Session Management**
   - Session is stored in HTTP-only cookies
   - Automatic session refresh on page load
   - Real-time auth state updates via Supabase subscriptions

4. **User Logout**
   - User clicks logout
   - Session is cleared from cookies
   - User is redirected to login page

## Security Features

- **Password Strength**: Minimum 8 characters required
- **Username Uniqueness**: Usernames must be unique across the system
- **Email Uniqueness**: Email addresses must be unique
- **Secure Sessions**: JWT tokens stored in HTTP-only cookies
- **Role-Based Access**: Routes protected by role permissions
- **Automatic Rollback**: Failed signups automatically rollback all changes
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Integration Example

```tsx
// app/layout.tsx
import { SimpleAuthProvider } from '@/lib/auth'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SimpleAuthProvider>
          {children}
        </SimpleAuthProvider>
      </body>
    </html>
  )
}

// app/dashboard/page.tsx
import { SimpleProtectedRoute } from '@/lib/auth'
import { useSimpleAuth } from '@/lib/auth'

export default function DashboardPage() {
  const { user, profile, logout } = useSimpleAuth()

  return (
    <SimpleProtectedRoute>
      <div>
        <h1>Welcome, {user?.username}!</h1>
        <p>Role: {profile?.role}</p>
        <button onClick={logout}>Logout</button>
      </div>
    </SimpleProtectedRoute>
  )
}
```

## Testing

To test the authentication system:

1. Start the development server
2. Navigate to `/auth/login`
3. Create a new account with the signup form
4. Verify that you're automatically logged in
5. Test protected routes with different roles
6. Test logout functionality

## Troubleshooting

### "Username already exists" error
- Choose a different username
- Usernames must be unique across all users

### "Company name is required" error
- Ensure you've entered a company name when signing up as an ISSUER
- Company name cannot be empty

### Session not persisting
- Check that cookies are enabled in your browser
- Verify Supabase environment variables are set correctly
- Check browser console for errors

### Protected route not working
- Ensure SimpleAuthProvider wraps your app
- Check that user is logged in
- Verify role permissions match route requirements

## Next Steps

After implementing the authentication system:

1. Integrate with existing application pages
2. Add role-based navigation menus
3. Implement application creation workflow
4. Add real-time notifications
5. Implement audit logging
