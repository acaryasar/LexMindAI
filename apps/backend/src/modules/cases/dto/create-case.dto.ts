import { IsString, IsNotEmpty, IsOptional, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCaseDto {
  @IsNotEmpty({ message: 'Dava numarası zorunludur' })
  @IsString()
  caseNumber: string;

  @IsNotEmpty({ message: 'Dava başlığı zorunludur' })
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Durum zorunludur' })
  @IsString()
  status: string;

  @IsNotEmpty({ message: 'Dava tipi zorunludur' })
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  courtName?: string;

  @IsOptional()
  @IsString()
  courtCity?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  clientIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lawyerIds?: string[];
}
