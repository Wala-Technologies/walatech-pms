import { apiClient, ApiResponse } from './api-client';

// Enums
export enum EmployeeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  TERMINATED = 'Terminated'
}

export enum LeaveApplicationStatus {
  DRAFT = 'Draft',
  OPEN = 'Open',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled'
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  HALF_DAY = 'Half Day',
  LATE = 'Late',
  ON_LEAVE = 'On Leave'
}

// Core HR entity interfaces
export interface Department {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Designation {
  id: string;
  title: string;
  description?: string;
  departmentId?: string;
  department?: Department;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  employee_number: string;
  employee_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  date_of_joining: string;
  departmentId?: string;
  department?: Department;
  designationId?: string;
  designation?: Designation;
  salary?: number;
  status: EmployeeStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employee?: Employee;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveApplicationStatus;
  applied_date: string;
  approved_by?: string;
  approved_date?: string;
  rejection_reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employee?: Employee;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  total_hours?: number;
  status: AttendanceStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// Query parameter interfaces
export interface EmployeeQueryParams {
  search?: string;
  departmentId?: string;
  designationId?: string;
  status?: EmployeeStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface DepartmentQueryParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface DesignationQueryParams {
  search?: string;
  departmentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface LeaveApplicationQueryParams {
  employeeId?: string;
  status?: LeaveApplicationStatus;
  leave_type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AttendanceQueryParams {
  employeeId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

// Create/Update DTOs
export interface CreateEmployeeDto {
  name: string;
  employee_number: string;
  employee_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  date_of_joining: string;
  departmentId?: string;
  designationId?: string;
  salary?: number;
  status: EmployeeStatus;
  isActive?: boolean;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {}

export interface CreateDesignationDto {
  title: string;
  description?: string;
  departmentId?: string;
  isActive?: boolean;
}

export interface UpdateDesignationDto extends Partial<CreateDesignationDto> {}

export interface CreateLeaveApplicationDto {
  employeeId: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status?: LeaveApplicationStatus;
}

export interface UpdateLeaveApplicationDto extends Partial<CreateLeaveApplicationDto> {}

export interface CreateAttendanceDto {
  employeeId: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface UpdateAttendanceDto extends Partial<CreateAttendanceDto> {}

// Approval DTOs
export interface ApproveLeaveApplicationDto {
  approved_by: string;
  approved_date?: string;
}

export interface RejectLeaveApplicationDto {
  rejection_reason: string;
}

// Response interfaces for paginated results
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmployeesResponse {
  employees: Employee[];
  total: number;
}

export interface DepartmentsResponse {
  departments: Department[];
  total: number;
}

export interface DesignationsResponse {
  designations: Designation[];
  total: number;
}

export interface LeaveApplicationsResponse {
  applications: LeaveApplication[];
  total: number;
}

export interface AttendanceResponse {
  attendance: Attendance[];
  total: number;
}

// HR API service class
class HRApiService {
  // Employee endpoints
  async getEmployees(params?: EmployeeQueryParams): Promise<ApiResponse<EmployeesResponse>> {
    return apiClient.get('/hr/employees', params);
  }

  async getEmployee(id: string): Promise<ApiResponse<Employee>> {
    return apiClient.get(`/hr/employees/${id}`);
  }

  async createEmployee(data: CreateEmployeeDto): Promise<ApiResponse<Employee>> {
    return apiClient.post('/hr/employees', data);
  }

  async updateEmployee(id: string, data: UpdateEmployeeDto): Promise<ApiResponse<Employee>> {
    return apiClient.patch(`/hr/employees/${id}`, data);
  }

  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/hr/employees/${id}`);
  }

  async searchEmployeesByName(name: string): Promise<ApiResponse<EmployeesResponse>> {
    return apiClient.get(`/hr/employees/by-name/${name}`);
  }

  // Department endpoints
  async getDepartments(params?: DepartmentQueryParams): Promise<ApiResponse<DepartmentsResponse>> {
    return apiClient.get('/hr/departments', params);
  }

  async getDepartment(id: string): Promise<ApiResponse<Department>> {
    return apiClient.get(`/hr/departments/${id}`);
  }

  async createDepartment(data: CreateDepartmentDto): Promise<ApiResponse<Department>> {
    return apiClient.post('/hr/departments', data);
  }

  async updateDepartment(id: string, data: UpdateDepartmentDto): Promise<ApiResponse<Department>> {
    return apiClient.patch(`/hr/departments/${id}`, data);
  }

  async deleteDepartment(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/hr/departments/${id}`);
  }

  // Designation endpoints
  async getDesignations(params?: DesignationQueryParams): Promise<ApiResponse<DesignationsResponse>> {
    return apiClient.get('/hr/designations', params);
  }

  async getDesignation(id: string): Promise<ApiResponse<Designation>> {
    return apiClient.get(`/hr/designations/${id}`);
  }

  async createDesignation(data: CreateDesignationDto): Promise<ApiResponse<Designation>> {
    return apiClient.post('/hr/designations', data);
  }

  async updateDesignation(id: string, data: UpdateDesignationDto): Promise<ApiResponse<Designation>> {
    return apiClient.patch(`/hr/designations/${id}`, data);
  }

  async deleteDesignation(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/hr/designations/${id}`);
  }

  async searchDesignations(query: string): Promise<ApiResponse<DesignationsResponse>> {
    return apiClient.get('/hr/designations/search', { q: query });
  }

  // Leave Application endpoints
  async getLeaveApplications(params?: LeaveApplicationQueryParams): Promise<ApiResponse<LeaveApplication[]>> {
    return apiClient.get('/hr/leave-applications', params);
  }

  async getLeaveApplication(id: string): Promise<ApiResponse<LeaveApplication>> {
    return apiClient.get(`/hr/leave-applications/${id}`);
  }

  async createLeaveApplication(data: CreateLeaveApplicationDto): Promise<ApiResponse<LeaveApplication>> {
    return apiClient.post('/hr/leave-applications', data);
  }

  async updateLeaveApplication(id: string, data: UpdateLeaveApplicationDto): Promise<ApiResponse<LeaveApplication>> {
    return apiClient.patch(`/hr/leave-applications/${id}`, data);
  }

  async deleteLeaveApplication(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/hr/leave-applications/${id}`);
  }

  async approveLeaveApplication(id: string, data: ApproveLeaveApplicationDto): Promise<ApiResponse<LeaveApplication>> {
    return apiClient.patch(`/hr/leave-applications/${id}/approve`, data);
  }

  async rejectLeaveApplication(id: string, data: RejectLeaveApplicationDto): Promise<ApiResponse<LeaveApplication>> {
    return apiClient.patch(`/hr/leave-applications/${id}/reject`, data);
  }

  // Attendance endpoints
  async getAttendance(params?: AttendanceQueryParams): Promise<ApiResponse<AttendanceResponse>> {
    return apiClient.get('/hr/attendance', params);
  }

  async getAttendanceRecord(id: string): Promise<ApiResponse<Attendance>> {
    return apiClient.get(`/hr/attendance/${id}`);
  }

  async markAttendance(data: CreateAttendanceDto): Promise<ApiResponse<Attendance>> {
    return apiClient.post('/hr/attendance', data);
  }

  async updateAttendance(id: string, data: UpdateAttendanceDto): Promise<ApiResponse<Attendance>> {
    return apiClient.patch(`/hr/attendance/${id}`, data);
  }

  async deleteAttendance(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/hr/attendance/${id}`);
  }

  async getEmployeeAttendance(employeeId: string, params?: AttendanceQueryParams): Promise<ApiResponse<AttendanceResponse>> {
    return apiClient.get(`/hr/attendance/employee/${employeeId}`, params);
  }
}

// Export singleton instance
export const hrApi = new HRApiService();
export default hrApi;