import { IsOptional, IsString, IsNumber, IsEnum, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-roles.enum';

export class UserQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ required: false, enum: ['active', 'inactive'] })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiProperty({ required: false, default: 'created_at' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}