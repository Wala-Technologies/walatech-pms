import { apiClient } from '../api-client';

// Types based on backend entities
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  mobile_no?: string;
  role_profile_name?: string;
  role: UserRole;
  enabled: boolean;
  language: string;
  time_zone: string;
  department_id?: string;
  tenant_id: string;
  creation: Date;
  modified: Date;
  last_login?: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  HR = 'hr',
  MANAGER = 'manager',
  DEPARTMENT_HEAD = 'department_head',
  REGULAR_USER = 'regular_user',
  SALES = 'sales',
  PURCHASING = 'purchasing',
  PRODUCTION = 'production',
  ACCOUNTING = 'accounting'
}

export enum AccessLevel {
  ALL_DEPARTMENTS = 'all_departments',
  OWN_DEPARTMENT = 'own_department',
  RESTRICTED = 'restricted'
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: UserRole;
  department_id?: string;
  language?: string;
  enabled?: boolean;
  phone?: string;
  employee_id?: string;
  position?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  department_id?: string;
  language?: string;
  enabled?: boolean;
  phone?: string;
  employee_id?: string;
  position?: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: 'active' | 'inactive';
  department_id?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UserListResponse {
  users: User[];
  total: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: { [key: string]: number };
  byDepartment: { [key: string]: number };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  department_id?: string;
  invited_by: string;
  invited_at: Date;
  expires_at: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitation_token: string;
}

export interface BulkUserOperation {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'update_role' | 'assign_department';
  data?: {
    role?: UserRole;
    department_id?: string;
    enabled?: boolean;
  };
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  details: string;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
}

export interface UserPermission {
  id: string;
  role: UserRole;
  module: string;
  action: string;
  resource: string;
  conditions?: Record<string, any>;
}

// Role access mapping from backend
export const ROLE_ACCESS_MAPPING = {
  [UserRole.SUPER_ADMIN]: AccessLevel.ALL_DEPARTMENTS,
  [UserRole.HR]: AccessLevel.ALL_DEPARTMENTS,
  [UserRole.MANAGER]: AccessLevel.ALL_DEPARTMENTS,
  [UserRole.DEPARTMENT_HEAD]: AccessLevel.ALL_DEPARTMENTS,
  [UserRole.REGULAR_USER]: AccessLevel.OWN_DEPARTMENT,
  [UserRole.SALES]: AccessLevel.OWN_DEPARTMENT,
  [UserRole.PURCHASING]: AccessLevel.OWN_DEPARTMENT,
  [UserRole.PRODUCTION]: AccessLevel.OWN_DEPARTMENT,
  [UserRole.ACCOUNTING]: AccessLevel.OWN_DEPARTMENT
};

export const ROLE_DESCRIPTIONS = {
  [UserRole.SUPER_ADMIN]: 'Full system access with all administrative privileges',
  [UserRole.HR]: 'Human resources management and employee administration',
  [UserRole.MANAGER]: 'Management oversight with cross-departmental access',
  [UserRole.DEPARTMENT_HEAD]: 'Department leadership and team management',
  [UserRole.REGULAR_USER]: 'Standard user with department-specific access',
  [UserRole.SALES]: 'Sales operations and customer management',
  [UserRole.PURCHASING]: 'Procurement and supplier management',
  [UserRole.PRODUCTION]: 'Manufacturing and production operations',
  [UserRole.ACCOUNTING]: 'Financial management and accounting operations'
};

class UserManagementService {
  private baseUrl = '/users';

  // Core User CRUD Operations
  async getUsers(params: UserQueryParams = {}): Promise<UserListResponse> {
    try {
      const response = await apiClient.get(this.baseUrl, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await apiClient.post(this.baseUrl, userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // User Status Management
  async toggleUserStatus(id: string): Promise<User> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw new Error('Failed to toggle user status');
    }
  }

  // Password Management
  async changePassword(id: string, passwordData: ChangePasswordRequest): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/change-password`, passwordData);
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Failed to change password');
    }
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/${id}/reset-password`, { newPassword });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error('Failed to reset password');
    }
  }

  // Role and Department Queries
  async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/by-role/${role}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw new Error('Failed to fetch users by role');
    }
  }

  async getUsersByDepartment(departmentId: string): Promise<User[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/by-department/${departmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users by department:', error);
      throw new Error('Failed to fetch users by department');
    }
  }

  // User Statistics
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  // Bulk Operations
  async bulkUpdateUsers(operation: BulkUserOperation): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk-update`, operation);
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      throw new Error('Failed to perform bulk operation');
    }
  }

  // User Invitations (Extended functionality)
  async inviteUser(invitation: Omit<UserInvitation, 'id' | 'invited_at' | 'expires_at' | 'status' | 'invitation_token'>): Promise<UserInvitation> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/invite`, invitation);
      return response.data;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw new Error('Failed to send user invitation');
    }
  }

  async getInvitations(): Promise<UserInvitation[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/invitations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw new Error('Failed to fetch invitations');
    }
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/invitations/${invitationId}`);
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      throw new Error('Failed to cancel invitation');
    }
  }

  async resendInvitation(invitationId: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/invitations/${invitationId}/resend`);
    } catch (error) {
      console.error('Error resending invitation:', error);
      throw new Error('Failed to resend invitation');
    }
  }

  // User Activity Tracking
  async getUserActivity(userId: string, limit: number = 50): Promise<UserActivity[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${userId}/activity`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw new Error('Failed to fetch user activity');
    }
  }

  // Permission Management
  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${userId}/permissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw new Error('Failed to fetch user permissions');
    }
  }

  async getRolePermissions(role: UserRole): Promise<UserPermission[]> {
    try {
      const response = await apiClient.get(`/roles/${role}/permissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      throw new Error('Failed to fetch role permissions');
    }
  }

  // Utility Methods
  getRoleDisplayName(role: UserRole): string {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  getRoleDescription(role: UserRole): string {
    return ROLE_DESCRIPTIONS[role] || 'No description available';
  }

  getAccessLevel(role: UserRole): AccessLevel {
    return ROLE_ACCESS_MAPPING[role] || AccessLevel.RESTRICTED;
  }

  canAccessAllDepartments(role: UserRole): boolean {
    return this.getAccessLevel(role) === AccessLevel.ALL_DEPARTMENTS;
  }

  isAdminRole(role: UserRole): boolean {
    return [UserRole.SUPER_ADMIN, UserRole.HR, UserRole.MANAGER].includes(role);
  }

  // Data Export/Import
  async exportUsers(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting users:', error);
      throw new Error('Failed to export users');
    }
  }

  async importUsers(file: File): Promise<{ success: number; errors: string[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(`${this.baseUrl}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing users:', error);
      throw new Error('Failed to import users');
    }
  }

  // Search and Filtering Helpers
  buildSearchQuery(searchTerm: string): UserQueryParams {
    return {
      search: searchTerm,
      page: 1,
      limit: 20,
      sortBy: 'first_name',
      sortOrder: 'ASC'
    };
  }

  buildRoleFilter(role: UserRole): UserQueryParams {
    return {
      role,
      page: 1,
      limit: 50,
      sortBy: 'first_name',
      sortOrder: 'ASC'
    };
  }

  buildDepartmentFilter(departmentId: string): UserQueryParams {
    return {
      department_id: departmentId,
      page: 1,
      limit: 50,
      sortBy: 'first_name',
      sortOrder: 'ASC'
    };
  }
}

export const userManagementService = new UserManagementService();
export default userManagementService;