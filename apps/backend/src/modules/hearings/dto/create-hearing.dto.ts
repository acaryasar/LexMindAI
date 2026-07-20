import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateHearingDto {
  @ApiProperty({ description: 'Dava ID' })
  @IsString()
  caseId: string;

  @ApiProperty({ description: 'Duruşma tarihi' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Duruşma saati', required: false })
  @IsString()
  @IsOptional()
  time?: string;

  @ApiProperty({ description: 'Duruşma konumu', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'Duruşma notları', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
