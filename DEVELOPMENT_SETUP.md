# Walatech PMS Development Setup Guide

## Prerequisites

Before setting up the development environment, ensure you have the following installed:

### Required Software

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Docker** (v20.0.0 or higher)
- **Docker Compose** (v2.0.0 or higher)
- **Git** (v2.30.0 or higher)
- **MariaDB** (v10.11.0 or higher) - for local development
- **Redis** (v7.0.0 or higher) - for caching and sessions

### Development Tools (Recommended)

- **Visual Studio Code** with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Docker
  - GitLens
  - Thunder Client (for API testing)
- **Postman** or **Insomnia** for API testing
- **DBeaver** or **MySQL Workbench** for database management

## Project Structure

```
walatech-pms-trae/
├── backend/                    # NestJS microservices
│   ├── api-gateway/           # API Gateway service
│   ├── auth-service/          # Authentication service
│   ├── core-data-service/     # Master data service
│   ├── production-service/    # Production management
│   ├── stock-service/         # Inventory management
│   ├── quality-service/       # Quality control
│   ├── shipment-service/      # Shipping and logistics
│   ├── accounting-service/    # Accounting and finance
│   ├── hr-service/           # Human resources
│   ├── notification-service/  # Notifications
│   └── shared/               # Shared libraries and utilities
├── frontend/                  # Next.js application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.js
├── database/                  # Database scripts and migrations
│   ├── migrations/
│   ├── seeds/
│   └── schema/
├── docker/                    # Docker configurations
│   ├── development/
│   ├── production/
│   └── docker-compose.yml
├── docs/                      # Documentation
├── scripts/                   # Build and deployment scripts
├── .env.example              # Environment variables template
├── .gitignore
├── README.md
└── package.json              # Root package.json for workspace
```

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/walatech/pms-trae.git
cd walatech-pms-trae
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env  # or use your preferred editor
```

**Environment Variables (.env):**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=walatech_user
DB_PASSWORD=secure_password
DB_NAME=walatech_pms

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=3600
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=604800

# API Configuration
API_PORT=3000
API_PREFIX=api/v1
API_RATE_LIMIT=100

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME=Walatech PMS
NEXT_PUBLIC_DEFAULT_LANGUAGE=en

# File Upload Configuration
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=10485760  # 10MB

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Development Settings
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_SWAGGER=true
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start database services
docker-compose up -d mariadb redis

# Wait for services to be ready
docker-compose logs -f mariadb
```

#### Option B: Local Installation

```bash
# Install MariaDB
sudo apt-get install mariadb-server  # Ubuntu/Debian
brew install mariadb                 # macOS

# Install Redis
sudo apt-get install redis-server    # Ubuntu/Debian
brew install redis                   # macOS

# Start services
sudo systemctl start mariadb redis   # Linux
brew services start mariadb redis    # macOS
```

#### Database Initialization

```bash
# Create database and user
mysql -u root -p
```

```sql
CREATE DATABASE walatech_pms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'walatech_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON walatech_pms.* TO 'walatech_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Import initial schema
mysql -u walatech_user -p walatech_pms < gen-docs/wala-pms-db.sql
```

### 4. Backend Services Setup

#### Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend service dependencies
cd backend
npm install

# Install dependencies for each service
for service in api-gateway auth-service core-data-service production-service stock-service quality-service; do
  cd $service
  npm install
  cd ..
done
```

#### Generate Shared Libraries

```bash
# Generate shared types and utilities
cd backend/shared
npm run build
```

### 5. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Generate TypeScript types from backend
npm run generate-types
```

## Development Workflow

### Starting Development Services

#### Option A: Using Docker Compose (Recommended)

```bash
# Start all services in development mode
docker-compose -f docker/development/docker-compose.yml up

# Start specific services
docker-compose -f docker/development/docker-compose.yml up mariadb redis

# View logs
docker-compose -f docker/development/docker-compose.yml logs -f auth-service
```

#### Option B: Manual Startup

```bash
# Terminal 1: Start API Gateway
cd backend/api-gateway
npm run start:dev

# Terminal 2: Start Auth Service
cd backend/auth-service
npm run start:dev

# Terminal 3: Start Core Data Service
cd backend/core-data-service
npm run start:dev

# Terminal 4: Start Frontend
cd frontend
npm run dev
```

### Service Ports

| Service            | Port | URL                   |
| ------------------ | ---- | --------------------- |
| API Gateway        | 3000 | http://localhost:3000 |
| Auth Service       | 3001 | http://localhost:3001 |
| Core Data Service  | 3002 | http://localhost:3002 |
| Production Service | 3001 | http://localhost:3001 |
| Stock Service      | 3004 | http://localhost:3004 |
| Quality Service    | 3005 | http://localhost:3005 |
| Frontend           | 3100 | http://localhost:3100 |
| MariaDB            | 3306 | localhost:3306        |
| Redis              | 6379 | localhost:6379        |

## Development Commands

### Backend Commands

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug

# Build for production
npm run build

# Run tests
npm run test
npm run test:watch
npm run test:e2e

# Linting and formatting
npm run lint
npm run format

# Database operations
npm run migration:generate
npm run migration:run
npm run migration:revert
npm run seed:run
```

### Frontend Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm run test
npm run test:watch

# Linting and formatting
npm run lint
npm run lint:fix
npm run format

# Type checking
npm run type-check

# Generate API types
npm run generate-types

# Analyze bundle
npm run analyze
```

## Database Management

### Migrations

```bash
# Generate new migration
cd backend/auth-service
npm run migration:generate -- --name CreateUserTable

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Seeding Data

```bash
# Run all seeds
npm run seed:run

# Run specific seed
npm run seed:run -- --class UserSeeder

# Refresh database (drop + migrate + seed)
npm run db:refresh
```

## Testing

### Backend Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Frontend Testing

```bash
# Unit tests with Jest
npm run test

# Component tests with React Testing Library
npm run test:components

# E2E tests with Playwright
npm run test:e2e

# Visual regression tests
npm run test:visual
```

## Code Quality

### Linting Configuration

**.eslintrc.js (Backend):**

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['@typescript-eslint/recommended', 'prettier'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
```

### Pre-commit Hooks

**package.json:**

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "git add"],
    "*.{json,md}": ["prettier --write", "git add"]
  }
}
```

## API Documentation

### Swagger Setup

Access API documentation at:

- **API Gateway:** http://localhost:3000/api/docs
- **Auth Service:** http://localhost:3001/api/docs
- **Core Data Service:** http://localhost:3002/api/docs

### Generating API Client

```bash
# Generate TypeScript client for frontend
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3000/api/docs-json \
  -g typescript-axios \
  -o frontend/src/api/generated
```

## Debugging

### Backend Debugging (VS Code)

**.vscode/launch.json:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Auth Service",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/auth-service/src/main.ts",
      "outFiles": ["${workspaceFolder}/backend/auth-service/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

### Frontend Debugging

```bash
# Debug with Chrome DevTools
npm run dev -- --inspect

# Debug with VS Code
# Use the built-in Next.js debugging configuration
```

## Performance Monitoring

### Local Monitoring Setup

```bash
# Start monitoring stack
docker-compose -f docker/monitoring/docker-compose.yml up -d

# Access monitoring tools
# Grafana: http://localhost:3000 (admin/admin)
# Prometheus: http://localhost:9090
# Jaeger: http://localhost:16686
```

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check if MariaDB is running
sudo systemctl status mariadb

# Check connection
mysql -u walatech_user -p -h localhost

# Reset database
npm run db:refresh
```

#### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping

# Clear Redis cache
redis-cli FLUSHALL
```

#### Port Conflicts

```bash
# Check what's using a port
lsof -i :3000

# Kill process using port
kill -9 $(lsof -t -i:3000)
```

#### Node Modules Issues

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

### Getting Help

1. **Check the logs:** Always check service logs for error details
2. **Verify environment:** Ensure all environment variables are set correctly
3. **Database state:** Check if migrations and seeds have run successfully
4. **Service dependencies:** Ensure all required services are running
5. **Network connectivity:** Verify services can communicate with each other

## Next Steps

After completing the setup:

1. **Explore the codebase:** Familiarize yourself with the project structure
2. **Run tests:** Ensure all tests pass in your environment
3. **Create a feature branch:** Start working on your assigned tasks
4. **Follow coding standards:** Adhere to the established patterns and conventions
5. **Document changes:** Update documentation for any new features or changes

For detailed implementation guidelines, refer to:

- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)
- [API Documentation](./gen-docs/)

Happy coding! 🚀
