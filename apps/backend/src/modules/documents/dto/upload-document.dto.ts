import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class UploadDocumentDto {
  @IsNotEmpty({ message: 'Dosya adı zorunludur' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  folderId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}
