# Asset Management API Design

## Overview
This document outlines the RESTful API design for the Asset Management module, following microservices architecture and SOLID principles.

## Base URL
```
https://api.yourdomain.com/v1/asset
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Versioning
API version is included in the URL path and Accept header:
```
Accept: application/vnd.WalaTech.asset.v1+json
```

## Resources

### 1. Assets

#### Create Asset
```http
POST /assets
```

**Request Body:**
```json
{
  "asset_name": "Laptop-001",
  "asset_category": "IT Equipment",
  "company": "Your Company",
  "purchase_date": "2023-01-15",
  "purchase_cost": 1200.00,
  "expected_value_after_useful_life": 200.00,
  "expected_useful_life": 36,
  "location": "Head Office",
  "department": "IT",
  "asset_owner": "IT Department",
  "maintenance_required": true,
  "warranty_expiry_date": "2025-01-14",
  "serial_no": "SN-LAP-001",
  "custom_fields": {
    "assigned_to": "user1@example.com",
    "insurance_details": "Policy #INS-12345"
  }
}
```

### 2. Asset Movements

#### Record Movement
```http
POST /asset-movements
```

**Request Body:**
```json
{
  "asset": "ASSET-001",
  "transaction_date": "2023-09-09",
  "target_location": "Remote Office - New York",
  "target_department": "Sales",
  "target_employee": "EMP-005",
  "reference_doctype": "Employee Transfer",
  "reference_name": "ET-001",
  "notes": "Assigned to new sales team member"
}
```

### 3. Maintenance

#### Schedule Maintenance
```http
POST /maintenance/schedule
```

**Request Body:**
```json
{
  "asset": "ASSET-001",
  "maintenance_type": "Preventive",
  "periodicity": "3 months",
  "start_date": "2023-10-01",
  "end_date": "2024-10-01",
  "assign_to": "vendor@maintenance.com",
  "maintenance_team": "External Vendor",
  "tasks": [
    {
      "maintenance_task": "Hardware Check",
      "start_date": "2023-10-01",
      "end_date": "2023-10-01"
    },
    {
      "maintenance_task": "Software Update",
      "start_date": "2024-01-01",
      "end_date": "2024-01-01"
    }
  ]
}
```

### 4. Depreciation

#### Calculate Depreciation
```http
POST /assets/{id}/calculate-depreciation
```

**Request Body:**
```json
{
  "posting_date": "2023-12-31",
  "depreciation_method": "Straight Line",
  "total_number_of_depreciations": 36,
  "frequency_of_depreciation": 1,
  "submit_asset_depreciation": true
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
        "field": "purchase_date",
        "message": "Purchase date cannot be in the future"
      }
    ]
  }
}
```

### 409 Conflict
```json
{
  "error": {
    "code": "DUPLICATE_ASSET",
    "message": "Asset with serial number SN-LAP-001 already exists"
  }
}
```

## Rate Limiting
- 60 requests per minute per IP
- 1000 requests per hour per user

## Webhook Events

### Asset Status Changed
```json
{
  "event": "asset.status_changed",
  "data": {
    "asset_id": "ASSET-001",
    "old_status": "In Storage",
    "new_status": "In Use",
    "location": "Remote Office - New York",
    "assigned_to": "EMP-005"
  },
  "timestamp": "2023-09-09T12:00:00Z"
}
```

### Maintenance Due
```json
{
  "event": "maintenance.due",
  "data": {
    "asset_id": "ASSET-001",
    "asset_name": "Laptop-001",
    "maintenance_type": "Preventive",
    "due_date": "2023-10-01",
    "assigned_to": "vendor@maintenance.com"
  },
  "timestamp": "2023-09-09T12:00:00Z"
}
```

## Best Practices

1. **Idempotency**: Use `Idempotency-Key` header for non-idempotent operations
2. **Barcode Support**: Include barcode/QR code generation for physical assets
3. **Depreciation Schedules**: Support multiple depreciation methods
4. **Field Selection**: Allow clients to request only needed fields
5. **Error Handling**: Provide clear error messages with actionable details
6. **Versioning**: Always specify API version in requests
7. **Security**: Implement proper access controls for asset data
8. **Audit Trail**: Maintain complete history of all asset movements and changes
9. **Documentation**: Keep API documentation up-to-date with examples
10. **Testing**: Include test cases for depreciation calculations and maintenance schedules
