import { IsString, IsNotEmpty, IsOptional, IsArray, IsEmail } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty({ message: 'Ad zorunludur' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'Soyad zorunludur' })
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  taxNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
