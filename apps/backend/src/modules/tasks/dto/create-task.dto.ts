import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum TaskPriority {
  LOW = 'DÜŞÜK',
  MEDIUM = 'ORTA',
  HIGH = 'YÜKSEK',
  URGENT = 'ACİL',
}

export enum TaskStatus {
  TODO = 'YENİ',
  IN_PROGRESS = 'İNCELENİYOR',
  REVIEW = 'KONTROL',
  COMPLETED = 'TAMAMLANDI',
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
