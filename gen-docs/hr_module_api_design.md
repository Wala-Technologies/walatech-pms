# HR Module API Design

## Overview
This document outlines the RESTful API design for the HR module, following microservices architecture and SOLID principles.

## Base URL
```
https://api.yourdomain.com/v1/hr
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Versioning
API version is included in the URL path and Accept header:
```
Accept: application/vnd.WalaTech.hr.v1+json
```

## Resources

### 1. Employees

#### Get All Employees
```http
GET /employees
```

**Query Parameters:**
- `department` (string): Filter by department
- `status` (enum: active, inactive, suspended)
- `page` (number): Page number
- `limit` (number): Items per page (max 100)

**Response:**
```json
{
  "data": [
    {
      "id": "EMP001",
      "employee_name": "John Doe",
      "designation": "Software Engineer",
      "department": "IT",
      "status": "active",
      "date_of_joining": "2020-01-15",
      "links": {
        "self": "/v1/hr/employees/EMP001"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

#### Get Employee by ID
```http
GET /employees/{id}
```

### 2. Attendance

#### Mark Attendance
```http
POST /attendance
```

**Request Body:**
```json
{
  "employee_id": "EMP001",
  "date": "2023-09-09",
  "status": "Present",
  "check_in": "09:00:00",
  "check_out": "18:00:00",
  "notes": "Worked on API design"
}
```

### 3. Leave Management

#### Apply for Leave
```http
POST /leaves
```

**Request Body:**
```json
{
  "employee_id": "EMP001",
  "leave_type": "Annual",
  "from_date": "2023-10-01",
  "to_date": "2023-10-05",
  "reason": "Family vacation",
  "contact_address": "123 Main St, City",
  "contact_phone": "+1234567890"
}
```

### 4. Payroll

#### Process Payroll
```http
POST /payroll/process
```

**Request Body:**
```json
{
  "employee_id": "EMP001",
  "month": 10,
  "year": 2023,
  "allowances": [
    {
      "type": "bonus",
      "amount": 1000,
      "description": "Performance bonus"
    }
  ],
  "deductions": [
    {
      "type": "tax",
      "amount": 500,
      "description": "Income tax"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Employee not found"
  }
}
```

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per user

## Webhook Events

### Employee Created
```json
{
  "event": "employee.created",
  "data": {
    "id": "EMP001",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2023-09-09T12:00:00Z"
}
```

### Leave Status Updated
```json
{
  "event": "leave.updated",
  "data": {
    "id": "LEAVE001",
    "employee_id": "EMP001",
    "status": "approved",
    "from_date": "2023-10-01",
    "to_date": "2023-10-05"
  },
  "timestamp": "2023-09-09T12:00:00Z"
}
```

## Best Practices

1. **Idempotency**: Use `Idempotency-Key` header for non-idempotent operations
2. **Caching**: Use `Cache-Control` headers for cacheable resources
3. **Pagination**: Always paginate large result sets
4. **Field Selection**: Use `fields` parameter to request only needed fields
5. **Error Handling**: Provide clear error messages and codes
6. **Versioning**: Always specify API version in requests
7. **Security**: Never expose sensitive data in responses
8. **Documentation**: Keep API documentation up-to-date
9. **Testing**: Include test cases for all endpoints
10. **Monitoring**: Log all API requests and responses for auditing
