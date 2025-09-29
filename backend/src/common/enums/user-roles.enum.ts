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