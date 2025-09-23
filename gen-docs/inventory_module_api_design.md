# Inventory Module API Design

## Overview
This document outlines the RESTful API design for the Inventory module, following microservices architecture and SOLID principles.

## Base URL
```
https://api.yourdomain.com/v1/inventory
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Versioning
API version is included in the URL path and Accept header:
```
Accept: application/vnd.WalaTech.inventory.v1+json
```

## Resources

### 1. Items

#### Get Item Details
```http
GET /items/{item_code}
```

**Query Parameters:**
- `warehouse` (string): Include stock levels for specific warehouse
- `price_list` (string): Include pricing from specific price list

### 2. Stock Entries

#### Create Stock Entry
```http
POST /stock-entries
```

**Request Body:**
```json
{
  "purpose": "Material Receipt",
  "posting_date": "2023-09-09",
  "company": "Your Company",
  "items": [
    {
      "item_code": "ITEM-001",
      "qty": 100,
      "uom": "Nos",
      "conversion_factor": 1.0,
      "t_warehouse": "Stores - YC",
      "basic_rate": 10.5,
      "batch_no": "BATCH-001",
      "serial_no": ["SERIAL-001", "SERIAL-002"]
    }
  ]
}
```

### 3. Stock Reconciliations

#### Reconcile Stock
```http
POST /stock-reconciliations
```

**Request Body:**
```json
{
  "company": "Your Company",
  "purpose": "Stock Reconciliation",
  "posting_date": "2023-09-09",
  "items": [
    {
      "item_code": "ITEM-001",
      "warehouse": "Stores - YC",
      "qty": 95,
      "valuation_rate": 10.5,
      "current_qty": 100,
      "difference": -5
    }
  ]
}
```

### 4. Stock Transfers

#### Create Stock Transfer
```http
POST /stock-transfers
```

**Request Body:**
```json
{
  "company": "Your Company",
  "purpose": "Material Transfer",
  "posting_date": "2023-09-09",
  "items": [
    {
      "item_code": "ITEM-001",
      "qty": 10,
      "s_warehouse": "Stores - YC",
      "t_warehouse": "Work In Progress - YC",
      "batch_no": "BATCH-001"
    }
  ]
}
```

### 5. Batch and Serial Number Tracking

#### Get Batch Details
```http
GET /batches/{batch_no}
```

#### Get Serial Number History
```http
GET /serial-numbers/{serial_no}/history
```

## Error Responses

### 400 Bad Request
```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock for item ITEM-001 in warehouse Stores - YC",
    "details": {
      "item_code": "ITEM-001",
      "warehouse": "Stores - YC",
      "available_qty": 5,
      "requested_qty": 10
    }
  }
}
```

### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Item not found: ITEM-999"
  }
}
```

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per user

## Webhook Events

### Stock Level Changed
```json
{
  "event": "stock_level.changed",
  "data": {
    "item_code": "ITEM-001",
    "warehouse": "Stores - YC",
    "old_qty": 100,
    "new_qty": 90,
    "voucher_type": "Stock Entry",
    "voucher_no": "STE-001"
  },
  "timestamp": "2023-09-09T12:00:00Z"
}
```

### Batch Expiry Alert
```json
{
  "event": "batch.expiry_alert",
  "data": {
    "batch_no": "BATCH-001",
    "item_code": "ITEM-001",
    "expiry_date": "2023-12-31",
    "qty": 50,
    "warehouse": "Stores - YC"
  },
  "timestamp": "2023-09-09T12:00:00Z"
}
```

## Best Practices

1. **Idempotency**: Use `Idempotency-Key` header for non-idempotent operations
2. **Batch Operations**: Support bulk creation/updates for inventory transactions
3. **Field Selection**: Use `fields` parameter to request only needed fields
4. **Error Handling**: Provide clear error messages with actionable details
5. **Versioning**: Always specify API version in requests
6. **Security**: Implement strict access controls for inventory adjustments
7. **Audit Trail**: Maintain complete history of all inventory movements
8. **Documentation**: Keep API documentation up-to-date with examples
9. **Testing**: Include test cases for all inventory calculations
10. **Performance**: Implement caching for frequently accessed item data
