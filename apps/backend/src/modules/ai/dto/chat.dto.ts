import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ChatDto {
  @IsNotEmpty({ message: 'Mesaj zorunludur' })
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentIds?: string[];
}
