# Manufacturing Module API Design

## Overview
This document outlines the RESTful API design for the Manufacturing module, following microservices architecture and SOLID principles.

## Base URL
```
https://api.yourdomain.com/v1/mfg
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Versioning
API version is included in the URL path and Accept header:
```
Accept: application/vnd.WalaTech.mfg.v1+json
```

## Resources

### 1. Work Orders

#### Create Work Order
```http
POST /work-orders
```

**Request Body:**
```json
{
  "production_item": "PROD-001",
  "bom_no": "BOM-001",
  "qty": 100,
  "planned_start_date": "2023-10-10",
  "planned_end_date": "2023-10-15",
  "operations": [
    {
      "operation": "CUTTING",
      "workstation": "WS-001",
      "time_in_mins": 60
    }
  ]
}
```

#### Get Work Order Status
```http
GET /work-orders/{id}
```

### 2. Bill of Materials (BOM)

#### Create BOM
```http
POST /boms
```

**Request Body:**
```json
{
  "item": "PROD-001",
  "quantity": 1,
  "items": [
    {
      "item_code": "RAW-001",
      "qty": 2,
      "uom": "Nos"
    }
  ],
  "operations": [
    {
      "operation": "CUTTING",
      "time_in_mins": 30,
      "workstation": "WS-001"
    }
  ]
}
```

### 3. Production Planning

#### Generate Production Plan
```http
POST /production-plans
```

**Request Body:**
```json
{
  "items": [
    {
      "item_code": "PROD-001",
      "qty": 100,
      "planned_date": "2023-10-10"
    }
  ],
  "use_multi_level_bom": true,
  "ignore_raw_material_shortage": false
}
```

### 4. Quality Inspections

#### Create Quality Inspection
```http
POST /quality-inspections
```

**Request Body:**
```json
{
  "inspection_type": "Incoming",
  "reference_type": "Purchase Receipt",
  "reference_name": "PR-001",
  "item_code": "RAW-001",
  "sample_size": 10,
  "inspections": [
    {
      "specification": "Length",
      "value": "10mm",
      "status": "Accepted"
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
        "field": "qty",
        "message": "Quantity must be greater than 0"
      }
    ]
  }
}
```

### 409 Conflict
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Work order already exists with the same parameters"
  }
}
```

## Rate Limiting
- 60 requests per minute per IP
- 500 requests per hour per user

## Webhook Events

### Work Order Status Changed
```json
{
  "event": "work_order.status_changed",
  "data": {
    "id": "WO-001",
    "status": "In Process",
    "completed_qty": 25,
    "remaining_qty": 75
  },
  "timestamp": "2023-09-09T12:00:00Z"
}
```

### Production Plan Generated
```json
{
  "event": "production_plan.generated",
  "data": {
    "id": "PP-001",
    "items": [
      {
        "item_code": "PROD-001",
        "planned_qty": 100,
        "status": "Planned"
      }
    ]
  },
  "timestamp": "2023-09-09T12:00:00Z"
}
```

## Best Practices

1. **Idempotency**: Use `Idempotency-Key` header for non-idempotent operations
2. **Asynchronous Processing**: Long-running operations return 202 Accepted with a status URL
3. **Bulk Operations**: Support bulk creation/updates where applicable
4. **Field Selection**: Use `fields` parameter to request only needed fields
5. **Error Handling**: Provide clear error messages and codes
6. **Versioning**: Always specify API version in requests
7. **Security**: Never expose sensitive data in responses
8. **Documentation**: Keep API documentation up-to-date
9. **Testing**: Include test cases for all endpoints
10. **Monitoring**: Log all API requests and responses for auditing
