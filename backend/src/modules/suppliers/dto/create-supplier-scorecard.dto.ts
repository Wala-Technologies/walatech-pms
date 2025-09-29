import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, IsArray, ValidateNested, Min, Max, MaxLength, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierScorecardCriteriaDto {
  @ApiProperty({ description: 'Criteria name', maxLength: 140 })
  @IsString()
  @MaxLength(140)
  criteria_name: string;

  @ApiProperty({ description: 'Weight percentage', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @ApiPropertyOptional({ description: 'Scoring formula', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  formula?: string;

  @ApiPropertyOptional({ description: 'Criteria description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateSupplierScorecardPeriodDto {
  @ApiProperty({ description: 'Period start date' })
  @IsDateString()
  period_start: string;

  @ApiProperty({ description: 'Period end date' })
  @IsDateString()
  period_end: string;

  @ApiPropertyOptional({ description: 'Period score', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  period_score?: number;

  @ApiPropertyOptional({ description: 'Criteria scores as JSON object' })
  @IsOptional()
  @IsString()
  criteria_scores?: string;

  @ApiPropertyOptional({ description: 'Period notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateSupplierScorecardDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsString()
  supplier_id: string;

  @ApiProperty({ description: 'Scorecard period', enum: ['Monthly', 'Quarterly', 'Half-yearly', 'Yearly'] })
  @IsIn(['Monthly', 'Quarterly', 'Half-yearly', 'Yearly'])
  period: string;

  @ApiPropertyOptional({ description: 'Current overall score', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  current_score?: number;

  @ApiPropertyOptional({ description: 'Scoring formula', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  scoring_formula?: string;

  @ApiPropertyOptional({ description: 'Supplier standing', enum: ['Excellent', 'Good', 'Average', 'Poor', 'Unacceptable'] })
  @IsOptional()
  @IsIn(['Excellent', 'Good', 'Average', 'Poor', 'Unacceptable'])
  supplier_standing?: string;

  @ApiPropertyOptional({ description: 'Warn RFQs based on standing', default: false })
  @IsOptional()
  @IsBoolean()
  warn_rfqs?: boolean;

  @ApiPropertyOptional({ description: 'Warn Purchase Orders based on standing', default: false })
  @IsOptional()
  @IsBoolean()
  warn_pos?: boolean;

  @ApiPropertyOptional({ description: 'Prevent RFQs based on standing', default: false })
  @IsOptional()
  @IsBoolean()
  prevent_rfqs?: boolean;

  @ApiPropertyOptional({ description: 'Prevent Purchase Orders based on standing', default: false })
  @IsOptional()
  @IsBoolean()
  prevent_pos?: boolean;

  @ApiPropertyOptional({ description: 'Scorecard notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Evaluation criteria', type: [CreateSupplierScorecardCriteriaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSupplierScorecardCriteriaDto)
  criteria?: CreateSupplierScorecardCriteriaDto[];

  @ApiPropertyOptional({ description: 'Scoring periods', type: [CreateSupplierScorecardPeriodDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSupplierScorecardPeriodDto)
  periods?: CreateSupplierScorecardPeriodDto[];
}