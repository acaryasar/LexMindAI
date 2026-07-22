import { IsString, IsObject, IsOptional, IsBoolean, IsEnum, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AIOrchestrationOptionsDto {
  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  stream?: boolean;

  @ApiProperty({ required: false, default: 30000 })
  @IsOptional()
  @IsNumber()
  timeout?: number;

  @ApiProperty({ required: false, default: 3 })
  @IsOptional()
  @IsNumber()
  maxRetries?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  enableCache?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  enableMemory?: boolean;

  @ApiProperty({ required: false, enum: ['low', 'medium', 'high'], default: 'medium' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';
}

export class AIOrchestrationRequestDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  agentType: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  context?: any;

  @ApiProperty()
  @IsObject()
  input: any;

  @ApiProperty({ required: false })
  @IsOptional()
  orchestrationOptions?: AIOrchestrationOptionsDto;
}

export class AIActionDto {
  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  outcome?: string;
}

export class AIOrchestrationMetadataDto {
  @ApiProperty()
  @IsNumber()
  executionTime: number;

  @ApiProperty()
  @IsNumber()
  tokensUsed: number;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  agentsExecuted: string[];

  @ApiProperty()
  @IsBoolean()
  cacheHit: boolean;

  @ApiProperty()
  @IsBoolean()
  memoryUsed: boolean;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty()
  @IsString()
  provider: string;
}

export class AIOrchestrationResponseDto {
  @ApiProperty()
  @IsString()
  agentType: string;

  @ApiProperty()
  @IsObject()
  result: any;

  @ApiProperty()
  @IsNumber()
  confidence: number;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  reasons: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  sources: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  recommendations: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  warnings: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  actions: AIActionDto[];

  @ApiProperty()
  metadata: AIOrchestrationMetadataDto;
}
