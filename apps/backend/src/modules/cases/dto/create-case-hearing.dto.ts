import { IsString, IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCaseHearingDto {
  @IsNotEmpty({ message: 'Tarih zorunludur' })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
