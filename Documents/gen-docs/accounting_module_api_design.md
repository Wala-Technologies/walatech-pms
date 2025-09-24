# Accounting Module API Design

## Overview
This document outlines the RESTful API design for the Accounting module, following microservices architecture and SOLID principles.

## Base URL
```
https://api.yourdomain.com/v1/accounting
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Versioning
API version is included in the URL path and Accept header:
```
Accept: application/vnd.WalaTech.accounting.v1+json
```

## Resources

### 1. Chart of Accounts

#### Get Chart of Accounts
```http
GET /chart-of-accounts
```

**Query Parameters:**
- `company` (string): Filter by company
- `is_group` (boolean): Filter group accounts
- `root_type` (enum): Asset, Liability, Income, Expense, Equity

### 2. Journal Entries

#### Create Journal Entry
```http
POST /journal-entries
```

**Request Body:**
```json
{
  "voucher_type": "Journal Entry",
  "posting_date": "2023-09-09",
  "company": "Your Company",
  "accounts": [
    {
      "account": "Debtors - YC",
      "debit_in_account_currency": 1000,
      "cost_center": "Main - YC"
    },
    {
      "account": "Sales - YC",
      "credit_in_account_currency": 1000,
      "cost_center": "Main - YC"
    }
  ],
  "reference_no": "INV-001",
  "reference_date": "2023-09-09",
  "user_remark": "Sales invoice for customer"
}
```

### 3. Invoices

#### Create Sales Invoice
```http
POST /invoices/sales
```

**Request Body:**
```json
{
  "customer": "CUST-001",
  "posting_date": "2023-09-09",
  "due_date": "2023-10-09",
  "items": [
    {
      "item_code": "PROD-001",
      "qty": 2,
      "rate": 500,
      "income_account": "Sales - YC"
    }
  ],
  "taxes": [
    {
      "charge_type": "On Net Total",
      "account_head": "VAT - YC",
      "rate": 20
    }
  ]
}
```

### 4. Payments

#### Record Payment
```http
POST /payments
```

**Request Body:**
```json
{
  "payment_type": "Receive",
  "party_type": "Customer",
  "party": "CUST-001",
  "posting_date": "2023-09-09",
  "mode_of_payment": "Bank",
  "amount": 1200,
  "references": [
    {
      "reference_doctype": "Sales Invoice",
      "reference_name": "SINV-001",
      "allocated_amount": 1200
    }
  ]
}
```

### 5. Financial Reports

#### Generate Trial Balance
```http
GET /reports/trial-balance
```

**Query Parameters:**
- `company` (string): Company name
- `from_date` (date): Start date
- `to_date` (date): End date
- `with_period_closing_entries` (boolean)

## Error Responses

### 400 Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "amount",
        "message": "Must be greater than 0"
      }
    ]
  }
}
```

### 409 Conflict
```json
{
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "Journal entry with this reference already exists"
  }
}
```

## Rate Limiting
- 60 requests per minute per IP
- 1000 requests per hour per user

## Webhook Events

### Invoice Created
```json
{
  "event": "invoice.created",
  "data": {
    "id": "SINV-001",
    "customer": "CUST-001",
    "total": 1200,
    "outstanding_amount": 1200,
    "status": "Unpaid"
  },
  "timestamp": "2023-09-09T12:00:00Z"
}
```

### Payment Recorded
```json
{
  "event": "payment.recorded",
  "data": {
    "id": "PAY-001",
    "amount": 1200,
    "reference_doctype": "Sales Invoice",
    "reference_name": "SINV-001",
    "status": "Completed"
  },
  "timestamp": "2023-09-09T12:00:00Z"
}
```

## Best Practices

1. **Idempotency**: Use `Idempotency-Key` header for non-idempotent operations
2. **Audit Trail**: All financial transactions are immutable once posted
3. **Bulk Operations**: Support bulk creation/updates where applicable
4. **Field Selection**: Use `fields` parameter to request only needed fields
5. **Error Handling**: Provide clear error messages and codes
6. **Versioning**: Always specify API version in requests
7. **Security**: Never expose sensitive financial data in responses
8. **Documentation**: Keep API documentation up-to-date with examples
9. **Testing**: Include test cases for all financial calculations
10. **Compliance**: Follow accounting standards and regulations
