# Authentication Service Design

## Overview
This document outlines the design of the centralized authentication service that will handle identity and access management across all microservices.

## Base URL
```
https://auth.yourdomain.com/v1
```

## Technology Stack
- **Language**: Node.js with TypeScript
- **Framework**: NestJS
- **Database**: MariaDB for user data, Redis for sessions
- **Authentication**: JWT with refresh tokens
- **Security**: bcrypt for password hashing, rate limiting, CORS

## API Endpoints

### 1. Authentication

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "securePassword123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "roles": ["user"],
    "permissions": ["read:profile", "write:profile"]
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. User Management

#### Create User
```http
POST /users
```

**Request Body:**
```json
{
  "email": "new.user@example.com",
  "password": "securePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["user"]
}
```

#### Get User Profile
```http
GET /users/me
Authorization: Bearer <access_token>
```

### 3. Role-Based Access Control (RBAC)

#### Get All Roles
```http
GET /roles
Authorization: Bearer <access_token>
```

#### Assign Role to User
```http
POST /users/{userId}/roles
Authorization: Bearer <admin_token>

{
  "roles": ["admin", "manager"]
}
```

## Security Implementation

### JWT Structure
```typescript
interface JwtPayload {
  sub: string;        // User ID
  email: string;      // User email
  roles: string[];    // User roles
  iat: number;        // Issued at
  exp: number;        // Expiration time
  jti: string;        // JWT ID for revocation
}
```

### Password Hashing
```typescript
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
```

## Rate Limiting

```typescript
// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
```

## Error Handling

### Error Response Format
```json
{
  "statusCode": 400,
  "timestamp": "2023-09-09T12:00:00.000Z",
  "path": "/auth/login",
  "message": "Invalid credentials",
  "error": "Bad Request"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User roles junction table (many-to-many relationship)
CREATE TABLE user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_roles (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles table
CREATE TABLE roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions table
CREATE TABLE permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role permissions junction table
CREATE TABLE role_permissions (
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_ip VARCHAR(45) NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at DATETIME NULL,
  replaced_by_token VARCHAR(255) NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_token (token),
  INDEX idx_user_token (user_id, token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User sessions table
CREATE TABLE user_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_id BIGINT UNSIGNED NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  payload TEXT,
  last_activity TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (token_id) REFERENCES refresh_tokens(id) ON DELETE SET NULL,
  INDEX idx_user_sessions (user_id, last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

## Deployment

### Environment Variables
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=3600
REFRESH_TOKEN_EXPIRES_IN=86400
MYSQL_URI=mysql://user:password@localhost:3306/auth_service
REDIS_URL=redis://localhost:6379
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Docker Compose
```yaml
version: '3.8'

services:
  auth-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - MYSQL_URI=mysql://user:password@db:3306/auth_service
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  db:
    image: mariadb:10.11
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: auth_service
      MYSQL_USER: user
      MYSQL_PASSWORD: password
    volumes:
      - db-data:/var/lib/mysql

  redis:
    image: redis:7.0
    volumes:
      - redis-data:/data

volumes:
  db-data:
  redis-data:
```

## Testing

### Unit Tests
```typescript
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken('User'),
          useValue: {},
        },
        {
          provide: getModelToken('RefreshToken'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## Monitoring

### Health Check Endpoint
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2023-09-09T12:00:00.000Z",
  "uptime": 12345,
  "database": {
    "status": "connected",
    "latency": 12
  },
  "memory": {
    "rss": "123.45 MB",
    "heapTotal": "98.76 MB",
    "heapUsed": "45.67 MB"
  }
}
```

## Security Best Practices

1. Use HTTPS for all communications
2. Implement proper CORS policies
3. Set secure and httpOnly flags for cookies
4. Implement rate limiting
5. Use secure password hashing (bcrypt)
6. Implement account lockout after failed attempts
7. Regularly rotate JWT secrets
8. Log security events
9. Implement token revocation
10. Regular security audits
