import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../entities/attendance.entity';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employee_id: string;

  @ApiProperty({ description: 'Attendance date', example: '2024-01-15' })
  @IsDateString()
  attendance_date: string;

  @ApiProperty({ description: 'Attendance status', enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Check-in time', example: '09:00:00' })
  @IsOptional()
  @IsString()
  in_time?: string;

  @ApiPropertyOptional({ description: 'Check-out time', example: '18:00:00' })
  @IsOptional()
  @IsString()
  out_time?: string;

  @ApiPropertyOptional({ description: 'Working hours', example: 8.5 })
  @IsOptional()
  @IsNumber()
  working_hours?: number;

  @ApiPropertyOptional({ description: 'Late entry flag', default: false })
  @IsOptional()
  @IsBoolean()
  late_entry?: boolean = false;

  @ApiPropertyOptional({ description: 'Early exit flag', default: false })
  @IsOptional()
  @IsBoolean()
  early_exit?: boolean = false;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  company: string;

  @ApiPropertyOptional({ description: 'Department name' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Shift type ID' })
  @IsOptional()
  @IsString()
  shift_type_id?: string;

  @ApiPropertyOptional({ description: 'Leave application ID if on leave' })
  @IsOptional()
  @IsString()
  leave_application_id?: string;

  @ApiPropertyOptional({ description: 'Attendance request reference' })
  @IsOptional()
  @IsString()
  attendance_request?: string;

  @ApiPropertyOptional({ description: 'Remarks or notes' })
  @IsOptional()
  @IsString()
  remarks?: string;
}