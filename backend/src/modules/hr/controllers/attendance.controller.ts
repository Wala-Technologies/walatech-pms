import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Scope,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from '../services/attendance.service';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Attendance } from '../entities/attendance.entity';

@ApiTags('attendance')
@Controller({ path: 'hr/attendance', scope: Scope.REQUEST })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attendance record' })
  @ApiResponse({ status: 201, description: 'Attendance record created successfully' })
  @ApiResponse({ status: 409, description: 'Attendance already exists for this date' })
  async create(@Body() createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiResponse({ status: 200, description: 'Attendance records retrieved successfully' })
  async findAll(): Promise<Attendance[]> {
    return this.attendanceService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get attendance statistics' })
  @ApiResponse({ status: 200, description: 'Attendance statistics retrieved successfully' })
  async getAttendanceStats(
    @Query('employee_id') employeeId?: string,
    @Query('month') month?: string,
  ): Promise<any> {
    return this.attendanceService.getAttendanceStats(employeeId, month);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get attendance records by date range' })
  @ApiResponse({ status: 200, description: 'Attendance records retrieved successfully' })
  async findByDateRange(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ): Promise<Attendance[]> {
    return this.attendanceService.findByDateRange(startDate, endDate);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get attendance records for a specific employee' })
  @ApiResponse({ status: 200, description: 'Employee attendance records retrieved successfully' })
  async findByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ): Promise<Attendance[]> {
    return this.attendanceService.findByEmployee(employeeId, startDate, endDate);
  }

  @Post('check-in/:employeeId')
  @ApiOperation({ summary: 'Check in an employee' })
  @ApiResponse({ status: 201, description: 'Employee checked in successfully' })
  @ApiResponse({ status: 409, description: 'Employee already checked in today' })
  async checkIn(
    @Param('employeeId') employeeId: string,
    @Body('check_in_time') checkInTime?: string,
  ): Promise<Attendance> {
    return this.attendanceService.checkIn(employeeId, checkInTime);
  }

  @Patch('check-out/:employeeId')
  @ApiOperation({ summary: 'Check out an employee' })
  @ApiResponse({ status: 200, description: 'Employee checked out successfully' })
  @ApiResponse({ status: 404, description: 'No check-in record found' })
  @ApiResponse({ status: 409, description: 'Employee already checked out' })
  async checkOut(
    @Param('employeeId') employeeId: string,
    @Body('check_out_time') checkOutTime?: string,
  ): Promise<Attendance> {
    return this.attendanceService.checkOut(employeeId, checkOutTime);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiResponse({ status: 200, description: 'Attendance record found successfully' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  async findOne(@Param('id') id: string): Promise<Attendance> {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attendance record' })
  @ApiResponse({ status: 200, description: 'Attendance record updated successfully' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  async update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an attendance record' })
  @ApiResponse({ status: 204, description: 'Attendance record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.attendanceService.remove(id);
  }
}