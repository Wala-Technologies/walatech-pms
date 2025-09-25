# Project Module API Design

## Overview
This document outlines the RESTful API design for the Project module, following microservices architecture and SOLID principles.

## Base URL
```
https://api.yourdomain.com/v1/project
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Versioning
API version is included in the URL path and Accept header:
```
Accept: application/vnd.WalaTech.project.v1+json
```

## Resources

### 1. Projects

#### Create Project
```http
POST /projects
```

**Request Body:**
```json
{
  "project_name": "Website Redesign",
  "status": "Open",
  "expected_start_date": "2023-10-01",
  "expected_end_date": "2023-12-31",
  "project_type": "Internal",
  "priority": "High",
  "project_template": "Web Development",
  "notes": "Complete redesign of company website",
  "project_team": [
    {
      "user": "user1@example.com",
      "role": "Project Manager"
    },
    {
      "user": "user2@example.com",
      "role": "Developer"
    }
  ]
}
```

#### Get Project Gantt Chart
```http
GET /projects/{id}/gantt
```

### 2. Tasks

#### Create Task
```http
POST /tasks
```

**Request Body:**
```json
{
  "subject": "Design Homepage",
  "project": "PROJ-001",
  "status": "Open",
  "priority": "High",
  "expected_start_date": "2023-10-01",
  "expected_end_date": "2023-10-15",
  "description": "Design new homepage layout and components",
  "depends_on": ["TASK-001"],
  "assignees": ["user2@example.com"],
  "time_logs": [
    {
      "from_time": "2023-10-01 09:00:00",
      "to_time": "2023-10-01 17:00:00",
      "activity_type": "Design",
      "completed": 50
    }
  ]
}
```

### 3. Time Logs

#### Log Time
```http
POST /time-logs
```

**Request Body:**
```json
{
  "project": "PROJ-001",
  "task": "TASK-002",
  "user": "user2@example.com",
  "from_time": "2023-10-01 09:00:00",
  "to_time": "2023-10-01 17:00:00",
  "activity_type": "Development",
  "completed": 60,
  "notes": "Implemented user authentication"
}
```

### 4. Timesheets

#### Submit Timesheet
```http
POST /timesheets
```

**Request Body:**
```json
{
  "employee": "EMP001",
  "start_date": "2023-10-01",
  "end_date": "2023-10-07",
  "time_logs": [
    {
      "project": "PROJ-001",
      "task": "TASK-002",
      "date": "2023-10-02",
      "hours": 8,
      "activity_type": "Development"
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
        "field": "expected_end_date",
        "message": "End date must be after start date"
      }
    ]
  }
}
```

### 403 Forbidden
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You don't have permission to create tasks in this project"
  }
}
```

## Rate Limiting
- 60 requests per minute per IP
- 1000 requests per hour per user

## Webhook Events

### Task Status Changed
```json
{
  "event": "task.status_changed",
  "data": {
    "task_id": "TASK-002",
    "old_status": "Open",
    "new_status": "In Progress",
    "project_id": "PROJ-001",
    "updated_by": "user2@example.com"
  },
  "timestamp": "2023-09-09T12:00:00Z"
}
```

### Project Milestone Reached
```json
{
  "event": "project.milestone_reached",
  "data": {
    "project_id": "PROJ-001",
    "milestone": "Design Phase Complete",
    "completion_percentage": 30,
    "completed_tasks": 5,
    "total_tasks": 20
  },
  "timestamp": "2023-09-09T12:00:00Z"
}
```

## Best Practices

1. **Idempotency**: Use `Idempotency-Key` header for non-idempotent operations
2. **Pagination**: Implement pagination for large datasets
3. **Field Selection**: Allow clients to request only needed fields
4. **Error Handling**: Provide clear error messages with actionable details
5. **Versioning**: Always specify API version in requests
6. **Security**: Implement proper access controls for project data
7. **Audit Trail**: Maintain history of all project changes
8. **Documentation**: Keep API documentation up-to-date with examples
9. **Testing**: Include test cases for all project workflows
10. **Performance**: Optimize database queries for complex project hierarchies
