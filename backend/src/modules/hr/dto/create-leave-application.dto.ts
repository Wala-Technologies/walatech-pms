import { IsString, IsOptional, IsDateString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveApplicationStatus } from '../entities/leave-application.entity';

export class CreateLeaveApplicationDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employee_id: string;

  @ApiProperty({ description: 'Employee name' })
  @IsString()
  employee_name: string;

  @ApiProperty({ description: 'Leave type ID' })
  @IsString()
  leave_type_id: string;

  @ApiProperty({ description: 'Leave start date', example: '2024-01-15' })
  @IsDateString()
  from_date: string;

  @ApiProperty({ description: 'Leave end date', example: '2024-01-17' })
  @IsDateString()
  to_date: string;

  @ApiProperty({ description: 'Total leave days', minimum: 0.5 })
  @IsNumber()
  @Min(0.5)
  total_leave_days: number;

  @ApiPropertyOptional({ description: 'Leave description/reason' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Leave approver email/ID' })
  @IsOptional()
  @IsString()
  leave_approver?: string;

  @ApiPropertyOptional({ description: 'Leave application status', enum: LeaveApplicationStatus, default: 'Open' })
  @IsOptional()
  @IsEnum(LeaveApplicationStatus)
  status?: LeaveApplicationStatus = LeaveApplicationStatus.OPEN;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  company: string;

  @ApiPropertyOptional({ description: 'Department name' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Posting date', example: '2024-01-10' })
  @IsOptional()
  @IsDateString()
  posting_date?: string;

  @ApiPropertyOptional({ description: 'Follow via email flag' })
  @IsOptional()
  follow_via_email?: boolean;

  @ApiPropertyOptional({ description: 'Color for calendar display' })
  @IsOptional()
  @IsString()
  color?: string;
}