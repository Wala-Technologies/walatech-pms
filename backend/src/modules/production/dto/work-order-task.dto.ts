import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsInt, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskType } from '../entities/work-order-task.entity';

export class CreateWorkOrderTaskDto {
  @ApiProperty({ description: 'Task title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Task description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Task type', enum: TaskType })
  @IsEnum(TaskType)
  type: TaskType;

  @ApiProperty({ description: 'Work order ID' })
  @IsUUID()
  workOrderId: string;

  @ApiPropertyOptional({ description: 'Task sequence number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number;

  @ApiPropertyOptional({ description: 'Operation name/code' })
  @IsOptional()
  @IsString()
  operation?: string;

  @ApiPropertyOptional({ description: 'Workstation' })
  @IsOptional()
  @IsString()
  workstation?: string;

  @ApiPropertyOptional({ description: 'Machine' })
  @IsOptional()
  @IsString()
  machine?: string;

  @ApiPropertyOptional({ description: 'Estimated hours', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  estimatedHours?: number;

  @ApiPropertyOptional({ description: 'Hour rate', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourRate?: number;

  @ApiPropertyOptional({ description: 'Planned start time' })
  @IsOptional()
  @IsDateString()
  plannedStartTime?: string;

  @ApiPropertyOptional({ description: 'Planned end time' })
  @IsOptional()
  @IsDateString()
  plannedEndTime?: string;

  @ApiPropertyOptional({ description: 'Task instructions' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Quality parameters' })
  @IsOptional()
  @IsString()
  qualityParameters?: string;

  @ApiPropertyOptional({ description: 'Assigned to user ID' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;
}

export class UpdateWorkOrderTaskDto {
  @ApiPropertyOptional({ description: 'Task title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Task description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Task status', enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ description: 'Task type', enum: TaskType })
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @ApiPropertyOptional({ description: 'Task sequence number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number;

  @ApiPropertyOptional({ description: 'Operation name/code' })
  @IsOptional()
  @IsString()
  operation?: string;

  @ApiPropertyOptional({ description: 'Workstation' })
  @IsOptional()
  @IsString()
  workstation?: string;

  @ApiPropertyOptional({ description: 'Machine' })
  @IsOptional()
  @IsString()
  machine?: string;

  @ApiPropertyOptional({ description: 'Estimated hours', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  estimatedHours?: number;

  @ApiPropertyOptional({ description: 'Actual hours', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  actualHours?: number;

  @ApiPropertyOptional({ description: 'Hour rate', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourRate?: number;

  @ApiPropertyOptional({ description: 'Operating cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  operatingCost?: number;

  @ApiPropertyOptional({ description: 'Planned start time' })
  @IsOptional()
  @IsDateString()
  plannedStartTime?: string;

  @ApiPropertyOptional({ description: 'Planned end time' })
  @IsOptional()
  @IsDateString()
  plannedEndTime?: string;

  @ApiPropertyOptional({ description: 'Completed quantity', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  completedQty?: number;

  @ApiPropertyOptional({ description: 'Rejected quantity', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  rejectedQty?: number;

  @ApiPropertyOptional({ description: 'Task instructions' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Quality parameters' })
  @IsOptional()
  @IsString()
  qualityParameters?: string;

  @ApiPropertyOptional({ description: 'Task notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Assigned to user ID' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Time log entries' })
  @IsOptional()
  timeLog?: any;

  @ApiPropertyOptional({ description: 'Quality check data' })
  @IsOptional()
  qualityData?: any;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;
}

export class WorkOrderTaskQueryDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by status', enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ description: 'Filter by type', enum: TaskType })
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @ApiPropertyOptional({ description: 'Filter by work order ID' })
  @IsOptional()
  @IsUUID()
  workOrderId?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned user ID' })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class WorkOrderTaskResponseDto {
  @ApiProperty({ description: 'Task ID' })
  id: string;

  @ApiProperty({ description: 'Task number' })
  taskNumber: string;

  @ApiProperty({ description: 'Title' })
  title: string;

  @ApiProperty({ description: 'Description' })
  description: string;

  @ApiProperty({ description: 'Status', enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ description: 'Type', enum: TaskType })
  type: TaskType;

  @ApiProperty({ description: 'Sequence number' })
  sequence: number;

  @ApiProperty({ description: 'Operation' })
  operation: string;

  @ApiProperty({ description: 'Workstation' })
  workstation: string;

  @ApiProperty({ description: 'Machine' })
  machine: string;

  @ApiProperty({ description: 'Estimated hours' })
  estimatedHours: number;

  @ApiProperty({ description: 'Actual hours' })
  actualHours: number;

  @ApiProperty({ description: 'Operating cost' })
  operatingCost: number;

  @ApiProperty({ description: 'Planned start time' })
  plannedStartTime: Date;

  @ApiProperty({ description: 'Planned end time' })
  plannedEndTime: Date;

  @ApiProperty({ description: 'Actual start time' })
  actualStartTime: Date;

  @ApiProperty({ description: 'Actual end time' })
  actualEndTime: Date;

  @ApiProperty({ description: 'Completed quantity' })
  completedQty: number;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Is completed' })
  isCompleted: boolean;

  @ApiProperty({ description: 'Is in progress' })
  isInProgress: boolean;

  @ApiProperty({ description: 'Is overdue' })
  isOverdue: boolean;

  @ApiProperty({ description: 'Duration in hours' })
  duration: number;

  @ApiProperty({ description: 'Efficiency percentage' })
  efficiency: number;

  @ApiProperty({ description: 'Completion percentage' })
  completionPercentage: number;
}

export class TimeLogEntryDto {
  @ApiProperty({ description: 'Start time' })
  @IsDateString()
  startTime: string;

  @ApiPropertyOptional({ description: 'End time' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Hours worked', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hours?: number;

  @ApiPropertyOptional({ description: 'Activity description' })
  @IsOptional()
  @IsString()
  activity?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QualityCheckDto {
  @ApiProperty({ description: 'Parameter name' })
  @IsString()
  parameter: string;

  @ApiProperty({ description: 'Expected value' })
  @IsString()
  expectedValue: string;

  @ApiProperty({ description: 'Actual value' })
  @IsString()
  actualValue: string;

  @ApiProperty({ description: 'Pass/Fail status' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Checked at' })
  @IsDateString()
  checkedAt: string;

  @ApiProperty({ description: 'Checked by user ID' })
  @IsUUID()
  checkedById: string;
}