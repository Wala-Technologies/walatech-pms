import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDesignationDto {
  @ApiProperty({
    description: 'Unique name for the designation',
    example: 'software-engineer',
    maxLength: 140,
  })
  @IsString()
  @MaxLength(140)
  name: string;

  @ApiProperty({
    description: 'Display name for the designation',
    example: 'Software Engineer',
    maxLength: 140,
  })
  @IsString()
  @MaxLength(140)
  designation_name: string;

  @ApiPropertyOptional({
    description: 'Description of the designation',
    example: 'Responsible for developing and maintaining software applications',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Required skills for this designation',
    example: 'JavaScript, TypeScript, Node.js, React, Database Management',
  })
  @IsOptional()
  @IsString()
  skill_requirements?: string;

  @ApiPropertyOptional({
    description: 'Detailed job description',
    example: 'Design, develop, test, and maintain software applications. Collaborate with cross-functional teams to deliver high-quality solutions.',
  })
  @IsOptional()
  @IsString()
  job_description?: string;
}