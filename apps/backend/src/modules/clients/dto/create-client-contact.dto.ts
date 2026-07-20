import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateClientContactDto {
  @IsNotEmpty({ message: 'Tip zorunludur' })
  @IsString()
  type: string;

  @IsNotEmpty({ message: 'Değer zorunludur' })
  @IsString()
  value: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
