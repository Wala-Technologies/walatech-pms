import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import { Attendance } from './entities/attendance.entity';
import { LeaveApplication } from './entities/leave-application.entity';
import { LeaveType } from './entities/leave-type.entity';
import { ShiftType } from './entities/shift-type.entity';
import { EmployeesController } from './controllers/employees.controller';
import { DepartmentsController } from './controllers/departments.controller';
import { AttendanceController } from './controllers/attendance.controller';
import { LeaveApplicationsController } from './controllers/leave-applications.controller';
import { LeaveTypesController } from './controllers/leave-types.controller';
import { ShiftTypesController } from './controllers/shift-types.controller';
import { DesignationsController } from './controllers/designations.controller';
import { EmployeesService } from './services/employees.service';
import { DepartmentsService } from './services/departments.service';
import { AttendanceService } from './services/attendance.service';
import { LeaveApplicationsService } from './services/leave-applications.service';
import { LeaveTypesService } from './services/leave-types.service';
import { ShiftTypesService } from './services/shift-types.service';
import { DesignationsService } from './services/designations.service';
import { DepartmentAccessService } from '../../common/services/department-access.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Department,
      Designation,
      Attendance,
      LeaveApplication,
      LeaveType,
      ShiftType,
    ]),
  ],
  controllers: [
    EmployeesController,
    DepartmentsController,
    AttendanceController,
    LeaveApplicationsController,
    LeaveTypesController,
    ShiftTypesController,
    DesignationsController,
  ],
  providers: [
    EmployeesService,
    DepartmentsService,
    AttendanceService,
    LeaveApplicationsService,
    LeaveTypesService,
    ShiftTypesService,
    DesignationsService,
    DepartmentAccessService,
  ],
  exports: [
    EmployeesService,
    DepartmentsService,
    AttendanceService,
    LeaveApplicationsService,
    LeaveTypesService,
    ShiftTypesService,
    DesignationsService,
  ],
})
export class HrModule {}