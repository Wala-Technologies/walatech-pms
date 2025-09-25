const { DataSource } = require('typeorm');
const { Department } = require('./dist/modules/hr/entities/department.entity');
const { Employee } = require('./dist/modules/hr/entities/employee.entity');
const { Tenant } = require('./dist/entities/tenant.entity');
const { User } = require('./dist/entities/user.entity');
const { Designation } = require('./dist/modules/hr/entities/designation.entity');
const { Attendance } = require('./dist/modules/hr/entities/attendance.entity');
const { LeaveApplication } = require('./dist/modules/hr/entities/leave-application.entity');
const { LeaveType } = require('./dist/modules/hr/entities/leave-type.entity');
const { ShiftType } = require('./dist/modules/hr/entities/shift-type.entity');

async function testDepartmentQuery() {
  try {
    console.log('Creating DataSource...');
    const dataSource = new DataSource({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'walatech-pms',
      database: 'wala_pms',
      entities: [Department, Employee, Tenant, User, Designation, Attendance, LeaveApplication, LeaveType, ShiftType],
      synchronize: false,
    });

    await dataSource.initialize();
    console.log('DataSource initialized');

    const departmentRepository = dataSource.getRepository(Department);
    
    console.log('Testing simple findAll without relations...');
    const departments = await departmentRepository.find({
      where: { tenant_id: '550e8400-e29b-41d4-a716-446655440000' }
    });
    
    console.log('Departments found (without relations):', departments.length);
    
    console.log('Testing findAll with employees relation...');
    try {
      const departmentsWithEmployees = await departmentRepository.find({
        where: { tenant_id: '550e8400-e29b-41d4-a716-446655440000' },
        relations: ['employees']
      });
      console.log('Departments with employees found:', departmentsWithEmployees.length);
    } catch (relationError) {
      console.error('Error with employees relation:', relationError.message);
    }
    
    await dataSource.destroy();
  } catch (error) {
    console.error('Error testing Department query:', error);
    console.error('Stack trace:', error.stack);
  }
}

testDepartmentQuery();