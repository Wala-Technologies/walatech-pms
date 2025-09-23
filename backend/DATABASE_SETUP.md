# Database Setup and Migration Guide

## Overview
This multi-tenant SaaS application follows ERPNext patterns with a microservices architecture and SOLID principles. The database structure supports tenant isolation and follows ERPNext naming conventions.

## Database Schema

### Core Tables
1. **tabTenant** - Multi-tenant isolation
2. **tabUser** - User management with tenant association
3. **tabProductionOrder** - Production planning and tracking
4. **tabWorkOrder** - Work order management
5. **tabWorkOrderTask** - Task-level tracking

### ERPNext Conventions
- All tables prefixed with `tab` (e.g., `tabUser`, `tabTenant`)
- Standard fields: `docstatus`, `idx`, `owner`, `modified_by`
- Multi-tenant isolation via `tenant_id` foreign key
- UUID primary keys for better distribution

## Migration Commands

### Development Setup
```bash
# Run migrations
npm run migration:run

# Generate new migration (when entities change)
npm run migration:generate -- src/migrations/MigrationName

# Create empty migration
npm run migration:create -- src/migrations/MigrationName

# Revert last migration
npm run migration:revert
```

### Production Setup
```bash
# Build the application
npm run build

# Run migrations in production
NODE_ENV=production npm run migration:run
```

## Database Configuration

### Environment Variables
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=walatech_pms
NODE_ENV=development
```

### Migration vs Synchronize
- **Development**: Uses `synchronize: false` with manual migrations
- **Production**: Uses `migrationsRun: true` for automatic migration execution
- **Never use synchronize in production** - it can cause data loss

## Multi-Tenant Architecture

### Tenant Isolation
- Each tenant has a unique `id` and `subdomain`
- All business entities include `tenant_id` for data isolation
- Application-level filtering ensures tenant data separation

### Data Access Patterns
```typescript
// Always filter by tenant in queries
const orders = await this.productionOrderRepository.find({
  where: { tenant: { id: tenant_id } }
});
```

## Initial Data Setup

### Creating a Tenant
```sql
INSERT INTO tabTenant (id, name, subdomain, status, plan) 
VALUES (UUID(), 'Demo Company', 'demo', 'active', 'basic');
```

### Creating Admin User
```sql
INSERT INTO tabUser (id, email, first_name, last_name, password, tenant_id) 
VALUES (UUID(), 'admin@demo.com', 'Admin', 'User', 'hashed_password', 'tenant_id');
```

## Troubleshooting

### Common Issues
1. **Migration fails**: Check database connection and permissions
2. **Foreign key errors**: Ensure proper entity relationships
3. **Tenant isolation**: Verify all queries include tenant filtering

### Database Reset (Development Only)
```bash
# Drop all tables and recreate
npm run schema:drop
npm run migration:run
```

## Best Practices

1. **Always backup before migrations in production**
2. **Test migrations in staging environment first**
3. **Use transactions for complex data migrations**
4. **Monitor migration performance on large datasets**
5. **Keep migration files in version control**
6. **Document breaking changes in migration comments**

## ERPNext Compatibility

This schema follows ERPNext patterns:
- Document-based architecture with `docstatus`
- Audit trail with `owner`, `modified_by`
- Flexible indexing with `idx` field
- Consistent naming conventions
- Multi-tenant support for SaaS deployment