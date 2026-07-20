import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
}

export class CreateTaskDto {
  @ApiProperty({ description: 'Görev başlığı' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Görev açıklaması', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Son teslim tarihi', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ description: 'Öncelik', enum: TaskPriority })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty({ description: 'Durum', enum: TaskStatus })
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
