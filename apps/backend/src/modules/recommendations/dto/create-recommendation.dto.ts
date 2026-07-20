import { IsString, IsInt, IsOptional, IsArray, IsObject, Min, Max } from 'class-validator';

export class CreateRecommendationActionDto {
  @IsString()
  type: string;

  @IsString()
  label: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  requiresApproval?: boolean;

  @IsString()
  @IsOptional()
  outcome?: string;
}

export class CreateRecommendationDto {
  @IsString()
  type: string;

  @IsString()
  priority: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  businessImpact?: string;

  @IsString()
  @IsOptional()
  legalImpact?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  estimatedTime?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  confidenceScore: number;

  @IsObject()
  @IsOptional()
  context?: any;

  @IsArray()
  @IsOptional()
  actions?: CreateRecommendationActionDto[];

  @IsString()
  @IsOptional()
  workflowId?: string;
}
