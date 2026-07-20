import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateHearingDto {
  @ApiProperty({ description: 'Duruşma tarihi', required: false })
  @IsDateString()
  @IsOptional()
  date?: string;

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
