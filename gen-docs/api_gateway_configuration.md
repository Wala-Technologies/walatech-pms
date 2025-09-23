# API Gateway Configuration

## Overview
This document outlines the configuration for the API Gateway that will serve as the single entry point for all microservices in the WalaTech system.

## Gateway Technology Stack
- **API Gateway**: Kong/NGINX
- **Service Mesh**: Istio
- **Authentication**: JWT with OAuth2
- **Rate Limiting**: Redis-backed
- **Logging**: ELK Stack
- **Monitoring**: Prometheus + Grafana

## Base URL Structure
```
https://api.yourdomain.com/v1/{service-name}/{endpoint}
```

## Service Registry

| Service Name | Description | Base Path |
|--------------|-------------|-----------|
| `auth` | Authentication & Authorization | `/auth` |
| `hr` | Human Resources | `/hr` |
| `crm` | Customer Relationship Management | `/crm` |
| `mfg` | Manufacturing | `/mfg` |
| `purchasing` | Purchasing | `/purchase` |
| `accounting` | Accounting | `/accounting` |
| `inventory` | Inventory Management | `/inventory` |
| `asset` | Asset Management | `/asset` |
| `project` | Project Management | `/project` |
| `support` | Customer Support | `/support` |

## Rate Limiting

```yaml
plugins:
  - name: rate-limiting
    config:
      minute: 100
      hour: 1000
      policy: redis
      redis_host: redis
      redis_port: 6379
```

## Authentication Flow

1. Client obtains JWT token from `/auth/login`
2. Token is included in `Authorization: Bearer <token>` header
3. Gateway validates token and forwards request to appropriate service
4. Service validates token scopes and processes request

## CORS Configuration

```yaml
plugins:
  - name: cors
    config:
      origins: ["https://yourdomain.com"]
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
      headers: ["Content-Type", "Authorization"]
      exposed_headers: ["X-Auth-Token"]
      credentials: true
      max_age: 3600
```

## Logging Configuration

```yaml
plugins:
  - name: file-log
    config:
      path: /var/log/kong/access.log
      reopen: true
  - name: http-log
    config:
      http_endpoint: http://logstash:8080
      method: POST
      timeout: 1000
      keepalive: 1000
```

## Circuit Breaker Pattern

```yaml
plugins:
  - name: proxy-cache
    config:
      content_type: ["application/json"]
      cache_ttl: 300
      strategy: memory
  - name: circuit-breaker
    config:
      timeout: 10000
      http_statuses: [500, 502, 503, 504]
      failures: 5
```

## Service Discovery

```yaml
services:
  - name: hr-service
    url: http://hr-service:8000
    routes:
      - name: hr-route
        paths: ["/hr"]
        methods: ["GET", "POST", "PUT", "DELETE"]
    plugins:
      - name: key-auth
        enabled: true
```

## Security Headers

```yaml
plugins:
  - name: cors
  - name: bot-protection
  - name: request-transformer
    config:
      add:
        headers:
          - "X-Content-Type-Options: nosniff"
          - "X-Frame-Options: DENY"
          - "X-XSS-Protection: 1; mode=block"
          - "Strict-Transport-Security: max-age=31536000; includeSubDomains"
          - "Content-Security-Policy: default-src 'self'"
```

## Health Check Endpoints

```yaml
services:
  - name: health-check
    url: http://kong:8001/status
    routes:
      - name: health-route
        paths: ["/health"]
        methods: ["GET"]
    plugins:
      - name: request-termination
        config:
          status_code: 200
          message: '{"status": "ok"}'
```

## Versioning Strategy

- URL Path: `/v1/...`
- Header: `Accept: application/vnd.WalaTech.v1+json`
- Default to latest version if not specified
- Maintain backward compatibility for at least 6 months

## Monitoring Endpoints

```yaml
plugins:
  - name: prometheus
  - name: datadog
    config:
      host: datadog-agent
      port: 8125
```

## Request/Response Transformation

```yaml
plugins:
  - name: request-transformer
    config:
      add:
        headers:
          - "X-Request-Id: $\{uuid\}"
          - "X-Request-Time: $\{now\}"
      remove:
        headers: ["User-Agent"]
```

## Deployment Strategy

1. Blue-Green deployment for zero-downtime updates
2. Canary releases for new features
3. Feature flags for gradual rollouts
4. Automated rollback on failure detection

## Documentation

- Swagger/OpenAPI for all endpoints
- Postman collection for testing
- Rate limit documentation
- Error code reference
- Authentication examples

## Error Handling

Standard error response format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "request_id": "req_1234567890"
  }
}
```

## Performance Considerations

- Enable HTTP/2
- Enable GZIP compression
- Implement caching headers
- Connection pooling
- Timeout configurations
- Circuit breakers for dependent services

## Scaling

- Horizontal scaling of gateway instances
- Auto-scaling based on CPU/memory metrics
- Database connection pooling
- Cache frequently accessed data

## Security Best Practices

- Regular security audits
- DDoS protection
- Request validation
- Input sanitization
- Rate limiting
- IP whitelisting for admin endpoints
- Regular dependency updates
