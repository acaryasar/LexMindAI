import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Açıklama' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Tutar' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Kategori' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Tarih' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Fiş', required: false })
  @IsString()
  receipt?: string;
}
