import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ItemQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['Raw Material', 'Semi Finished', 'Finished Good', 'Service', 'Template'])
  type?: string;

  @IsOptional()
  @IsEnum(['Active', 'Inactive', 'Discontinued'])
  status?: string;

  @IsOptional()
  @IsString()
  itemGroup?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsEnum(['code', 'name', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}