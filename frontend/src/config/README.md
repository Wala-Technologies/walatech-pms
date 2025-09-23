# API Configuration

This directory contains the centralized API configuration for the Walatech PMS frontend application.

## Files

### `api.ts`

Centralized API configuration that supports microservices architecture by:

- **Environment-based configuration**: Uses environment variables to configure API base URLs
- **Centralized endpoints**: All API endpoints are defined in one place
- **Reusable API client**: Provides helper functions for common HTTP operations
- **Authentication handling**: Automatically includes JWT tokens in requests

## Environment Variables

Create a `.env.local` file in the frontend root with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=10000
```

Important: Do NOT include `/api` in `NEXT_PUBLIC_API_BASE_URL`. The application automatically prefixes `/api` when constructing requests. If you previously used `http://localhost:3001/api`, remove the trailing `/api` to avoid double-prefix issues.

## Usage

### Basic API Calls

```typescript
import { apiClient, apiConfig } from '../config/api';

// GET request
const response = await apiClient.get(apiConfig.endpoints.production.orders);

// POST request
const response = await apiClient.post(apiConfig.endpoints.auth.login, {
  email: 'user@example.com',
  password: 'password',
});

// PATCH request
const response = await apiClient.patch(
  `${apiConfig.endpoints.production.orders}/${id}`,
  { status: 'completed' }
);
```

### With Query Parameters

```typescript
const params = {
  page: '1',
  limit: '10',
  status: 'active',
};

const response = await apiClient.get(
  apiConfig.endpoints.production.orders,
  params
);
```

## Benefits

1. **Microservices Ready**: Easy to change backend URLs without touching component code
2. **Environment Flexibility**: Different URLs for development, staging, and production
3. **Type Safety**: Centralized endpoint definitions reduce typos
4. **Maintainability**: Single place to update API endpoints
5. **Authentication**: Automatic token handling
6. **Consistency**: Standardized error handling and request formatting

## Available Endpoints

- **Authentication**: login, register, refresh, logout
- **Production**: orders, work orders, tasks, analytics
- **Inventory**: items, categories, transactions, statistics
- **Users**: list, roles, permissions

See `api.ts` for the complete endpoint definitions.
