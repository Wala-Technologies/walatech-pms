import { UserRole, AccessLevel, ROLE_ACCESS_MAPPING } from './userManagementService';
import { apiClient } from '../api-client';

// Permission System Types
export interface Permission {
  id: string;
  module: string;
  action: string;
  resource: string;
  description: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with';
  value: any;
  description: string;
}

export interface RolePermission {
  id: string;
  role: UserRole;
  permission_id: string;
  permission: Permission;
  granted: boolean;
  conditions?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface UserPermissionOverride {
  id: string;
  user_id: string;
  permission_id: string;
  permission: Permission;
  granted: boolean;
  reason: string;
  granted_by: string;
  expires_at?: Date;
  created_at: Date;
}

// Module definitions
export enum Module {
  USERS = 'users',
  ROLES = 'roles',
  DEPARTMENTS = 'departments',
  CUSTOMERS = 'customers',
  SUPPLIERS = 'suppliers',
  INVENTORY = 'inventory',
  SALES = 'sales',
  PURCHASING = 'purchasing',
  PRODUCTION = 'production',
  ACCOUNTING = 'accounting',
  HR = 'hr',
  PROJECTS = 'projects',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  AUDIT = 'audit'
}

// Action definitions
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  RESET = 'reset',
  CONFIGURE = 'configure'
}

// Resource definitions
export enum Resource {
  ALL = '*',
  OWN = 'own',
  DEPARTMENT = 'department',
  SUBORDINATES = 'subordinates',
  SPECIFIC = 'specific'
}

// Predefined permission sets for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Full system access
    { id: 'super_admin_all', module: '*', action: '*', resource: '*', description: 'Full system access' }
  ],
  
  [UserRole.HR]: [
    // User management
    { id: 'hr_users_all', module: Module.USERS, action: '*', resource: Resource.ALL, description: 'Full user management' },
    { id: 'hr_roles_all', module: Module.ROLES, action: '*', resource: Resource.ALL, description: 'Full role management' },
    { id: 'hr_departments_all', module: Module.DEPARTMENTS, action: '*', resource: Resource.ALL, description: 'Full department management' },
    { id: 'hr_hr_all', module: Module.HR, action: '*', resource: Resource.ALL, description: 'Full HR management' },
    // Read access to other modules
    { id: 'hr_reports_read', module: Module.REPORTS, action: Action.READ, resource: Resource.ALL, description: 'View all reports' },
    { id: 'hr_audit_read', module: Module.AUDIT, action: Action.READ, resource: Resource.ALL, description: 'View audit logs' }
  ],
  
  [UserRole.MANAGER]: [
    // Cross-department access
    { id: 'manager_users_read', module: Module.USERS, action: Action.READ, resource: Resource.ALL, description: 'View all users' },
    { id: 'manager_departments_read', module: Module.DEPARTMENTS, action: Action.READ, resource: Resource.ALL, description: 'View all departments' },
    { id: 'manager_reports_all', module: Module.REPORTS, action: '*', resource: Resource.ALL, description: 'Full report access' },
    { id: 'manager_projects_all', module: Module.PROJECTS, action: '*', resource: Resource.ALL, description: 'Full project management' },
    // Limited access to operational modules
    { id: 'manager_sales_read', module: Module.SALES, action: Action.READ, resource: Resource.ALL, description: 'View sales data' },
    { id: 'manager_purchasing_read', module: Module.PURCHASING, action: Action.READ, resource: Resource.ALL, description: 'View purchasing data' },
    { id: 'manager_production_read', module: Module.PRODUCTION, action: Action.READ, resource: Resource.ALL, description: 'View production data' },
    { id: 'manager_accounting_read', module: Module.ACCOUNTING, action: Action.READ, resource: Resource.ALL, description: 'View accounting data' }
  ],
  
  [UserRole.DEPARTMENT_HEAD]: [
    // Department-specific management
    { id: 'dept_head_users_dept', module: Module.USERS, action: '*', resource: Resource.DEPARTMENT, description: 'Manage department users' },
    { id: 'dept_head_dept_own', module: Module.DEPARTMENTS, action: Action.UPDATE, resource: Resource.OWN, description: 'Manage own department' },
    { id: 'dept_head_reports_dept', module: Module.REPORTS, action: '*', resource: Resource.DEPARTMENT, description: 'Department reports' },
    { id: 'dept_head_projects_dept', module: Module.PROJECTS, action: '*', resource: Resource.DEPARTMENT, description: 'Department projects' }
  ],
  
  [UserRole.REGULAR_USER]: [
    // Basic access
    { id: 'user_profile_own', module: Module.USERS, action: Action.UPDATE, resource: Resource.OWN, description: 'Update own profile' },
    { id: 'user_reports_own', module: Module.REPORTS, action: Action.READ, resource: Resource.OWN, description: 'View own reports' }
  ],
  
  [UserRole.SALES]: [
    // Sales-specific permissions
    { id: 'sales_customers_all', module: Module.CUSTOMERS, action: '*', resource: Resource.DEPARTMENT, description: 'Manage customers' },
    { id: 'sales_sales_all', module: Module.SALES, action: '*', resource: Resource.DEPARTMENT, description: 'Full sales management' },
    { id: 'sales_inventory_read', module: Module.INVENTORY, action: Action.READ, resource: Resource.ALL, description: 'View inventory' },
    { id: 'sales_reports_sales', module: Module.REPORTS, action: '*', resource: Resource.DEPARTMENT, description: 'Sales reports' }
  ],
  
  [UserRole.PURCHASING]: [
    // Purchasing-specific permissions
    { id: 'purchasing_suppliers_all', module: Module.SUPPLIERS, action: '*', resource: Resource.DEPARTMENT, description: 'Manage suppliers' },
    { id: 'purchasing_purchasing_all', module: Module.PURCHASING, action: '*', resource: Resource.DEPARTMENT, description: 'Full purchasing management' },
    { id: 'purchasing_inventory_update', module: Module.INVENTORY, action: Action.UPDATE, resource: Resource.DEPARTMENT, description: 'Update inventory' },
    { id: 'purchasing_reports_purchasing', module: Module.REPORTS, action: '*', resource: Resource.DEPARTMENT, description: 'Purchasing reports' }
  ],
  
  [UserRole.PRODUCTION]: [
    // Production-specific permissions
    { id: 'production_production_all', module: Module.PRODUCTION, action: '*', resource: Resource.DEPARTMENT, description: 'Full production management' },
    { id: 'production_inventory_update', module: Module.INVENTORY, action: Action.UPDATE, resource: Resource.DEPARTMENT, description: 'Update inventory' },
    { id: 'production_reports_production', module: Module.REPORTS, action: '*', resource: Resource.DEPARTMENT, description: 'Production reports' }
  ],
  
  [UserRole.ACCOUNTING]: [
    // Accounting-specific permissions
    { id: 'accounting_accounting_all', module: Module.ACCOUNTING, action: '*', resource: Resource.DEPARTMENT, description: 'Full accounting management' },
    { id: 'accounting_reports_financial', module: Module.REPORTS, action: '*', resource: Resource.ALL, description: 'Financial reports' },
    { id: 'accounting_audit_read', module: Module.AUDIT, action: Action.READ, resource: Resource.ALL, description: 'View audit logs' }
  ]
};

// Permission checking utilities
class PermissionService {
  private userRole: UserRole | null = null;
  private userDepartmentId: string | null = null;
  private userPermissions: RolePermission[] = [];
  private userOverrides: UserPermissionOverride[] = [];

  // Initialize user context
  setUserContext(role: UserRole, departmentId?: string) {
    this.userRole = role;
    this.userDepartmentId = departmentId || null;
    this.loadUserPermissions();
  }

  // Load user permissions from backend
  private async loadUserPermissions() {
    try {
      if (!this.userRole) return;
      
      const [rolePermissions, userOverrides] = await Promise.all([
        this.getRolePermissions(this.userRole),
        this.getUserPermissionOverrides()
      ]);
      
      this.userPermissions = rolePermissions;
      this.userOverrides = userOverrides;
    } catch (error) {
      console.error('Error loading user permissions:', error);
    }
  }

  // Core permission checking
  hasPermission(module: string, action: string, resource: string = Resource.ALL, context?: any): boolean {
    if (!this.userRole) return false;

    // Super admin has all permissions
    if (this.userRole === UserRole.SUPER_ADMIN) return true;

    // Check user-specific overrides first
    const override = this.userOverrides.find(o => 
      o.permission.module === module && 
      o.permission.action === action && 
      o.permission.resource === resource &&
      (!o.expires_at || new Date(o.expires_at) > new Date())
    );
    
    if (override) return override.granted;

    // Check role permissions
    const rolePermission = this.userPermissions.find(p => 
      (p.permission.module === module || p.permission.module === '*') &&
      (p.permission.action === action || p.permission.action === '*') &&
      this.checkResourceAccess(p.permission.resource, resource, context)
    );

    if (!rolePermission) return false;

    // Check conditions if any
    if (rolePermission.conditions) {
      return this.evaluateConditions(rolePermission.conditions, context);
    }

    return rolePermission.granted;
  }

  // Resource access checking
  private checkResourceAccess(permissionResource: string, requestedResource: string, context?: any): boolean {
    if (permissionResource === '*' || permissionResource === requestedResource) return true;
    
    if (permissionResource === Resource.DEPARTMENT && this.userDepartmentId) {
      return context?.department_id === this.userDepartmentId;
    }
    
    if (permissionResource === Resource.OWN) {
      return context?.user_id === context?.current_user_id;
    }
    
    return false;
  }

  // Condition evaluation
  private evaluateConditions(conditions: Record<string, any>, context?: any): boolean {
    if (!context) return false;
    
    for (const [field, condition] of Object.entries(conditions)) {
      const contextValue = context[field];
      
      switch (condition.operator) {
        case 'equals':
          if (contextValue !== condition.value) return false;
          break;
        case 'not_equals':
          if (contextValue === condition.value) return false;
          break;
        case 'in':
          if (!condition.value.includes(contextValue)) return false;
          break;
        case 'not_in':
          if (condition.value.includes(contextValue)) return false;
          break;
        default:
          return false;
      }
    }
    
    return true;
  }

  // Convenience methods for common permission checks
  canCreateUser(): boolean {
    return this.hasPermission(Module.USERS, Action.CREATE);
  }

  canUpdateUser(userId: string): boolean {
    return this.hasPermission(Module.USERS, Action.UPDATE, Resource.ALL) ||
           this.hasPermission(Module.USERS, Action.UPDATE, Resource.OWN, { user_id: userId });
  }

  canDeleteUser(): boolean {
    return this.hasPermission(Module.USERS, Action.DELETE);
  }

  canManageRoles(): boolean {
    return this.hasPermission(Module.ROLES, Action.UPDATE);
  }

  canViewReports(reportType?: string): boolean {
    return this.hasPermission(Module.REPORTS, Action.READ, reportType || Resource.ALL);
  }

  canExportData(module: string): boolean {
    return this.hasPermission(module, Action.EXPORT);
  }

  canImportData(module: string): boolean {
    return this.hasPermission(module, Action.IMPORT);
  }

  // Department-specific checks
  canAccessDepartment(departmentId: string): boolean {
    if (!this.userRole) return false;
    
    const accessLevel = ROLE_ACCESS_MAPPING[this.userRole];
    
    switch (accessLevel) {
      case AccessLevel.ALL_DEPARTMENTS:
        return true;
      case AccessLevel.OWN_DEPARTMENT:
        return departmentId === this.userDepartmentId;
      case AccessLevel.RESTRICTED:
        return false;
      default:
        return false;
    }
  }

  // API methods for permission management
  async getRolePermissions(role: UserRole): Promise<RolePermission[]> {
    try {
      const response = await apiClient.get(`/roles/${role}/permissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      return [];
    }
  }

  async getUserPermissionOverrides(): Promise<UserPermissionOverride[]> {
    try {
      const response = await apiClient.get('/users/me/permission-overrides');
      return response.data;
    } catch (error) {
      console.error('Error fetching user permission overrides:', error);
      return [];
    }
  }

  async grantUserPermission(userId: string, permissionId: string, reason: string, expiresAt?: Date): Promise<UserPermissionOverride> {
    try {
      const response = await apiClient.post(`/users/${userId}/permissions`, {
        permission_id: permissionId,
        granted: true,
        reason,
        expires_at: expiresAt
      });
      return response.data;
    } catch (error) {
      console.error('Error granting user permission:', error);
      throw new Error('Failed to grant permission');
    }
  }

  async revokeUserPermission(userId: string, permissionId: string, reason: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${userId}/permissions/${permissionId}`, {
        data: { reason }
      });
    } catch (error) {
      console.error('Error revoking user permission:', error);
      throw new Error('Failed to revoke permission');
    }
  }

  async updateRolePermissions(role: UserRole, permissions: Partial<RolePermission>[]): Promise<void> {
    try {
      await apiClient.patch(`/roles/${role}/permissions`, { permissions });
    } catch (error) {
      console.error('Error updating role permissions:', error);
      throw new Error('Failed to update role permissions');
    }
  }

  // Permission discovery
  getAvailablePermissions(): Permission[] {
    const permissions: Permission[] = [];
    
    Object.values(Module).forEach(module => {
      Object.values(Action).forEach(action => {
        Object.values(Resource).forEach(resource => {
          permissions.push({
            id: `${module}_${action}_${resource}`,
            module,
            action,
            resource,
            description: `${action} ${resource} in ${module}`
          });
        });
      });
    });
    
    return permissions;
  }

  getRolePermissionSet(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  // Permission comparison and analysis
  compareRolePermissions(role1: UserRole, role2: UserRole): {
    common: Permission[];
    role1Only: Permission[];
    role2Only: Permission[];
  } {
    const permissions1 = this.getRolePermissionSet(role1);
    const permissions2 = this.getRolePermissionSet(role2);
    
    const common = permissions1.filter(p1 => 
      permissions2.some(p2 => 
        p1.module === p2.module && p1.action === p2.action && p1.resource === p2.resource
      )
    );
    
    const role1Only = permissions1.filter(p1 => 
      !permissions2.some(p2 => 
        p1.module === p2.module && p1.action === p2.action && p1.resource === p2.resource
      )
    );
    
    const role2Only = permissions2.filter(p2 => 
      !permissions1.some(p1 => 
        p1.module === p2.module && p1.action === p2.action && p1.resource === p2.resource
      )
    );
    
    return { common, role1Only, role2Only };
  }

  // Utility methods
  getModuleDisplayName(module: string): string {
    return module.charAt(0).toUpperCase() + module.slice(1).replace('_', ' ');
  }

  getActionDisplayName(action: string): string {
    return action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ');
  }

  getResourceDisplayName(resource: string): string {
    switch (resource) {
      case Resource.ALL: return 'All Resources';
      case Resource.OWN: return 'Own Resources';
      case Resource.DEPARTMENT: return 'Department Resources';
      case Resource.SUBORDINATES: return 'Subordinate Resources';
      case Resource.SPECIFIC: return 'Specific Resources';
      default: return resource;
    }
  }
}

export const permissionService = new PermissionService();
export default permissionService;