import { IsString, IsOptional, IsObject } from 'class-validator';

export class ExecuteWorkflowDto {
  @IsString()
  workflowId: string;

  @IsObject()
  @IsOptional()
  context?: any;
}
