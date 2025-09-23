# WalaTech CRM API Documentation

This document provides a comprehensive guide to the WalaTech CRM API endpoints, including request/response examples and authentication details.

## Table of Contents
1. [Authentication](#1-authentication)
2. [Base URL](#2-base-url)
3. [Endpoints](#3-endpoints)
   - [Leads](#31-leads)
   - [Opportunities](#32-opportunities)
   - [Customers](#33-customers)
   - [Contacts](#34-contacts)
   - [Appointments](#35-appointments)
   - [Campaigns](#36-campaigns)
4. [Common Parameters](#4-common-parameters)
5. [Error Handling](#5-error-handling)
6. [Rate Limiting](#6-rate-limiting)
7. [Best Practices](#7-best-practices)

## 1. Authentication

All API requests require authentication using either:

### Token-based Authentication
```http
Authorization: token api_key:api_secret
```

### Session-based Authentication
```http
Cookie: sid=YOUR_SESSION_ID
```

## 2. Base URL

```
https://your-WalaTech-instance.com/api/resource
```

## 3. Endpoints

### 3.1 Leads

#### Get All Leads
```http
GET /Lead
```

**Parameters:**
- `fields`: Comma-separated list of fields to include
- `filters`: JSON string to filter results
- `limit_page_length`: Number of records per page
- `limit_start`: Start from record number

**Example Request:**
```http
GET /api/resource/Lead?fields=["lead_name","status","email_id"]&filters=[["status","=","Open"]]
```

**Example Response:**
```json
{
  "data": [
    {
      "name": "LEAD-2023-00001",
      "lead_name": "John Doe",
      "status": "Open",
      "email_id": "john@example.com"
    }
  ]
}
```

#### Create a Lead
```http
POST /Lead
```

**Request Body:**
```json
{
  "lead_name": "Jane Smith",
  "email_id": "jane@example.com",
  "status": "Lead",
  "source": "Website",
  "company_name": "Acme Inc"
}
```

### 3.2 Opportunities

#### Get Opportunity by ID
```http
GET /Opportunity/OPP-2023-00001
```

#### Update Opportunity
```http
PUT /Opportunity/OPP-2023-00001
```

### 3.3 Customers

#### Create Customer
```http
POST /Customer
```

#### Get Customer List
```http
GET /Customer
```

### 3.4 Contacts

#### Create Contact
```http
POST /Contact
```

#### Get Contacts for Customer
```http
GET /Contact?fields=["*"]&filters=[["customer","=","CUST-2023-00001"]]
```

### 3.5 Appointments

#### Create Appointment
```http
POST /Appointment
```

#### Get Calendar View
```http
GET /api/method/frappe.desk.calendar.get_events
```

### 3.6 Campaigns

#### Get Campaign Details
```http
GET /Campaign/CAM-2023-00001
```

#### Get Campaign Members
```http
GET /Campaign Email Queue?fields=["*"]&filters=[["campaign","=","CAM-2023-00001"]]
```

## 4. Common Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| fields | Array | List of fields to include in response |
| filters | Array | List of filters to apply |
| limit_page_length | Integer | Number of records per page |
| limit_start | Integer | Start from record number |
| order_by | String | Field to order by |

## 5. Error Handling

Standard HTTP status codes are used:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error Response Example:
```json
{
  "exc_type": "ValidationError",
  "exception": "frappe.exceptions.ValidationError",
  "http_status_code": 400,
  "_server_messages": "[{\"message\": \"Email ID is required\", \"indicator\": \"red\"}]"
}
```

## 6. Rate Limiting

- 300 requests per minute per user
- 6000 requests per hour per user

## 7. Best Practices

1. Always use HTTPS
2. Implement proper error handling
3. Use pagination for large datasets
4. Cache responses when appropriate
5. Use fields parameter to fetch only required data
6. Handle token expiration gracefully
7. Implement retry logic for failed requests
8. Follow RESTful principles
9. Validate all inputs
10. Use appropriate HTTP methods (GET, POST, PUT, DELETE)

## 8. Webhooks

### Available Webhook Events
- `lead_creation`
- `opportunity_update`
- `appointment_reminder`
- `campaign_status_change`

### Webhook Payload Example
```json
{
  "event": "lead_creation",
  "data": {
    "lead_name": "John Doe",
    "email": "john@example.com",
    "status": "Open"
  },
  "timestamp": "2023-01-01T12:00:00Z"
}
```

## 9. Testing

Use the following test credentials for development:
```
API Key: test_key
API Secret: test_secret
```

## 10. Support

For API support, contact:
- Email: support@yourdomain.com
- Phone: +1 (555) 123-4567
