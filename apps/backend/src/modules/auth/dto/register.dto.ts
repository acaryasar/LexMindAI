import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @IsNotEmpty({ message: 'E-posta adresi zorunludur' })
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(12, { message: 'Şifre en az 12 karakter olmalıdır' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir',
  })
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
