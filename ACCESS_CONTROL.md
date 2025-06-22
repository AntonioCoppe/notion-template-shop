# Access Control Implementation

This document describes the access control system implemented for the Notion Template Shop.

## Overview

The application implements role-based access control (RBAC) with two main roles:
- **Buyer**: Can access cart, account, and purchase templates
- **Vendor**: Can access vendor dashboard and manage templates

## Components

### 1. Middleware (`middleware.ts`)

The middleware provides route-level access control:
- Protects `/vendor/*` routes for vendors only
- Protects `/cart/*` and `/account/*` routes for buyers only
- Redirects unauthenticated users to sign-in page
- Redirects users with wrong roles to home page

### 2. Authentication Utilities (`lib/auth-utils.ts`)

Provides server-side authentication and role checking:
- `authenticateUser()`: Extracts and validates JWT tokens
- `requireAuth()`: Ensures user is authenticated
- `requireRole()`: Ensures user has specific role
- `requireVendor()`: Ensures user is a vendor
- `requireBuyer()`: Ensures user is a buyer

### 3. API Client (`lib/api-client.ts`)

Provides client-side authenticated API calls:
- `authenticatedFetch()`: Adds auth headers to requests
- `vendorApiCall()`: Makes vendor-only API calls
- `buyerApiCall()`: Makes buyer-only API calls

### 4. Page-Level Guards

Each protected page includes:
- Loading states while checking authentication
- Role verification with user-friendly error messages
- Automatic redirects for unauthorized access

## Protected Routes

### Vendor Routes
- `/vendor/*` - Vendor dashboard and management
- `/api/stripe/connect` - Stripe account connection
- `/api/stripe/account-status` - Stripe account status

### Buyer Routes
- `/cart/*` - Shopping cart
- `/account/*` - User account and order history
- `/api/stripe/checkout` - Payment processing

## User Roles

### Buyer Role
- Can browse and purchase templates
- Access to cart and account pages
- Can view order history
- Cannot access vendor features

### Vendor Role
- Can create and manage templates
- Access to vendor dashboard
- Can connect Stripe account
- Cannot access buyer features (cart, account)

## Implementation Details

### Role Storage
User roles are stored in Supabase user metadata:
```json
{
  "user_metadata": {
    "role": "buyer" | "vendor"
  }
}
```

### Authentication Flow
1. User signs in/up
2. Role is set in user metadata during registration
3. Middleware checks role on protected routes
4. API routes verify role via auth headers
5. Pages show appropriate content based on role

### Error Handling
- 401: Authentication required
- 403: Access denied (wrong role)
- User-friendly error messages
- Automatic redirects to appropriate pages

## Security Considerations

1. **Server-side validation**: All role checks happen on the server
2. **JWT verification**: Tokens are verified on each request
3. **Route protection**: Middleware prevents unauthorized access
4. **API protection**: All sensitive endpoints require authentication
5. **Role isolation**: Vendors cannot access buyer features and vice versa

## Usage Examples

### Protecting an API Route
```typescript
import { authenticateUser, requireVendor } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateUser(req);
    const vendor = requireVendor(user);
    // ... rest of the logic
  } catch (error) {
    // Handle authentication/authorization errors
  }
}
```

### Making Authenticated API Calls
```typescript
import { vendorApiCall } from '@/lib/api-client';

const response = await vendorApiCall('/api/vendor/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

### Page-Level Protection
```typescript
const { user, loading } = useSupabaseUser();

useEffect(() => {
  if (!loading && (!user || user.user_metadata?.role !== "vendor")) {
    router.push("/auth/sign-in");
  }
}, [user, loading, router]);
``` 