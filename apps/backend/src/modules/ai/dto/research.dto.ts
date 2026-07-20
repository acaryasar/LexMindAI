import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ResearchDto {
  @IsNotEmpty({ message: 'Arama sorgusu zorunludur' })
  @IsString()
  query: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentIds?: string[];

  @IsOptional()
  @IsString()
  caseId?: string;
}
