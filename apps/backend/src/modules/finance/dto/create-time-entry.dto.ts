import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTimeEntryDto {
  @ApiProperty({ description: 'Kullanıcı ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Dava ID', required: false })
  @IsOptional()
  @IsString()
  caseId?: string;

  @ApiProperty({ description: 'Açıklama' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Saat' })
  @IsNumber()
  hours: number;

  @ApiProperty({ description: 'Tarih' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Faturalandırılabilir', required: false })
  @IsOptional()
  @IsBoolean()
  billable?: boolean;
}
