import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @IsNotEmpty({ message: 'E-posta adresi zorunludur' })
  email: string;
}
