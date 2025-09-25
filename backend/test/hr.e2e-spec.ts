import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('HR Module (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdDepartmentId: string;
  let createdDepartmentName: string;
  let createdDesignationId: string;
  let createdEmployeeId: string;
  let createdEmployeeName: string;
  let createdLeaveTypeId: string;
  let createdShiftTypeId: string;
  let createdLeaveApplicationId: string;
  let createdAttendanceId: string;

  const passwordCandidates = ['admin123', 'password123', 'walatech-pass'];

  async function attemptLogin(
    email: string,
    password: string,
  ): Promise<{ access_token: string } | null> {
    const domain = email.split('@')[1] || '';
    const sub = domain.split('.')[0];
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Host', `${sub}.localhost`)
      .send({ email, password, subdomain: sub });
    
    if (res.status === HttpStatus.CREATED && res.body?.access_token)
      return res.body;
    return null;
  }

  async function loginWithFallback(email: string): Promise<{ access_token: string }> {
    for (const pwd of passwordCandidates) {
      const result = await attemptLogin(email, pwd);
      if (result) return result;
    }
    throw new Error(
      `Failed to login user ${email} with provided password candidates`,
    );
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    // Login as admin user
    const loginRes = await loginWithFallback('admin@walatech.com');
    authToken = loginRes.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Departments', () => {
    it('should create a new department', async () => {
      const timestamp = Date.now();
      const departmentData = {
        name: `Engineering-${timestamp}`,
        department_name: `Software Engineering Department ${timestamp}`,
        company: 'Walatech'
      };

      const res = await request(app.getHttpServer())
        .post('/api/hr/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .send(departmentData)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(departmentData.name);
      expect(res.body.department_name).toBe(departmentData.department_name);
      
      createdDepartmentId = res.body.id;
      createdDepartmentName = departmentData.name;
    });

    it('should retrieve all departments', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/hr/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should retrieve a specific department by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/hr/departments/${createdDepartmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(createdDepartmentId);
      expect(res.body.name).toBe(createdDepartmentName);
    });

    it('should update a department', async () => {
      const updateData = {
        name: 'Software Engineering',
        department_name: 'Updated Software Engineering Department'
      };

      const res = await request(app.getHttpServer())
        .patch(`/api/hr/departments/${createdDepartmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(res.body.name).toBe(updateData.name);
      expect(res.body.description).toBe(updateData.description);
    });
  });

  describe('Designations', () => {
    it('should create a new designation', async () => {
      const timestamp = Date.now();
      const designationData = {
        name: `senior-software-engineer-${timestamp}`,
        designation_name: `Senior Software Engineer ${timestamp}`,
        description: 'Senior level software engineer position'
      };

      const res = await request(app.getHttpServer())
        .post('/api/hr/designations')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .send(designationData)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(designationData.name);
      expect(res.body.designation_name).toBe(designationData.designation_name);
      expect(res.body.description).toBe(designationData.description);
      
      createdDesignationId = res.body.id;
    });

    it('should retrieve all designations', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/hr/designations')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });


  });

  describe('Shift Types', () => {
    it('should create a new shift type', async () => {
      const timestamp = Date.now();
      const shiftTypeData = {
        name: `Day Shift ${timestamp}`,
        start_time: '09:00',
        end_time: '17:00',
        total_hours: 8.0
      };

      const res = await request(app.getHttpServer())
        .post('/api/hr/shift-types')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .send(shiftTypeData)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(shiftTypeData.name);
      expect(res.body.start_time).toBe(shiftTypeData.start_time);
      expect(res.body.end_time).toBe(shiftTypeData.end_time);
      
      createdShiftTypeId = res.body.id;
    });

    it('should retrieve all shift types', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/hr/shift-types')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Leave Types', () => {
    it('should create a new leave type', async () => {
      const timestamp = Date.now();
      const leaveTypeData = {
        name: `annual-leave-${timestamp}`,
        leave_type_name: `Annual Leave ${timestamp}`,
        description: 'Annual vacation leave',
        max_leaves_allowed: 25,
        is_carry_forward: false,
        is_encash: false,
        is_lwp: false
      };

      const res = await request(app.getHttpServer())
        .post('/api/hr/leave-types')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .send(leaveTypeData)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(leaveTypeData.name);
      expect(res.body.leave_type_name).toBe(leaveTypeData.leave_type_name);
      expect(parseFloat(res.body.max_leaves_allowed)).toBe(leaveTypeData.max_leaves_allowed);
      expect(res.body.is_carry_forward).toBe(leaveTypeData.is_carry_forward);
      
      createdLeaveTypeId = res.body.id;
    });

    it('should retrieve all leave types', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/hr/leave-types')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Employees', () => {
    it('should create a new employee', async () => {
      const timestamp = Date.now();
      const employeeData = {
        name: `EMP${timestamp}`,
        employee_name: `John Doe ${timestamp}`,
        first_name: 'John',
        last_name: `Doe${timestamp}`,
        company_email: `john.doe.${timestamp}@walatech.com`,
        cell_number: `+123456${timestamp.toString().slice(-4)}`,
        date_of_birth: '1990-01-15',
        date_of_joining: '2023-01-01',
        department_id: createdDepartmentId,
        designation_id: createdDesignationId,
        salary_amount: 75000,
        status: 'Active',
        current_address: '123 Main St, City, Country',
        company: 'WalaTech'
      };

      const res = await request(app.getHttpServer())
        .post('/api/hr/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .send(employeeData)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(employeeData.name);
      expect(res.body.employee_name).toBe(employeeData.employee_name);
      expect(res.body.first_name).toBe(employeeData.first_name);
      expect(res.body.last_name).toBe(employeeData.last_name);
      expect(res.body.company_email).toBe(employeeData.company_email);
      
      createdEmployeeId = res.body.id;
      createdEmployeeName = employeeData.name;
    });

    it('should retrieve all employees', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/hr/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('employees');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.employees)).toBe(true);
      expect(res.body.employees.length).toBeGreaterThan(0);
    });

    it('should retrieve a specific employee by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/hr/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe(createdEmployeeId);
      expect(res.body.name).toBe(createdEmployeeName);
    });

    it('should search employees by name', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/hr/employees?search=John')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('employees');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.employees)).toBe(true);
      expect(res.body.employees.length).toBeGreaterThan(0);
      expect(res.body.employees[0].employee_name).toContain('John');
    });

    it('should get employees by department', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/hr/employees/by-department/${createdDepartmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(employee => {
        expect(employee.department_id).toBe(createdDepartmentId);
      });
    });
  });

  describe('Leave Applications', () => {
    it('should create a new leave application', async () => {
      const leaveApplicationData = {
        employee_id: createdEmployeeId,
        employee_name: 'John Doe Test',
        leave_type_id: createdLeaveTypeId,
        from_date: '2024-03-01',
        to_date: '2024-03-05',
        description: 'Annual vacation',
        status: 'Open',
        posting_date: '2024-02-28',
        total_leave_days: 5,
        company: 'WalaTech'
      };

      const res = await request(app.getHttpServer())
        .post('/api/hr/leave-applications')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .send(leaveApplicationData)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.employee_id).toBe(leaveApplicationData.employee_id);
      expect(res.body.leave_type_id).toBe(leaveApplicationData.leave_type_id);
      expect(res.body.description).toBe(leaveApplicationData.description);
      expect(res.body.status).toBe(leaveApplicationData.status);
      expect(res.body.total_leave_days).toBe(leaveApplicationData.total_leave_days);
      
      createdLeaveApplicationId = res.body.id;
    });

    it('should retrieve all leave applications', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/hr/leave-applications')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get leave applications by employee', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/hr/leave-applications/employee/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(application => {
        expect(application.employee_id).toBe(createdEmployeeId);
      });
    });

    it('should approve a leave application', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/hr/leave-applications/${createdLeaveApplicationId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(res.body.status).toBe('Approved');
    });
  });

  describe('Attendance', () => {
    it('should create a new attendance record', async () => {
      const attendanceData = {
        employee_id: createdEmployeeId,
        attendance_date: new Date().toISOString().split('T')[0], // Use today's date to ensure uniqueness
        in_time: '09:00:00',
        out_time: '17:30:00',
        working_hours: 8.5,
        status: 'Present',
        company: 'WalaTech'
      };

      const res = await request(app.getHttpServer())
        .post('/api/hr/attendance')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .send(attendanceData);

      if (res.status !== HttpStatus.CREATED) {
        console.log('Attendance creation failed:', res.status, res.body);
        console.log('Employee ID used:', createdEmployeeId);
        console.log('Attendance data:', attendanceData);
      }
      
      expect(res.status).toBe(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.employee_id).toBe(attendanceData.employee_id);
      expect(res.body.status).toBe(attendanceData.status);
      
      createdAttendanceId = res.body.id;
    });

    it('should retrieve attendance records', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/hr/attendance')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get attendance by employee', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/hr/attendance/employee/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach(record => {
        expect(record.employee_id).toBe(createdEmployeeId);
      });
    });

    it('should get attendance by date range', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/hr/attendance/date-range?start_date=2024-02-01&end_date=2024-02-29')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all HR endpoints', async () => {
      const endpoints = [
        '/api/hr/departments',
        '/api/hr/designations',
        '/api/hr/employees',
        '/api/hr/leave-types',
        '/api/hr/leave-applications',
        '/api/hr/shift-types',
        '/api/hr/attendance'
      ];

      for (const endpoint of endpoints) {
        await request(app.getHttpServer())
          .get(endpoint)
          .set('Host', 'walatech.localhost')
          .expect(HttpStatus.UNAUTHORIZED);
      }
    });
  });

  describe('Tenant Isolation', () => {
    it('should only return HR data for the current tenant', async () => {
      // Test departments
      const departmentsRes = await request(app.getHttpServer())
        .get('/api/hr/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      departmentsRes.body.forEach(department => {
        expect(department.tenant_id).toBe('550e8400-e29b-41d4-a716-446655440000');
      });

      // Test employees
      const employeesRes = await request(app.getHttpServer())
        .get('/api/hr/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Host', 'walatech.localhost')
        .expect(HttpStatus.OK);

      employeesRes.body.employees.forEach(employee => {
        expect(employee.tenant_id).toBe('550e8400-e29b-41d4-a716-446655440000');
      });
    });
  });

  describe('Cleanup', () => {
    it('should clean up test data', async () => {
      // Delete in reverse order of creation to handle foreign key constraints
      if (createdAttendanceId) {
        await request(app.getHttpServer())
          .delete(`/api/hr/attendance/${createdAttendanceId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .set('Host', 'walatech.localhost');
      }

      if (createdLeaveApplicationId) {
        await request(app.getHttpServer())
          .delete(`/api/hr/leave-applications/${createdLeaveApplicationId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .set('Host', 'walatech.localhost');
      }

      if (createdEmployeeId) {
        await request(app.getHttpServer())
          .delete(`/api/hr/employees/${createdEmployeeId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .set('Host', 'walatech.localhost');
      }

      if (createdLeaveTypeId) {
        await request(app.getHttpServer())
          .delete(`/api/hr/leave-types/${createdLeaveTypeId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .set('Host', 'walatech.localhost');
      }

      if (createdShiftTypeId) {
        await request(app.getHttpServer())
          .delete(`/api/hr/shift-types/${createdShiftTypeId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .set('Host', 'walatech.localhost');
      }

      if (createdDesignationId) {
        await request(app.getHttpServer())
          .delete(`/api/hr/designations/${createdDesignationId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .set('Host', 'walatech.localhost');
      }

      if (createdDepartmentId) {
        await request(app.getHttpServer())
          .delete(`/api/hr/departments/${createdDepartmentId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .set('Host', 'walatech.localhost');
      }
    });
  });
});