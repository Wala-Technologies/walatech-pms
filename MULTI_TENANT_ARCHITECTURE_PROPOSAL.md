# Multi-Tenant Architecture - Best Practices Proposal

## Current Architecture Issues

### Problems Identified:
1. **Super admin bypass in TenantScopedRepository** - Creates security vulnerabilities
2. **Tenant switching via headers** - Not RESTful, hard to debug
3. **Mixed concerns** - Super admin operations mixed with tenant operations
4. **No audit trail** - Hard to track who did what in which tenant
5. **Confusing UX** - Users don't know which tenant context they're in

## Proposed Architecture

### 1. Separate Super Admin and Tenant Contexts

#### Option A: Separate API Namespaces (RECOMMENDED)

```
/api/admin/*          - Super admin operations (cross-tenant)
/api/tenants/:id/*    - Tenant-specific operations (scoped)
/api/*                - Current tenant operations (user's own tenant)
```

**Benefits**:
- Clear separation of concerns
- Easy to apply different security policies
- RESTful and intuitive
- Easy to audit and monitor

**Example Endpoints**:
```typescript
// Super Admin Operations (Cross-Tenant)
GET    /api/admin/tenants                    // List all tenants
POST   /api/admin/tenants                    // Create new tenant
GET    /api/admin/tenants/:id                // Get tenant details
PATCH  /api/admin/tenants/:id                // Update tenant
DELETE /api/admin/tenants/:id                // Delete tenant
GET    /api/admin/tenants/:id/users          // List users in tenant
POST   /api/admin/tenants/:id/users          // Create user in tenant
GET    /api/admin/tenants/:id/departments    // List departments in tenant
GET    /api/admin/analytics                  // Cross-tenant analytics
GET    /api/admin/audit-logs                 // Cross-tenant audit logs

// Tenant-Scoped Operations (For managing specific tenant)
GET    /api/tenants/:tenantId/users          // List users in specific tenant
POST   /api/tenants/:tenantId/users          // Create user in specific tenant
GET    /api/tenants/:tenantId/departments    // List departments in specific tenant
POST   /api/tenants/:tenantId/departments    // Create department in specific tenant

// Current Tenant Operations (User's own tenant)
GET    /api/users                            // List users in MY tenant
POST   /api/users                            // Create user in MY tenant
GET    /api/departments                      // List departments in MY tenant
POST   /api/departments                      // Create department in MY tenant
```

#### Option B: Query Parameter Approach

```
/api/users?tenantId=xxx    - Explicit tenant parameter
/api/users                 - Defaults to current user's tenant
```

**Benefits**:
- Simpler URL structure
- Backward compatible

**Drawbacks**:
- Less explicit
- Easier to forget tenant parameter
- Harder to enforce security

### 2. Enhanced Permission System

#### Role-Based Access Control (RBAC)

```typescript
// backend/src/common/enums/permissions.enum.ts
export enum Permission {
  // Super Admin Permissions
  SUPER_ADMIN_ALL = 'super_admin:*',
  MANAGE_ALL_TENANTS = 'tenants:manage:all',
  VIEW_ALL_TENANTS = 'tenants:view:all',
  CREATE_TENANT = 'tenants:create',
  DELETE_TENANT = 'tenants:delete',
  VIEW_CROSS_TENANT_ANALYTICS = 'analytics:view:cross-tenant',
  
  // Tenant Admin Permissions
  MANAGE_TENANT_USERS = 'users:manage:tenant',
  VIEW_TENANT_USERS = 'users:view:tenant',
  MANAGE_TENANT_DEPARTMENTS = 'departments:manage:tenant',
  VIEW_TENANT_DEPARTMENTS = 'departments:view:tenant',
  MANAGE_TENANT_SETTINGS = 'settings:manage:tenant',
  
  // Regular User Permissions
  VIEW_OWN_PROFILE = 'profile:view:own',
  EDIT_OWN_PROFILE = 'profile:edit:own',
  VIEW_DEPARTMENT = 'department:view:own',
}

export enum Role {
  SUPER_ADMIN = 'super_admin',        // walatech admins
  TENANT_ADMIN = 'tenant_admin',      // tenant administrators
  DEPARTMENT_MANAGER = 'dept_manager', // department managers
  EMPLOYEE = 'employee',               // regular employees
}

// Role to Permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [Permission.SUPER_ADMIN_ALL],
  [Role.TENANT_ADMIN]: [
    Permission.MANAGE_TENANT_USERS,
    Permission.VIEW_TENANT_USERS,
    Permission.MANAGE_TENANT_DEPARTMENTS,
    Permission.VIEW_TENANT_DEPARTMENTS,
    Permission.MANAGE_TENANT_SETTINGS,
  ],
  [Role.DEPARTMENT_MANAGER]: [
    Permission.VIEW_TENANT_USERS,
    Permission.VIEW_DEPARTMENT,
  ],
  [Role.EMPLOYEE]: [
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
  ],
};
```

### 3. Improved Repository Pattern

#### Base Repository with Explicit Scoping

```typescript
// backend/src/common/repositories/base-scoped.repository.ts
import { Repository, SelectQueryBuilder, FindManyOptions } from 'typeorm';

export interface ScopedEntity {
  tenant_id?: string;
}

export enum ScopeMode {
  CURRENT_TENANT = 'current',  // User's own tenant
  EXPLICIT_TENANT = 'explicit', // Specific tenant (for super admin)
  NO_SCOPE = 'none',            // No tenant filter (for super admin analytics)
}

export class BaseScopedRepository<T extends ScopedEntity> {
  constructor(
    private repository: Repository<T>,
    private request: Request,
  ) {}

  /**
   * Get tenant ID based on scope mode
   */
  private getTenantId(scopeMode: ScopeMode, explicitTenantId?: string): string | null {
    switch (scopeMode) {
      case ScopeMode.CURRENT_TENANT:
        return this.request.tenant_id;
        
      case ScopeMode.EXPLICIT_TENANT:
        if (!explicitTenantId) {
          throw new Error('Explicit tenant ID required for EXPLICIT_TENANT scope');
        }
        // Verify user has permission to access this tenant
        if (!this.canAccessTenant(explicitTenantId)) {
          throw new ForbiddenException('Access denied to this tenant');
        }
        return explicitTenantId;
        
      case ScopeMode.NO_SCOPE:
        // Verify user has super admin permission
        if (!this.isSuperAdmin()) {
          throw new ForbiddenException('Super admin access required');
        }
        return null;
        
      default:
        return this.request.tenant_id;
    }
  }

  /**
   * Create query builder with explicit scoping
   */
  createQueryBuilder(
    alias: string,
    scopeMode: ScopeMode = ScopeMode.CURRENT_TENANT,
    explicitTenantId?: string,
  ): SelectQueryBuilder<T> {
    const qb = this.repository.createQueryBuilder(alias);
    const tenantId = this.getTenantId(scopeMode, explicitTenantId);
    
    if (tenantId) {
      qb.andWhere(`${alias}.tenant_id = :tenant_id`, { tenant_id: tenantId });
    }
    
    return qb;
  }

  /**
   * Find with explicit scoping
   */
  async find(
    options: FindManyOptions<T>,
    scopeMode: ScopeMode = ScopeMode.CURRENT_TENANT,
    explicitTenantId?: string,
  ): Promise<T[]> {
    const tenantId = this.getTenantId(scopeMode, explicitTenantId);
    
    if (tenantId) {
      options.where = {
        ...options.where,
        tenant_id: tenantId as any,
      };
    }
    
    return this.repository.find(options);
  }

  private isSuperAdmin(): boolean {
    return this.request.user?.isSuperAdmin === true;
  }

  private canAccessTenant(tenantId: string): boolean {
    // Super admins can access any tenant
    if (this.isSuperAdmin()) {
      return true;
    }
    
    // Regular users can only access their own tenant
    return this.request.tenant_id === tenantId;
  }
}
```

### 4. Service Layer with Explicit Context

```typescript
// backend/src/modules/users/services/users.service.ts
@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(REQUEST) private request: Request,
  ) {
    this.scopedRepo = new BaseScopedRepository(userRepository, request);
  }

  /**
   * Find users in current user's tenant
   */
  async findAllInMyTenant(query: UserQueryDto): Promise<{ users: User[]; total: number }> {
    const qb = this.scopedRepo.createQueryBuilder('user', ScopeMode.CURRENT_TENANT);
    
    // Apply filters, pagination, etc.
    this.applyFilters(qb, query);
    
    const [users, total] = await qb.getManyAndCount();
    return { users, total };
  }

  /**
   * Find users in specific tenant (super admin only)
   */
  async findAllInTenant(
    tenantId: string,
    query: UserQueryDto,
  ): Promise<{ users: User[]; total: number }> {
    const qb = this.scopedRepo.createQueryBuilder('user', ScopeMode.EXPLICIT_TENANT, tenantId);
    
    // Apply filters, pagination, etc.
    this.applyFilters(qb, query);
    
    const [users, total] = await qb.getManyAndCount();
    return { users, total };
  }

  /**
   * Find all users across all tenants (super admin analytics only)
   */
  async findAllAcrossTenants(query: UserQueryDto): Promise<{ users: User[]; total: number }> {
    const qb = this.scopedRepo.createQueryBuilder('user', ScopeMode.NO_SCOPE);
    
    // Apply filters, pagination, etc.
    this.applyFilters(qb, query);
    
    const [users, total] = await qb.getManyAndCount();
    return { users, total };
  }

  /**
   * Create user in specific tenant (super admin managing tenant)
   */
  async createUserInTenant(
    tenantId: string,
    createUserDto: CreateUserDto,
  ): Promise<User> {
    // Verify access
    if (!this.canAccessTenant(tenantId)) {
      throw new ForbiddenException('Access denied to this tenant');
    }

    const user = this.userRepository.create({
      ...createUserDto,
      tenant_id: tenantId,
    });

    return this.userRepository.save(user);
  }

  private canAccessTenant(tenantId: string): boolean {
    if (this.request.user?.isSuperAdmin) {
      return true;
    }
    return this.request.tenant_id === tenantId;
  }
}
```

### 5. Controller Layer with Clear Endpoints

```typescript
// backend/src/modules/users/controllers/users.controller.ts
@ApiTags('users')
@Controller({ path: 'users', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get users in current user's tenant
   */
  @Get()
  @ApiOperation({ summary: 'Get users in my tenant' })
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAllInMyTenant(query);
  }

  // ... other endpoints
}

// backend/src/modules/admin/controllers/admin-users.controller.ts
@ApiTags('admin')
@Controller({ path: 'admin/tenants/:tenantId/users', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get users in specific tenant (super admin only)
   */
  @Get()
  @ApiOperation({ summary: 'Get users in specific tenant' })
  async findAllInTenant(
    @Param('tenantId') tenantId: string,
    @Query() query: UserQueryDto,
  ) {
    return this.usersService.findAllInTenant(tenantId, query);
  }

  /**
   * Create user in specific tenant (super admin only)
   */
  @Post()
  @ApiOperation({ summary: 'Create user in specific tenant' })
  async createInTenant(
    @Param('tenantId') tenantId: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.createUserInTenant(tenantId, createUserDto);
  }
}

// backend/src/modules/admin/controllers/admin-analytics.controller.ts
@ApiTags('admin')
@Controller({ path: 'admin/analytics', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminAnalyticsController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get cross-tenant user statistics (super admin only)
   */
  @Get('users')
  @ApiOperation({ summary: 'Get user statistics across all tenants' })
  async getUserStatistics(@Query() query: AnalyticsQueryDto) {
    return this.usersService.findAllAcrossTenants(query);
  }
}
```

### 6. Frontend Architecture

#### Separate Admin and Tenant Contexts

```typescript
// frontend/src/contexts/admin-context.tsx
interface AdminContextType {
  isSuperAdmin: boolean;
  managedTenantId: string | null;
  setManagedTenant: (tenantId: string | null) => void;
  tenants: Tenant[];
  loadTenants: () => Promise<void>;
}

export const AdminProvider: React.FC = ({ children }) => {
  const { user } = useAuth();
  const [managedTenantId, setManagedTenantId] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const isSuperAdmin = user?.tenant?.subdomain === 'walatech';

  const loadTenants = async () => {
    if (!isSuperAdmin) return;
    
    const response = await apiClient.get('/admin/tenants');
    if (response.data) {
      setTenants(response.data);
    }
  };

  return (
    <AdminContext.Provider value={{
      isSuperAdmin,
      managedTenantId,
      setManagedTenant: setManagedTenantId,
      tenants,
      loadTenants,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

// Usage in components
const UserManagement = () => {
  const { isSuperAdmin, managedTenantId } = useAdmin();
  
  const fetchUsers = async () => {
    if (isSuperAdmin && managedTenantId) {
      // Fetch users from specific tenant
      return apiClient.get(`/admin/tenants/${managedTenantId}/users`);
    } else {
      // Fetch users from own tenant
      return apiClient.get('/users');
    }
  };
};
```

### 7. Enhanced UI/UX

#### Tenant Context Indicator

```typescript
// frontend/src/components/TenantContextBanner.tsx
export const TenantContextBanner = () => {
  const { isSuperAdmin, managedTenantId, tenants } = useAdmin();
  const { tenant: currentTenant } = useTenant();
  
  if (!isSuperAdmin) return null;
  
  const managedTenant = tenants.find(t => t.id === managedTenantId);
  const isManagingOtherTenant = managedTenantId && managedTenantId !== currentTenant?.id;
  
  return (
    <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5" />
        <span className="font-semibold">Super Admin Mode</span>
        {isManagingOtherTenant && (
          <>
            <span>•</span>
            <span>Managing: {managedTenant?.name}</span>
          </>
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setManagedTenant(null)}
      >
        Return to My Tenant
      </Button>
    </div>
  );
};
```

### 8. Audit Logging

```typescript
// backend/src/common/decorators/audit-log.decorator.ts
export function AuditLog(action: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = this.request;
      const user = request.user;
      const tenantId = request.tenant_id;
      
      // Log the action
      await auditLogService.log({
        action,
        userId: user?.id,
        userEmail: user?.email,
        tenantId,
        targetTenantId: args[0], // If managing another tenant
        timestamp: new Date(),
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Usage
@Post('admin/tenants/:tenantId/users')
@AuditLog('CREATE_USER_IN_TENANT')
async createUserInTenant(
  @Param('tenantId') tenantId: string,
  @Body() createUserDto: CreateUserDto,
) {
  return this.usersService.createUserInTenant(tenantId, createUserDto);
}
```

## Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Create `BaseScopedRepository` with explicit scoping
- [ ] Add `ScopeMode` enum and permission system
- [ ] Create `SuperAdminGuard`
- [ ] Update existing services to use new repository

### Phase 2: API Restructuring (Week 2)
- [ ] Create `/api/admin/*` namespace
- [ ] Implement `AdminUsersController`
- [ ] Implement `AdminDepartmentsController`
- [ ] Implement `AdminTenantsController`
- [ ] Add audit logging

### Phase 3: Frontend Updates (Week 3)
- [ ] Create `AdminContext`
- [ ] Update `UserManagement` component
- [ ] Update `DepartmentManagement` component
- [ ] Add `TenantContextBanner`
- [ ] Update API client for admin endpoints

### Phase 4: Testing & Migration (Week 4)
- [ ] Write integration tests
- [ ] Test tenant isolation thoroughly
- [ ] Migrate existing data if needed
- [ ] Update documentation
- [ ] Deploy to staging

## Benefits of This Approach

### Security
✅ Explicit tenant scoping - No accidental data leakage
✅ Permission-based access control
✅ Audit trail for all cross-tenant operations
✅ Clear separation of super admin and tenant operations

### Developer Experience
✅ Clear, RESTful API structure
✅ Easy to understand and maintain
✅ Type-safe with explicit parameters
✅ Self-documenting endpoints

### User Experience
✅ Clear visual indication of tenant context
✅ Intuitive navigation
✅ No confusion about which tenant's data is being viewed
✅ Easy tenant switching for super admins

### Compliance
✅ GDPR-compliant with proper data isolation
✅ Complete audit trail
✅ Role-based access control
✅ Data residency support (if needed)

## Migration Strategy

### Backward Compatibility

1. **Keep existing endpoints** for current tenant operations
2. **Add new admin endpoints** alongside
3. **Gradually migrate frontend** to use new endpoints
4. **Deprecate header-based tenant switching** after migration
5. **Remove old code** after thorough testing

### Database Migration

```sql
-- Add audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES tabuser(id),
  user_email VARCHAR(140),
  tenant_id UUID REFERENCES tenant(id),
  target_tenant_id UUID REFERENCES tenant(id),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

## Conclusion

This architecture provides:
- **Clear separation** between super admin and tenant operations
- **Explicit scoping** that prevents accidental data leakage
- **Better UX** with clear tenant context indicators
- **Audit trail** for compliance
- **Scalable** for future multi-tenant features

The key principle: **Make tenant context explicit, not implicit**.
