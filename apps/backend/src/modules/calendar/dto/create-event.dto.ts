import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsNumber, IsEnum, IsArray, IsUUID } from 'class-validator';

export enum EventType {
  HEARING = 'HEARING',
  MEETING = 'MEETING',
  DEADLINE = 'DEADLINE',
  REMINDER = 'REMINDER',
  CLIENT_MEETING = 'CLIENT_MEETING',
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  INTERNAL_MEETING = 'INTERNAL_MEETING',
  PHONE_CALL = 'PHONE_CALL',
  VIDEO_CALL = 'VIDEO_CALL',
  OTHER = 'OTHER',
}

export class CreateEventDto {
  @ApiProperty({ description: 'Etkinlik başlığı' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Etkinlik tarihi' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Etkinlik saati', required: false })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({ description: 'Süre (dakika)', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ description: 'Konum', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Notlar', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Etkinlik türü', enum: EventType })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ description: 'Dava ID (HEARING için zorunlu)', required: false })
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @ApiProperty({ description: 'Katılımcı kullanıcı IDleri', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds?: string[];
}
