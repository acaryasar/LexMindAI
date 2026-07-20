import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @IsNotEmpty({ message: 'E-posta adresi zorunludur' })
  email: string;

  @IsNotEmpty({ message: 'Şifre zorunludur' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir',
  })
  password: string;

  @IsNotEmpty({ message: 'Ad zorunludur' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'Soyad zorunludur' })
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
