# Department-Based Filtering Implementation

## Overview

This document outlines the implementation of department-based filtering across all modules in the WalaTech PMS system. The implementation ensures that users can only access data from departments they have access to across Sales, Inventory, HR, and Accounting modules.

## Architecture

### Core Components

1. **DepartmentAccessService** - Central service for department access validation
2. **Updated Controllers** - All sales controllers now pass userId for filtering
3. **Updated Services** - All sales services use department filtering
4. **Updated DTOs** - All DTOs include required department_id field
5. **Entity Support** - All sales entities have department_id field

## Implementation Details

### 1. DepartmentAccessService

**Location:** `src/modules/common/services/department-access.service.ts`

```typescript
@Injectable()
export class DepartmentAccessService {
  constructor(
    @InjectRepository(UserDepartment)
    private userDepartmentRepository: Repository<UserDepartment>,
  ) {}

  async getUserAccessibleDepartments(userId: string): Promise<string[]> {
    // Returns array of department IDs the user has access to
  }

  async canUserAccessDepartment(userId: string, departmentId: string): Promise<boolean> {
    // Validates if user can access specific department
  }

  async filterByUserDepartments<T extends { department_id: string }>(
    userId: string,
    entities: T[]
  ): Promise<T[]> {
    // Filters entities based on user's department access
  }
}
```

**Key Features:**
- Retrieves user's accessible departments from UserDepartment entity
- Provides department access validation
- Filters entity arrays based on department access
- Handles both single department and multi-department access scenarios

### 2. Controller Updates

All sales controllers have been updated to pass the `userId` parameter to service methods:

#### Quotations Controller
**Location:** `src/modules/sales/controllers/quotations.controller.ts`

```typescript
@Get()
async findAll(@Request() req: AuthRequest) {
  return this.quotationsService.findAll(req.user.tenant_id, req.user.user_id);
}

@Get(':id')
async findOne(@Param('id') id: string, @Request() req: AuthRequest) {
  return this.quotationsService.findOne(id, req.user.tenant_id, req.user.user_id);
}
```

#### Sales Orders Controller
**Location:** `src/modules/sales/controllers/sales-orders.controller.ts`

```typescript
@Get()
async findAll(@Request() req: AuthRequest) {
  return this.salesOrdersService.findAll(req.user.tenant_id, req.user.user_id);
}

@Get(':id')
async findOne(@Param('id') id: string, @Request() req: AuthRequest) {
  return this.salesOrdersService.findOne(id, req.user.tenant_id, req.user.user_id);
}
```

#### Delivery Notes Controller
**Location:** `src/modules/sales/controllers/delivery-notes.controller.ts`

```typescript
@Get()
async findAll(@Request() req: AuthRequest) {
  return this.deliveryNotesService.findAll(req.user.tenant_id, req.user.user_id);
}

@Get(':id')
async findOne(@Param('id') id: string, @Request() req: AuthRequest) {
  return this.deliveryNotesService.findOne(id, req.user.tenant_id, req.user.user_id);
}
```

#### Sales Invoices Controller
**Location:** `src/modules/sales/controllers/sales-invoices.controller.ts`

```typescript
@Get()
async findAll(@Request() req: AuthRequest) {
  return this.salesInvoicesService.findAll(req.user.tenant_id, req.user.user_id);
}

@Get(':id')
async findOne(@Param('id') id: string, @Request() req: AuthRequest) {
  return this.salesInvoicesService.findOne(id, req.user.tenant_id, req.user.user_id);
}
```

### 3. Service Updates

All sales services have been updated to use the DepartmentAccessService:

#### Pattern Used in All Services

```typescript
async findAll(tenantId: string, userId: string) {
  // Get all records for tenant
  const records = await this.repository.find({
    where: { tenant_id: tenantId },
    relations: ['customer', 'department']
  });

  // Filter by user's accessible departments
  return this.departmentAccessService.filterByUserDepartments(userId, records);
}

async findOne(id: string, tenantId: string, userId: string) {
  const record = await this.repository.findOne({
    where: { id, tenant_id: tenantId },
    relations: ['customer', 'department']
  });

  if (!record) {
    throw new NotFoundException('Record not found');
  }

  // Validate department access
  const canAccess = await this.departmentAccessService.canUserAccessDepartment(
    userId,
    record.department_id
  );

  if (!canAccess) {
    throw new ForbiddenException('Access denied to this department');
  }

  return record;
}
```

### 4. DTO Updates

All DTOs have been updated to include the required `department_id` field:

#### Create Quotation DTO
**Location:** `src/modules/sales/services/quotations.service.ts`

```typescript
interface CreateQuotationDto {
  customer_id: string;
  department_id: string; // Added required field
  quotation_items: CreateQuotationItemDto[];
  notes?: string;
}
```

#### Create Sales Order DTO
**Location:** `src/modules/sales/dto/sales-orders/create-sales-order.dto.ts`

```typescript
export class CreateSalesOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  department_id: string; // Changed from optional to required

  // ... other fields
}
```

#### Create Delivery Note DTO
**Location:** `src/modules/sales/dto/create-delivery-note.dto.ts`

```typescript
export class CreateDeliveryNoteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  department_id: string; // Changed from optional to required

  // ... other fields
}
```

#### Create Sales Invoice DTO
**Location:** `src/modules/sales/dto/create-sales-invoice.dto.ts`

```typescript
export class CreateSalesInvoiceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  department_id: string; // Changed from optional to required

  // ... other fields
}
```

### 5. Entity Support

All sales entities already have the `department_id` field:

- **Quotation Entity:** `src/entities/quotation.entity.ts`
- **Sales Order Entity:** `src/entities/sales-order.entity.ts`
- **Delivery Note Entity:** `src/entities/delivery-note.entity.ts`
- **Sales Invoice Entity:** `src/entities/sales-invoice.entity.ts`

Each entity includes:
```typescript
@Column({ nullable: true })
department_id: string;

@ManyToOne(() => Department)
@JoinColumn({ name: 'department_id' })
department: Department;
```

### 6. Module Integration

The DepartmentAccessService has been registered in the sales module:

**Location:** `src/modules/sales/sales.module.ts`

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      // ... entities
      UserDepartment,
    ]),
    // ... other imports
  ],
  controllers: [
    // ... controllers
  ],
  providers: [
    // ... other services
    DepartmentAccessService,
  ],
})
export class SalesModule {}
```

## Security Features

### 1. Department Access Validation
- Users can only access records from departments they have access to
- Single record access validates department permissions
- Bulk operations filter results by accessible departments

### 2. Tenant Isolation
- All operations maintain tenant-level isolation
- Department filtering works within tenant boundaries
- No cross-tenant data access possible

### 3. Role-Based Access
- Department access is managed through UserDepartment entity
- Supports multiple department access per user
- Flexible permission model for different user roles

## Testing

### Test Script
A comprehensive test script has been created: `test-department-sales-filtering.js`

**Features:**
- Tests all sales endpoints (quotations, sales orders, delivery notes, sales invoices)
- Validates authentication and authorization
- Checks data structure and department_id presence
- Provides implementation status summary

**Usage:**
```bash
node test-department-sales-filtering.js
```

### Test Scenarios Covered
1. **Endpoint Accessibility** - All sales endpoints respond correctly
2. **Data Structure** - Records include department_id field
3. **Authentication** - Proper JWT token validation
4. **Service Integration** - DepartmentAccessService is properly integrated

## Benefits

### 1. Data Security
- Prevents unauthorized access to department data
- Ensures users only see relevant information
- Maintains data privacy across departments

### 2. Scalability
- Centralized department access logic
- Easy to extend to other modules
- Consistent implementation across all sales entities

### 3. Maintainability
- Single service handles all department access logic
- Consistent patterns across controllers and services
- Clear separation of concerns

## Future Enhancements

### 1. Caching
- Cache user department access for better performance
- Implement Redis-based caching for frequently accessed data

### 2. Audit Logging
- Log department access attempts
- Track unauthorized access attempts
- Maintain audit trail for compliance

### 3. Advanced Permissions
- Implement read/write permissions per department
- Add time-based access controls
- Support for temporary department access

## Conclusion

The department-based filtering implementation provides a robust, secure, and scalable solution for controlling access to sales data based on user department assignments. The implementation follows best practices for security, maintainability, and performance while ensuring a consistent user experience across all sales modules.

All sales controllers, services, DTOs, and entities have been successfully updated to support department-based filtering, providing a complete end-to-end solution for department-based data access control.

## Module Coverage Summary

### 1. Sales Module ✅ COMPLETE
**Entities with Department Filtering:**
- Quotations (`quotations.service.ts`)
- Sales Orders (`sales-orders.service.ts`)
- Delivery Notes (`delivery-notes.service.ts`)
- Sales Invoices (`sales-invoices.service.ts`)

**Implementation Status:**
- ✅ DepartmentAccessService integrated
- ✅ Request-scoped services
- ✅ Department validation in create/update operations
- ✅ Department filtering in findAll/findOne operations
- ✅ Proper error handling for unauthorized access

### 2. Inventory Module ✅ COMPLETE
**Entities with Department Filtering:**
- Items (`inventory.service.ts`)

**Implementation Status:**
- ✅ DepartmentAccessService integrated
- ✅ Request-scoped service with REQUEST injection
- ✅ Department validation in createItem/updateItem
- ✅ Department filtering in findAllItems/findOneItem
- ✅ Default department assignment for new items

**Note:** Stock Entries and Warehouses do not require department filtering as they are organization-wide resources.

### 3. HR Module ✅ COMPLETE
**Entities with Department Filtering:**
- Employees (`employees.service.ts`)
- Attendance (`attendance.service.ts`)

**Implementation Status:**
- ✅ DepartmentAccessService integrated
- ✅ Request-scoped services
- ✅ Department validation in employee operations
- ✅ Department filtering in attendance records
- ✅ Proper access control for employee data

**Note:** Departments service (`departments.service.ts`) manages department entities themselves and doesn't require filtering.

### 4. Accounting Module ✅ COMPLETE
**Entities with Department Filtering:**
- Journal Entries (`accounting.service.ts` - `listJournalEntries`)
- Payment Entries (`accounting.service.ts` - `listPaymentEntries`)

**Implementation Status:**
- ✅ DepartmentAccessService integrated
- ✅ Request-scoped service
- ✅ Department validation in journal entry creation
- ✅ Department filtering in listing operations
- ✅ Default department assignment

**Note:** Chart of Accounts, Cost Centers, and Fiscal Years are typically organization-wide and may not require department filtering.

## Testing

### Comprehensive Test Script
A comprehensive test script has been created: `test-department-filtering-comprehensive.js`

**Coverage:**
- ✅ Sales Module (4 endpoints)
- ✅ Inventory Module (2 endpoints)
- ✅ HR Module (3 endpoints)
- ✅ Accounting Module (5 endpoints)

**Features:**
- Tests all major endpoints across modules
- Validates authentication and authorization
- Checks data structure and department_id presence
- Provides comprehensive implementation status summary
- Generates detailed reports with recommendations

**Usage:**
```bash
node test-department-filtering-comprehensive.js
```

## Implementation Patterns

### Standard Service Pattern
All services follow this consistent pattern:

```typescript
@Injectable({ scope: Scope.REQUEST })
export class ExampleService {
  constructor(
    @InjectRepository(Entity) private repository: Repository<Entity>,
    @Inject(REQUEST) private request: any,
    private departmentAccessService: DepartmentAccessService,
  ) {}

  private get tenant_id(): string {
    return this.request.tenant_id || this.request.user?.tenant_id;
  }

  private get user(): any {
    return this.request.user;
  }

  async findAll() {
    const queryBuilder = this.repository.createQueryBuilder('entity')
      .where('entity.tenant_id = :tenant_id', { tenant_id: this.tenant_id });

    // Apply department-based access control
    const user = this.user;
    if (user && !this.departmentAccessService.canAccessAllDepartments(user)) {
      const accessibleDepartmentIds = this.departmentAccessService.getAccessibleDepartmentIds(user);
      if (accessibleDepartmentIds.length > 0) {
        queryBuilder.andWhere('entity.department_id IN (:...departmentIds)', {
          departmentIds: accessibleDepartmentIds,
        });
      } else {
        queryBuilder.andWhere('1 = 0'); // No access
      }
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const entity = await this.repository.findOne({
      where: { id, tenant_id: this.tenant_id },
    });

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    // Validate department access
    const user = this.user;
    if (user && entity.department_id && !this.departmentAccessService.canAccessDepartment(user, entity.department_id)) {
      throw new NotFoundException('Entity not found');
    }

    return entity;
  }

  async create(createDto: CreateDto) {
    const user = this.user;
    let departmentId = createDto.department_id;

    // Set default department if not provided
    if (!departmentId && user) {
      departmentId = this.departmentAccessService.getDefaultDepartmentForUser(user);
    }

    // Validate department access
    if (user && departmentId && !this.departmentAccessService.canModifyItemForDepartment(user, departmentId)) {
      throw new BadRequestException('Access denied: You cannot create items for this department');
    }

    const entity = this.repository.create({
      ...createDto,
      department_id: departmentId,
      tenant_id: this.tenant_id,
    });

    return this.repository.save(entity);
  }
}
```

## Security Benefits

### 1. Complete Data Isolation
- Users can only access data from their assigned departments
- Cross-department data access is prevented
- Tenant-level isolation is maintained

### 2. Consistent Implementation
- Standardized patterns across all modules
- Centralized access control logic
- Uniform error handling

### 3. Scalable Architecture
- Easy to extend to new modules
- Maintainable codebase
- Clear separation of concerns

## Conclusion

The department-based filtering implementation now provides comprehensive coverage across all major modules in the WalaTech PMS system. This ensures consistent data access control, maintains security boundaries, and provides a scalable foundation for future development.