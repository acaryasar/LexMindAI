import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @IsNotEmpty({ message: 'E-posta adresi zorunludur' })
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsNotEmpty({ message: 'Ad zorunludur' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'Soyad zorunludur' })
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  role?: string;
}
