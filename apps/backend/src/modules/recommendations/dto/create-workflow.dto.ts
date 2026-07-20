import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreateWorkflowStepDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsObject()
  @IsOptional()
  config?: any;

  @IsString()
  @IsOptional()
  dependsOn?: string;
}

export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  type: string;

  @IsArray()
  steps: CreateWorkflowStepDto[];

  @IsString()
  @IsOptional()
  status?: string;
}
