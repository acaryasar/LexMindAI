import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LegalWritingDto {
  @IsNotEmpty({ message: 'Yazı tipi zorunludur' })
  @IsString()
  writingType: string;

  @IsNotEmpty({ message: 'Konu zorunludur' })
  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  caseId?: string;
}
