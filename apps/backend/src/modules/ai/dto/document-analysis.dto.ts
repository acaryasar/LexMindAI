import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DocumentAnalysisDto {
  @IsNotEmpty({ message: 'Doküment ID zorunludur' })
  @IsString()
  documentId: string;

  @IsOptional()
  @IsString()
  analysisType?: string;

  @IsOptional()
  @IsString()
  prompt?: string;
}
