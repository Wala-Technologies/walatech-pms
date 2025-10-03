import { Injectable } from '@nestjs/common';
import { UserRole, AccessLevel, ROLE_ACCESS_MAPPING } from '../enums/user-roles.enum';
import { User } from '../../entities/user.entity';

@Injectable()
export class DepartmentAccessService {
  
  /**
   * Determines if a user can access all departments
   */
  canAccessAllDepartments(user: User): boolean {
    const accessLevel = ROLE_ACCESS_MAPPING[user.role];
    return accessLevel === AccessLevel.ALL_DEPARTMENTS;
  }

  /**
   * Gets the department IDs that a user can access
   */
  getAccessibleDepartmentIds(user: User): string[] | null {
    if (this.canAccessAllDepartments(user)) {
      return null; // null means access to all departments
    }
    
    // Regular users can only access their own department
    if (user.department_id) {
      return [user.department_id];
    }
    
    return []; // No department access
  }

  /**
   * Checks if a user can access a specific department
   */
  canAccessDepartment(user: User, departmentId: string): boolean {
    if (this.canAccessAllDepartments(user)) {
      return true;
    }
    
    return user.department_id === departmentId;
  }

  /**
   * Builds a WHERE clause for department filtering
   */
  buildDepartmentWhereClause(user: User, alias: string = 'entity'): { clause: string; parameters: any } {
    if (this.canAccessAllDepartments(user)) {
      return { clause: '', parameters: {} };
    }
    
    if (user.department_id) {
      return {
        clause: `${alias}.department_id = :userDepartmentId`,
        parameters: { userDepartmentId: user.department_id }
      };
    }
    
    // If user has no department, they can't access any department-specific data
    return {
      clause: `${alias}.department_id IS NULL`,
      parameters: {}
    };
  }

  /**
   * Validates if a user can create/modify an item for a specific department
   */
  canModifyItemForDepartment(user: User, departmentId: string | null): boolean {
    // Users with all department access can modify items for any department
    if (this.canAccessAllDepartments(user)) {
      return true;
    }
    
    // Regular users can only modify items for their own department
    if (departmentId === null) {
      // Items without department can be modified by anyone (legacy items)
      return true;
    }
    
    return user.department_id === departmentId;
  }

  /**
   * Gets the default department for item creation
   */
  getDefaultDepartmentForUser(user: User): string | null {
    // Users with all department access don't have a default department
    if (this.canAccessAllDepartments(user)) {
      return null;
    }
    
    return user.department_id;
  }
}