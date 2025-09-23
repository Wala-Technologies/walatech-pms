# walatech Production Management System (PMS)

## Project Overview

**Project Name:** walatech PMS (Production Management System)  
**Objective:** Develop a comprehensive, multi-tenant, multi-lingual SaaS web application for production management, designed for the Ethiopian market. The system must be flexible enough to support various manufacturing environments and organization sizes, from SMBs to large enterprises.

**Core Vision:** To create a unified, accessible, and scalable operations platform that empowers Ethiopian manufacturers by providing enterprise-grade tools with local context (language, workflow, UX).

**Reference Implementation:** The application should closely follow the design and functionality of the reference implementation at [Sack Pro MES](https://app--sack-pro-mes-copy-a7a12655.base44.app/MasterData). Key aspects to replicate include:
- Clean, modern UI/UX
- Intuitive navigation and data presentation
- Efficient data management interfaces
- Responsive design patterns
- User interaction flows

## 1. Technical Stack & Architecture

### Frontend
- **Framework:** React 18+ with TypeScript
- **UI Framework:** Next.js 14+ App Router (recommended for SSR, SEO, and routing)
- **UI Library:** MUI (Material-UI) v5+ or Ant Design
- **State Management:** Zustand or Redux Toolkit with RTK Query
- **i18n:** react-i18next
- **Responsive:** Mobile-first design with responsive breakpoints
- **Performance:** Code splitting, lazy loading, and proper asset optimization
- **Security:** JWT-based authentication, proper input validation, and rate limiting

### Backend
- **Framework:** NestJS with Node.js and TypeScript
- **API:** RESTful design with optional GraphQL endpoints for complex queries
- **Database:** MariaDB with TypeORM or Prisma (see [database schema](wala-pms-db.sql))

### Architecture (Microservices)
- **Auth Service** - Authentication, Tenancy, User Management
- **Core Data Service** - Clients, Products, BOMs, Work Centers
- **Production Service** - Orders, Production Planning, Execution
- **Stock Service** - Warehouses, Stock Levels, Movements
- **Quality Service** - QC Checks, Non-Conformance Reports
- **Shipment Service**
- **Accounting & HR Service**

### Infrastructure
- **Service Communication:** Message broker (RabbitMQ/Redis)
- **API Gateway:** NestJS-based gateway
- **Caching:** Redis

## 2. Foundational Requirements

### A. Multi-Tenancy
- **Strategy:** Database-per-Tenant or Siloed Schema-per-Tenant
- **Implementation:**
  - All queries must be scoped to `tenant_id`
  - Tenant resolution via subdomain (e.g., `company1.walatech.app`) or JWT claim
  - Strict data isolation between tenants

### B. Multi-Lingual Support (i18n)
- **Supported Languages:**
  - English
  - Amharic (am-ET)
  - Oromifa (om-ET)
- **Implementation:**
  - Frontend: `react-i18next` with JSON translation files
  - Backend: Support for multi-lingual content storage
  - UI: Prominent language selector with RTL support

### C. Authentication & RBAC
- **Authentication:** JWT-based stateless authentication
- **Permission System:** Granular permission model
  - Users -> Roles -> Permissions
  - Example permissions: `Stock:create`, `orders:read:own`, `reports:export`
- **UI:** Dynamic element visibility based on permissions

## 3. Functional Modules

### 1. User Management & Authentication
- User CRUD operations
- Role assignment
- Tenant onboarding
- Secure authentication flows

### 2. Master Data Management
- **Product Configuration**
  - Product attributes and SKUs
  - Categories and multi-lingual descriptions
- **Bill of Materials (BOM)**
  - Multi-level BOMs
  - Component quantities and options
- **Work Centers & Routing**
  - Production line definitions
  - Operational steps with timing and costs

### 3. Core Workflow Modules
- **Clients & Orders**
  - Customer management
  - Sales order processing
- **Production Planning**
  - Job scheduling
  - Capacity planning
- **Production Execution**
  - Real-time work order tracking
  - Material and labor tracking
- **Stock Management**
  - Multi-warehouse support
  - Stock movement tracking
  - Real-time alerts
- **Quality Control**
  - QC checkpoints
  - Non-conformance reporting
- **Shipment & Logistics**
  - Delivery management
  - Packing and shipping

### 4. Support Modules
- **Human Resources**
  - Employee directory
  - Attendance and leave management
  - Labor costing integration
- **Accounting**
  - Basic invoicing
  - AR/AP tracking
  - Cost analysis

### 5. Dashboards & Reporting
- **Configurable Dashboards**
  - Module-specific default dashboards
  - Customizable widgets
  - Real-time data visualization
- **Advanced Reporting**
  - Report builder with filtering
  - Multi-source data integration
  - Export to PDF/Excel

## 4. Flexibility & Configuration

### Feature Flags
- Module-level toggles
- Tenant-specific feature enablement
- No-code configuration changes

### Tenant Configuration
- Customizable application behavior
- Localization settings
- Business rule definitions

## 5. Scalability & Performance

### Database Optimization
- Strategic indexing
- Query optimization
- Tenant-aware query patterns

### Performance Strategies
- Redis caching layer
- Efficient data loading
- Frontend optimization techniques

### Microservices Scaling
- Independent service scaling
- Load balancing
- Service health monitoring

## 6. Database Schema

Refer to [wala-pms-db.sql](wala-pms-db.sql) for the complete database schema. This file contains:
- Table definitions with relationships
- Initial data seeding
- Indexes and constraints
- Multi-tenancy structure
- Localization support

## 7. Implementation Roadmap

### Phase 1: Foundation
1. Project setup (Next.js + NestJS)
2. Database and ORM configuration
3. Multi-tenancy implementation
4. i18n integration
5. Auth system setup

### Phase 2: Core Modules
1. Product and BOM management
2. Stock system
3. Basic production tracking

### Phase 3: Advanced Features
1. Advanced reporting
2. HR integration
3. Accounting features

## 8. Development Guidelines for AI Agent

### Code Organization
- Follow the structure in the provided template
- Keep frontend and backend code separate but coordinated
- Use consistent naming conventions (camelCase for JS/TS, snake_case for DB)

### API Design
- Document all endpoints with OpenAPI/Swagger
- Use consistent response formats
- Implement proper error handling and status codes

### Security
- Validate all inputs
- Implement rate limiting
- Use environment variables for sensitive data
- Regular dependency updates

## 9. Best Practices
- Follow SOLID principles
- Implement comprehensive testing
- Document all APIs and components
- Monitor system performance
- Regular security audits

## Future Considerations
- Mobile application
- IoT device integration
- Advanced analytics with ML
- Marketplace for extensions